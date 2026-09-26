'use strict';

/*
 * SINZU BOT - Hardened Auto.js 2026
 * Focus:
 * - Faster command lookup
 * - In-memory history/database cache
 * - Safer file writes
 * - Better session recovery
 * - Graceful shutdown
 * - Duplicate-thread protection
 * - Safer event handling
 * - Existing command compatibility
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cron = require('node-cron');
const login = require('ws3-fca');

const app = express();

const ROOT = __dirname;
const SCRIPT_DIR = path.join(ROOT, 'script');
const DATA_DIR = path.join(ROOT, 'data');
const SESSION_DIR = path.join(DATA_DIR, 'session');
const CACHE_DIR = path.join(SCRIPT_DIR, 'cache');

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const DATABASE_FILE = path.join(DATA_DIR, 'database.json');
const DEV_FILE = path.join(ROOT, 'dev.json');

const PORT = Number(process.env.PORT || 3000);

/* =========================================================
 * UTILITIES
 * ========================================================= */

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, fallback, 'utf8');
  }
}

function safeJSONParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return safeJSONParse(fs.readFileSync(file, 'utf8'), fallback);
  } catch (error) {
    console.error(
      chalk.red(`[JSON] ${path.basename(file)}: ${error.message}`)
    );
    return fallback;
  }
}

async function writeJSON(file, data) {
  const temp = `${file}.tmp`;

  try {
    await fsp.writeFile(
      temp,
      JSON.stringify(data, null, 2),
      'utf8'
    );

    await fsp.rename(temp, file);
  } catch (error) {
    try {
      if (fs.existsSync(temp)) {
        await fsp.unlink(temp);
      }
    } catch {}

    console.error(
      chalk.red(`[WRITE] ${path.basename(file)}: ${error.message}`)
    );

    throw error;
  }
}

function normalizeCommand(value) {
  return String(value || '').trim().toLowerCase();
}

/* =========================================================
 * DIRECTORIES / FILES
 * ========================================================= */

ensureDir(DATA_DIR);
ensureDir(SESSION_DIR);
ensureDir(CACHE_DIR);
ensureDir(SCRIPT_DIR);

if (!fs.existsSync(CONFIG_FILE)) {
  createConfig();
}

ensureFile(HISTORY_FILE, '[]');
ensureFile(DATABASE_FILE, '[]');
ensureFile(DEV_FILE, '[]');

/* =========================================================
 * CONFIG
 * ========================================================= */

let config = readJSON(CONFIG_FILE, null);

if (!Array.isArray(config) || !config[0]) {
  config = createConfig();
}

const botConfig = config[0];

const dev = readJSON(DEV_FILE, []);

const fcaOptions = {
  forceLogin: true,
  listenEvents: true,
  logLevel: 'silent',
  updatePresence: true,
  selfListen: true,
  online: true,
  autoMarkDelivery: false,
  autoMarkRead: false,
  ...(botConfig.fcaOption || {})
};

const masterAdmins = Array.isArray(botConfig.masterKey?.admin)
  ? botConfig.masterKey.admin.map(String)
  : [];

/* =========================================================
 * RUNTIME STATE
 * ========================================================= */

const Utils = {
  commands: new Map(),
  handleEvent: new Map(),
  account: new Map(),
  cooldowns: new Map(),

  // Fast alias lookup.
  commandIndex: new Map(),

  // Thread administrator cache.
  threadAdmins: new Map(),

  // Runtime sessions.
  sessions: new Map(),

  // Reconnect timers.
  reconnectTimers: new Map(),

  // Prevent simultaneous thread creation.
  threadCreation: new Map()
};

/* =========================================================
 * DATA CACHE
 * ========================================================= */

let historyCache = readJSON(HISTORY_FILE, []);
let databaseCache = readJSON(DATABASE_FILE, []);

if (!Array.isArray(historyCache)) historyCache = [];
if (!Array.isArray(databaseCache)) databaseCache = [];

let historyWriteTimer = null;
let databaseWriteTimer = null;

function scheduleHistorySave() {
  if (historyWriteTimer) return;

  historyWriteTimer = setTimeout(async () => {
    historyWriteTimer = null;

    try {
      await writeJSON(HISTORY_FILE, historyCache);
    } catch (error) {
      console.error(
        chalk.red(`[HISTORY] ${error.message}`)
      );
    }
  }, 500);
}

function scheduleDatabaseSave() {
  if (databaseWriteTimer) return;

  databaseWriteTimer = setTimeout(async () => {
    databaseWriteTimer = null;

    try {
      await writeJSON(DATABASE_FILE, databaseCache);
    } catch (error) {
      console.error(
        chalk.red(`[DATABASE] ${error.message}`)
      );
    }
  }, 500);
}

function getHistoryUser(userid) {
  return historyCache.find(
    item => String(item?.userid) === String(userid)
  );
}

function getBlacklist(userid) {
  const user = getHistoryUser(userid);

  return Array.isArray(user?.blacklist)
    ? user.blacklist.map(String)
    : [];
}

/* =========================================================
 * COMMAND LOADER
 * ========================================================= */

function registerCommand(commandConfig, run, handleEvent, sourceFile) {
  if (!commandConfig) return;

  const normalized = {};

  for (const [key, value] of Object.entries(commandConfig)) {
    normalized[key.toLowerCase()] = value;
  }

  const name = normalized.name;

  if (!name) {
    console.error(
      chalk.yellow(
        `[COMMAND] Missing name in ${sourceFile}`
      )
    );
    return;
  }

  const aliases = Array.isArray(normalized.aliases)
    ? [...normalized.aliases]
    : [];

  aliases.push(name);

  const uniqueAliases = [
    ...new Set(
      aliases
        .filter(Boolean)
        .map(normalizeCommand)
    )
  ];

  const command = {
    name: String(name),
    role: normalized.role ?? 0,
    run,
    aliases: uniqueAliases,
    description: normalized.description || '',
    usage: normalized.usage || '',
    version: normalized.version || '1.0.0',
    hasPrefix:
      normalized.hasprefix === undefined
        ? true
        : normalized.hasprefix,
    credits: normalized.credits || '',
    cooldown: Number(normalized.cooldown ?? 5),
    dev: Boolean(normalized.dev)
  };

  if (run) {
    Utils.commands.set(command.name.toLowerCase(), command);
  }

  if (handleEvent) {
    Utils.handleEvent.set(command.name.toLowerCase(), {
      ...command,
      handleEvent
    });
  }

  for (const alias of uniqueAliases) {
    Utils.commandIndex.set(
      normalizeCommand(alias),
      command
    );
  }

  console.log(
    chalk.green(
      `[LOAD] ${command.name} ${chalk.gray(`v${command.version}`)}`
    )
  );
}

function loadCommands() {
  if (!fs.existsSync(SCRIPT_DIR)) {
    console.log(chalk.yellow('[COMMAND] script directory missing.'));
    return;
  }

  const walk = directory => {
    for (const file of fs.readdirSync(directory)) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!file.endsWith('.js')) continue;

      try {
        delete require.cache[require.resolve(fullPath)];

        const loaded = require(fullPath);

        registerCommand(
          loaded.config,
          loaded.run,
          loaded.handleEvent,
          file
        );
      } catch (error) {
        console.error(
          chalk.red(
            `[LOAD ERROR] ${file}: ${error.stack || error.message}`
          )
        );
      }
    }
  };

  walk(SCRIPT_DIR);
}

loadCommands();

/* =========================================================
 * COMMAND LOOKUP
 * ========================================================= */

function getCommand(command) {
  return Utils.commandIndex.get(
    normalizeCommand(command)
  ) || null;
}

/* =========================================================
 * ACCOUNT MANAGEMENT
 * ========================================================= */

function addAccountRuntime(userid, info) {
  Utils.account.set(String(userid), {
    ...info,
    time: Number(info.time || 0)
  });
}

function removeAccountRuntime(userid) {
  const id = String(userid);

  Utils.account.delete(id);

  const timer = Utils.reconnectTimers.get(id);

  if (timer) {
    clearTimeout(timer);
    Utils.reconnectTimers.delete(id);
  }
}

function startAccountTimer(userid) {
  const id = String(userid);

  const old = Utils.sessions.get(id);

  if (old?.timeInterval) {
    clearInterval(old.timeInterval);
  }

  const timeInterval = setInterval(() => {
    const account = Utils.account.get(id);

    if (!account) {
      clearInterval(timeInterval);
      return;
    }

    account.time += 1;
  }, 1000);

  const session = Utils.sessions.get(id) || {};

  Utils.sessions.set(id, {
    ...session,
    timeInterval
  });
}

/* =========================================================
 * SESSION STORAGE
 * ========================================================= */

function getSessionFile(userid) {
  return path.join(
    SESSION_DIR,
    `${String(userid)}.json`
  );
}

async function saveSession(userid, state) {
  const file = getSessionFile(userid);

  await writeJSON(file, state);
}

async function deleteThisUser(userid) {
  const id = String(userid);

  const index = historyCache.findIndex(
    item => String(item?.userid) === id
  );

  if (index !== -1) {
    historyCache.splice(index, 1);
    scheduleHistorySave();
  }

  const sessionFile = getSessionFile(id);

  try {
    if (fs.existsSync(sessionFile)) {
      await fsp.unlink(sessionFile);
    }
  } catch (error) {
    console.error(
      chalk.yellow(
        `[SESSION DELETE] ${error.message}`
      )
    );
  }

  removeAccountRuntime(id);
}

/* =========================================================
 * THREAD DATABASE
 * ========================================================= */

function getThreadRecord(threadID) {
  const id = String(threadID);

  return databaseCache.find(
    item =>
      item &&
      typeof item === 'object' &&
      Object.prototype.hasOwnProperty.call(item, id)
  );
}

async function getThreadAdmins(threadID, api) {
  const id = String(threadID);

  const cached = Utils.threadAdmins.get(id);

  if (Array.isArray(cached)) {
    return cached;
  }

  const existing = getThreadRecord(id);

  if (existing && Array.isArray(existing[id])) {
    Utils.threadAdmins.set(id, existing[id]);
    return existing[id];
  }

  if (Utils.threadCreation.has(id)) {
    return Utils.threadCreation.get(id);
  }

  const promise = (async () => {
    try {
      const info = await api.getThreadInfo(id);

      const admins = Array.isArray(info?.adminIDs)
        ? info.adminIDs.map(String)
        : [];

      const index = databaseCache.findIndex(
        item =>
          item &&
          Object.prototype.hasOwnProperty.call(item, id)
      );

      const record = {
        [id]: admins
      };

      if (index === -1) {
        databaseCache.push(record);
      } else {
        databaseCache[index] = record;
      }

      Utils.threadAdmins.set(id, admins);

      scheduleDatabaseSave();

      return admins;
    } catch (error) {
      console.error(
        chalk.yellow(
          `[THREAD] ${id}: ${error.message}`
        )
      );

      return [];
    } finally {
      Utils.threadCreation.delete(id);
    }
  })();

  Utils.threadCreation.set(id, promise);

  return promise;
}

/* =========================================================
 * PERMISSION SYSTEM
 * ========================================================= */

function isMasterAdmin(userid) {
  return masterAdmins.includes(String(userid));
}

function isDeveloper(userid) {
  return dev.map(String).includes(String(userid));
}

async function isThreadAdmin(threadID, userid, api, providedAdmins = []) {
  const id = String(userid);

  if (isMasterAdmin(id)) return true;

  if (providedAdmins.map(String).includes(id)) {
    return true;
  }

  const admins = await getThreadAdmins(threadID, api);

  return admins.map(String).includes(id);
}

/* =========================================================
 * COMMAND EXECUTION
 * ========================================================= */

function checkCooldown(senderID, command, accountID) {
  const delay = Math.max(
    0,
    Number(command.cooldown || 0)
  );

  if (!delay) return {
    allowed: true
  };

  const key =
    `${senderID}_${command.name}_${accountID}`;

  const now = Date.now();
  const previous = Utils.cooldowns.get(key);

  if (!previous) {
    Utils.cooldowns.set(key, {
      timestamp: now
    });

    return {
      allowed: true
    };
  }

  const elapsed = now - previous.timestamp;
  const remaining = delay * 1000 - elapsed;

  if (remaining <= 0) {
    Utils.cooldowns.set(key, {
      timestamp: now
    });

    return {
      allowed: true
    };
  }

  return {
    allowed: false,
    remaining: Math.ceil(remaining / 1000)
  };
}

/* =========================================================
 * EVENT HANDLERS
 * ========================================================= */

async function dispatchHandleEvents({
  api,
  event,
  enableCommands,
  admin,
  prefix,
  blacklist
}) {
  for (const command of Utils.handleEvent.values()) {
    if (typeof command.handleEvent !== 'function') {
      continue;
    }

    try {
      await Promise.resolve(
        command.handleEvent({
          api,
          event,
          enableCommands,
          admin,
          prefix,
          blacklist,
          Utils
        })
      );
    } catch (error) {
      console.error(
        chalk.red(
          `[EVENT:${command.name}] ${error.stack || error.message}`
        )
      );
    }
  }
}

/* =========================================================
 * MESSAGE PROCESSOR
 * ========================================================= */

async function processEvent(
  api,
  event,
  userid,
  prefix,
  admin
) {
  if (!event || !event.threadID) {
    return;
  }

  const body =
    typeof event.body === 'string'
      ? event.body.trim()
      : '';

  const blacklist = getBlacklist(userid);

  let command = null;
  let args = [];

  /*
   * Detect possible command first.
   */
  if (body) {
    const firstWord =
      normalizeCommand(
        body.split(/\s+/)[0]
      );

    const directCommand =
      getCommand(
        firstWord.startsWith(normalizeCommand(prefix))
          ? firstWord.slice(String(prefix).length)
          : firstWord
      );

    command = directCommand;
  }

  /*
   * Handle prefix parsing.
   */
  let usedPrefix = prefix;

  if (body && command && command.hasPrefix === false) {
    usedPrefix = '';
  }

  if (body) {
    const prefixString =
      String(usedPrefix || '');

    if (
      prefixString &&
      body.toLowerCase().startsWith(
        prefixString.toLowerCase()
      )
    ) {
      const content =
        body
          .slice(prefixString.length)
          .trim();

      const parts =
        content
          ? content.split(/\s+/)
          : [];

      const commandName =
        normalizeCommand(parts.shift());

      command = getCommand(commandName);
      args = parts.map(arg => arg.trim());
    } else if (command?.hasPrefix === false) {
      const parts =
        body.split(/\s+/);

      const commandName =
        normalizeCommand(parts.shift());

      command = getCommand(commandName);
      args = parts.map(arg => arg.trim());
    } else {
      command = null;
    }
  }

  /*
   * No command = event handlers can still receive event.
   */
  if (!command) {
    await dispatchHandleEvents({
      api,
      event,
      enableCommands: {
        commands: [...Utils.commands.keys()],
        handleEvent: [...Utils.handleEvent.keys()]
      },
      admin,
      prefix,
      blacklist
    });

    return;
  }

  /*
   * Developer-only command.
   */
  if (command.dev && !isDeveloper(event.senderID)) {
    return api.sendMessage(
      'You dont have access to this command, you need to be a developer.',
      event.threadID,
      event.messageID
    );
  }

  /*
   * Permission checks.
   */
  const role = Number(command.role || 0);

  const masterAdmin =
    isMasterAdmin(event.senderID);

  if (role === 1 && !masterAdmin) {
    return api.sendMessage(
      "You don't have permission to use this command.",
      event.threadID,
      event.messageID
    );
  }

  if (role === 2) {
    const allowed =
      await isThreadAdmin(
        event.threadID,
        event.senderID,
        api,
        admin
      );

    if (!allowed) {
      return api.sendMessage(
        "You don't have permission to use this command.",
        event.threadID,
        event.messageID
      );
    }
  }

  if (role === 3 && !masterAdmin) {
    return api.sendMessage(
      "You don't have permission to use this command.",
      event.threadID,
      event.messageID
    );
  }

  /*
   * Blacklist.
   */
  if (
    blacklist.includes(
      String(event.senderID)
    )
  ) {
    return api.sendMessage(
      "We're sorry, but you've been banned from using bot. If you believe this is a mistake or would like to appeal, please contact one of the bot admins for further assistance.",
      event.threadID,
      event.messageID
    );
  }

  /*
   * Cooldown.
   */
  const cooldown =
    checkCooldown(
      event.senderID,
      command,
      userid
    );

  if (!cooldown.allowed) {
    return api.sendMessage(
      `Please wait ${cooldown.remaining} seconds before using the "${command.name}" command again.`,
      event.threadID,
      event.messageID
    );
  }

  /*
   * Execute command.
   */
  if (typeof command.run === 'function') {
    try {
      await Promise.resolve(
        command.run({
          api,
          event,
          args,
          enableCommands: {
            commands: [...Utils.commands.keys()],
            handleEvent: [...Utils.handleEvent.keys()]
          },
          admin,
          prefix,
          blacklist,
          Utils
        })
      );
    } catch (error) {
      console.error(
        chalk.red(
          `[COMMAND:${command.name}] ${error.stack || error.message}`
        )
      );
    }
  }

  /*
   * Event handlers.
   */
  await dispatchHandleEvents({
    api,
    event,
    enableCommands: {
      commands: [...Utils.commands.keys()],
      handleEvent: [...Utils.handleEvent.keys()]
    },
    admin,
    prefix,
    blacklist
  });
}

/* =========================================================
 * ACCOUNT LOGIN
 * ========================================================= */

async function accountLogin(
  state,
  enableCommands = [],
  prefix = '/',
  admin = []
) {
  if (!Array.isArray(state) || state.length === 0) {
    throw new Error('Invalid app state.');
  }

  return new Promise((resolve, reject) => {
    login(
      {
        appState: state
      },
      async (error, api) => {
        if (error) {
          reject(error);
          return;
        }

        let userid;

        try {
          userid = String(
            await api.getCurrentUserID()
          );
        } catch (err) {
          reject(err);
          return;
        }

        console.log(
          chalk.cyan(
            `[LOGIN] Connected account ${userid}`
          )
        );

        const historyUser =
          getHistoryUser(userid);

        const previousTime =
          Number(historyUser?.time || 0);

        try {
          const userInfo =
            await api.getUserInfo(userid);

          const info =
            userInfo?.[userid];

          if (!info?.name) {
            throw new Error(
              'Unable to retrieve account information.'
            );
          }

          addAccountRuntime(userid, {
            name: info.name,
            profileUrl: info.profileUrl || '',
            thumbSrc: info.thumbSrc || '',
            time: previousTime
          });

          startAccountTimer(userid);
        } catch (err) {
          reject(err);
          return;
        }

        /*
         * Persist session.
         */
        try {
          await addThisUser(
            userid,
            state,
            prefix,
            admin
          );
        } catch (err) {
          console.error(
            chalk.yellow(
              `[SESSION] ${err.message}`
            )
          );
        }

        /*
         * FCA options.
         */
        try {
          api.setOptions(fcaOptions);
        } catch (err) {
          console.error(
            chalk.yellow(
              `[OPTIONS] ${err.message}`
            )
          );
        }

        let listenerStarted = false;

        try {
          api.listenMqtt(
            async (listenError, event) => {
              if (listenError) {
                console.error(
                  chalk.yellow(
                    `[LISTENER:${userid}] ${listenError}`
                  )
                );

                scheduleReconnect(
                  userid,
                  state,
                  enableCommands,
                  prefix,
                  admin
                );

                return;
              }

              if (!event) return;

              try {
                await processEvent(
                  api,
                  event,
                  userid,
                  prefix,
                  admin
                );
              } catch (eventError) {
                console.error(
                  chalk.red(
                    `[EVENT:${userid}] ${eventError.stack || eventError.message}`
                  )
                );
              }
            }
          );

          listenerStarted = true;
        } catch (err) {
          console.error(
            chalk.red(
              `[LISTENER START] ${err.message}`
            )
          );

          scheduleReconnect(
            userid,
            state,
            enableCommands,
            prefix,
            admin
          );
        }

        if (listenerStarted) {
          console.log(
            chalk.green(
              `[ONLINE] ${userid}`
            )
          );
        }

        resolve(api);
      }
    );
  });
}

/* =========================================================
 * RECONNECT
 * ========================================================= */

function scheduleReconnect(
  userid,
  state,
  enableCommands,
  prefix,
  admin
) {
  const id = String(userid);

  if (Utils.reconnectTimers.has(id)) {
    return;
  }

  const timer = setTimeout(async () => {
    Utils.reconnectTimers.delete(id);

    try {
      console.log(
        chalk.yellow(
          `[RECONNECT] Attempting ${id}`
        )
      );

      await accountLogin(
        state,
        enableCommands,
        prefix,
        admin
      );
    } catch (error) {
      console.error(
        chalk.red(
          `[RECONNECT FAILED:${id}] ${error.message}`
        )
      );

      scheduleReconnect(
        id,
        state,
        enableCommands,
        prefix,
        admin
      );
    }
  }, 15000);

  Utils.reconnectTimers.set(id, timer);
}

/* =========================================================
 * SESSION HISTORY
 * ========================================================= */

async function addThisUser(
  userid,
  state,
  prefix,
  admin
) {
  const id = String(userid);

  let user =
    getHistoryUser(id);

  if (!user) {
    user = {
      userid: id,
      prefix: prefix || '',
      admin: Array.isArray(admin)
        ? admin
        : [],
      blacklist: [],
      enableCommands: {
        commands: [...Utils.commands.keys()],
        handleEvent: [...Utils.handleEvent.keys()]
      },
      time: 0
    };

    historyCache.push(user);
  } else {
    user.prefix = prefix || user.prefix || '';
    user.admin = Array.isArray(admin)
      ? admin
      : user.admin || [];

    user.enableCommands = {
      commands: [...Utils.commands.keys()],
      handleEvent: [...Utils.handleEvent.keys()]
    };
  }

  scheduleHistorySave();

  await saveSession(
    id,
    state
  );
}

/* =========================================================
 * EXPRESS
 * ========================================================= */

app.use(express.static(
  path.join(ROOT, 'public')
));

app.use(bodyParser.json({
  limit: '2mb'
}));

app.use(express.json({
  limit: '2mb'
}));

const routes = [
  {
    path: '/',
    file: 'index.html'
  },
  {
    path: '/step_by_step_guide',
    file: 'guide.html'
  },
  {
    path: '/online_user',
    file: 'online.html'
  }
];

for (const route of routes) {
  app.get(route.path, (req, res) => {
    res.sendFile(
      path.join(
        ROOT,
        'public',
        route.file
      )
    );
  });
}

/* =========================================================
 * API - ACCOUNT INFO
 * ========================================================= */

app.get('/info', (req, res) => {
  const data =
    Array.from(
      Utils.account.entries()
    ).map(([userid, account]) => ({
      userid,
      name: account.name,
      profileUrl: account.profileUrl,
      thumbSrc: account.thumbSrc,
      time: account.time
    }));

  res.json(data);
});

/* =========================================================
 * API - COMMANDS
 * ========================================================= */

app.get('/commands', (req, res) => {
  const commands =
    [...Utils.commands.values()]
      .map(command => ({
        name: command.name,
        aliases: command.aliases,
        role: command.role,
        version: command.version,
        description: command.description,
        usage: command.usage,
        credits: command.credits,
        cooldown: command.cooldown,
        dev: command.dev,
        hasPrefix: command.hasPrefix
      }));

  res.json({
    count: commands.length,
    commands
  });
});

/* =========================================================
 * API - LOGIN
 * ========================================================= */

app.post('/login', async (req, res) => {
  try {
    const {
      state,
      prefix = '/',
      admin = []
    } = req.body || {};

    if (!Array.isArray(state) || state.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Missing or invalid app state data.'
      });
    }

    const cUser =
      state.find(
        item => item?.key === 'c_user'
      );

    if (!cUser?.value) {
      return res.status(400).json({
        error: true,
        message: 'Invalid app state: c_user is missing.'
      });
    }

    const userid =
      String(cUser.value);

    if (Utils.account.has(userid)) {
      return res.status(400).json({
        error: true,
        message: 'Active user session detected; already logged in.',
        user: Utils.account.get(userid)
      });
    }

    const api =
      await accountLogin(
        state,
        [],
        prefix,
        admin
      );

    return res.status(200).json({
      success: true,
      message:
        'Authentication process completed successfully.',
      userid,
      connected: Boolean(api)
    });
  } catch (error) {
    console.error(
      chalk.red(
        `[LOGIN ERROR] ${error.stack || error.message}`
      )
    );

    return res.status(400).json({
      error: true,
      message: error.message || 'Login failed.'
    });
  }
});

/* =========================================================
 * SERVER
 * ========================================================= */

const server = app.listen(
  PORT,
  () => {
    console.log(
      chalk.green(
        `Server running on port ${PORT}`
      )
    );

    console.log(
      chalk.cyan(
        `Loaded commands: ${Utils.commands.size}`
      )
    );

    console.log(
      chalk.cyan(
        `Loaded event handlers: ${Utils.handleEvent.size}`
      )
    );

    main().catch(error => {
      console.error(
        chalk.red(
          `[MAIN] ${error.stack || error.message}`
        )
      );
    });
  }
);

/* =========================================================
 * MAIN SESSION LOADER
 * ========================================================= */

async function main() {
  if (!fs.existsSync(SESSION_DIR)) {
    await fsp.mkdir(
      SESSION_DIR,
      { recursive: true }
    );
  }

  const files =
    await fsp.readdir(
      SESSION_DIR
    );

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const userid =
      path.parse(file).name;

    const filePath =
      path.join(
        SESSION_DIR,
        file
      );

    try {
      const history =
        getHistoryUser(userid);

      if (!history) {
        await fsp.unlink(filePath);
        continue;
      }

      const state =
        readJSON(filePath, null);

      if (!Array.isArray(state)) {
        throw new Error(
          'Invalid saved session.'
        );
      }

      await accountLogin(
        state,
        history.enableCommands || [],
        history.prefix || '/',
        history.admin || []
      );
    } catch (error) {
      console.error(
        chalk.yellow(
          `[SESSION:${userid}] ${error.message}`
        )
      );

      /*
       * Don't immediately destroy the session on a temporary
       * connection failure.
       */
      scheduleReconnect(
        userid,
        readJSON(filePath, []),
        [],
        getHistoryUser(userid)?.prefix || '/',
        getHistoryUser(userid)?.admin || []
      );
    }
  }
}

/* =========================================================
 * CONFIG CREATOR
 * ========================================================= */

function createConfig() {
  const generated = [
    {
      masterKey: {
        admin: [],
        devMode: false,
        database: false,
        restartTime: 15
      },

      fcaOption: {
        forceLogin: true,
        listenEvents: true,
        logLevel: 'silent',
        updatePresence: true,
        selfListen: true,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        online: true,
        autoMarkDelivery: false,
        autoMarkRead: false
      }
    }
  ];

  ensureDir(DATA_DIR);

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(
      generated,
      null,
      2
    ),
    'utf8'
  );

  return generated;
}

/* =========================================================
 * PERIODIC SAVE / MAINTENANCE
 * ========================================================= */

const restartMinutes =
  Math.max(
    5,
    Number(
      botConfig.masterKey?.restartTime || 15
    )
  );

cron.schedule(
  `*/${restartMinutes} * * * *`,
  async () => {
    try {
      for (const user of historyCache) {
        if (!user?.userid) continue;

        const account =
          Utils.account.get(
            String(user.userid)
          );

        if (account) {
          user.time =
            Number(account.time || 0);
        }
      }

      await writeJSON(
        HISTORY_FILE,
        historyCache
      );

      await writeJSON(
        DATABASE_FILE,
        databaseCache
      );

      console.log(
        chalk.gray(
          '[MAINTENANCE] Runtime data saved.'
        )
      );
    } catch (error) {
      console.error(
        chalk.red(
          `[MAINTENANCE] ${error.message}`
        )
      );
    }
  }
);

/* =========================================================
 * MEMORY CLEANUP
 * ========================================================= */

setInterval(() => {
  const now = Date.now();

  /*
   * Remove expired cooldown entries.
   */
  for (
    const [key, value]
    of Utils.cooldowns
  ) {
    if (
      !value ||
      now - value.timestamp > 3600000
    ) {
      Utils.cooldowns.delete(key);
    }
  }
}, 10 * 60 * 1000);

/* =========================================================
 * GRACEFUL SHUTDOWN
 * ========================================================= */

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(
    chalk.yellow(
      `[SYSTEM] ${signal} received. Shutting down...`
    )
  );

  try {
    for (const session of Utils.sessions.values()) {
      if (session?.timeInterval) {
        clearInterval(
          session.timeInterval
        );
      }
    }

    for (const timer of Utils.reconnectTimers.values()) {
      clearTimeout(timer);
    }

    for (const user of historyCache) {
      if (!user?.userid) continue;

      const account =
        Utils.account.get(
          String(user.userid)
        );

      if (account) {
        user.time =
          Number(account.time || 0);
      }
    }

    await writeJSON(
      HISTORY_FILE,
      historyCache
    );

    await writeJSON(
      DATABASE_FILE,
      databaseCache
    );

    await new Promise(resolve => {
      server.close(() => resolve());
    });

    console.log(
      chalk.green(
        '[SYSTEM] Shutdown complete.'
      )
    );
  } catch (error) {
    console.error(
      chalk.red(
        `[SHUTDOWN] ${error.message}`
      )
    );
  } finally {
    process.exit(0);
  }
}

process.on(
  'SIGINT',
  () => shutdown('SIGINT')
);

process.on(
  'SIGTERM',
  () => shutdown('SIGTERM')
);

/* =========================================================
 * PROCESS ERROR HANDLING
 * ========================================================= */

process.on(
  'unhandledRejection',
  error => {
    console.error(
      chalk.red(
        `[UNHANDLED REJECTION] ${
          error?.stack || error
        }`
      )
    );
  }
);

process.on(
  'uncaughtException',
  error => {
    console.error(
      chalk.red(
        `[UNCAUGHT EXCEPTION] ${
          error?.stack || error
        }`
      )
    );
  }
);
