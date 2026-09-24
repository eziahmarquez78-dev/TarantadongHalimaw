const fs = require("fs");
const path = require("path");

// Allowed User ID para sa pag-control ng commands (halimaw on/off)
const ALLOWED_ID = "61594795855409";

module.exports.config = {
  name: "halimaw",
  version: "4.0.0",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "Tarantadong Halimaw - Auto-Reply + Idle Auto-Count 1-50 with Resibo",
  usePrefix: false,
  commandCategory: "Fun",
  usages: "halimaw [on | off | status]",
  cooldowns: 3
};

const DATA_PATH = path.join(__dirname, "halimaw_config.json");

// Idle Timers para sa bawat Thread/GC
const idleTimers = new Map();

// Listahan ng 100 "Seno" style replies
const ROASTS = [
  "asan na seno 🥷🩸",
  "andyan na seno 🥷🩸",
  "nandito na seno 🥷🩸",
  "nandoon na seno 🥷🩸",
  "umalis na seno 🥷🩸",
  "bumalik na seno 🥷🩸",
  "nawala na seno 🥷🩸",
  "lumitaw na seno 🥷🩸",
  "nahuli na seno 🥷🩸",
  "tumakas na seno 🥷🩸",
  "nagkubli na seno 🥷🩸",
  "nagtago na seno 🥷🩸",
  "sumulpot na seno 🥷🩸",
  "bumagsak na seno 🥷🩸",
  "nahulog na seno 🥷🩸",
  "umakyat na seno 🥷🩸",
  "bumaba na seno 🥷🩸",
  "tumakbo na seno 🥷🩸",
  "hinabol na seno 🥷🩸",
  "tumigil na seno 🥷🩸",
  "naglakad na seno 🥷🩸",
  "gumapang na seno 🥷🩸",
  "gumulong na seno 🥷🩸",
  "tumalon na seno 🥷🩸",
  "lumipad na seno 🥷🩸",
  "lumangoy na seno 🥷🩸",
  "naligaw na seno 🥷🩸",
  "nakauwi na seno 🥷🩸",
  "umuwi na seno 🥷🩸",
  "pumasok na seno 🥷🩸",
  "lumabas na seno 🥷🩸",
  "kumain na seno 🥷🩸",
  "nagutom na seno 🥷🩸",
  "nabundat na seno 🥷🩸",
  "nabusog na seno 🥷🩸",
  "nauhaw na seno 🥷🩸",
  "uminom na seno 🥷🩸",
  "nakatulog na seno 🥷🩸",
  "nagising na seno 🥷🩸",
  "nanaginip na seno 🥷🩸",
  "naghilik na seno 🥷🩸",
  "naligo na seno 🥷🩸",
  "nagsipilyo na seno 🥷🩸",
  "nagbihis na seno 🥷🩸",
  "nagpalit na seno 🥷🩸",
  "nagsuklay na seno 🥷🩸",
  "nag-ayos na seno 🥷🩸",
  "nagkape na seno 🥷🩸",
  "naglakwatsa na seno 🥷🩸",
  "nagpahinga na seno 🥷🩸",
  "napagod na seno 🥷🩸",
  "nainis na seno 🥷🩸",
  "nagulat na seno 🥷🩸",
  "natakot na seno 🥷🩸",
  "natawa na seno 🥷🩸",
  "umiyak na seno 🥷🩸",
  "ngumiti na seno 🥷🩸",
  "nag-isip na seno 🥷🩸",
  "nalito na seno 🥷🩸",
  "nakalimot na seno 🥷🩸",
  "naalala na seno 🥷🩸",
  "nagtaka na seno 🥷🩸",
  "nagtanong na seno 🥷🩸",
  "sumagot na seno 🥷🩸",
  "tumahimik na seno 🥷🩸",
  "nagsalita na seno 🥷🩸",
  "nagsinungaling na seno 🥷🩸",
  "umamin na seno 🥷🩸",
  "nag-deny na seno 🥷🩸",
  "nagparinig na seno 🥷🩸",
  "nagpanggap na seno 🥷🩸",
  "nagkunwari na seno 🥷🩸",
  "nagbiro na seno 🥷🩸",
  "nag-trip na seno 🥷🩸",
  "nag-troll na seno 🥷🩸",
  "nagkalat na seno 🥷🩸",
  "nag-ingay na seno 🥷🩸",
  "nagulo na seno 🥷🩸",
  "nag-away na seno 🥷🩸",
  "nakipagbati na seno 🥷🩸",
  "nakipag-usap na seno 🥷🩸",
  "nag-chat na seno 🥷🩸",
  "nag-seen na seno 🥷🩸",
  "nag-reply na seno 🥷🩸",
  "nag-ghost na seno 🥷🩸",
  "nag-online na seno 🥷🩸",
  "nag-offline na seno 🥷🩸",
  "nag-log out na seno 🥷🩸",
  "nag-delete na seno 🥷🩸",
  "nagbalik na seno 🥷🩸",
  "nag-respawn na seno 🥷🩸",
  "nag-revive na seno 🥷🩸",
  "nag-AFK na seno 🥷🩸",
  "nag-quit na seno 🥷🩸",
  "nag-rage quit na seno 🥷🩸",
  "nag-logout na seno 🥷🩸",
  "nagtataka pa seno 🥷🩸",
  "naghihintay pa seno 🥷🩸",
  "bumabalik na seno 🥷🩸"
];

// Load Configuration File
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error loading config:", e);
  }
  return { active: false };
}

// Save Configuration File
function saveConfig(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving config:", e);
  }
}

// Helper: Function para mag-start ng 1-50 Count na may Resibo kapag walang nag-cha-chat
function startIdleCounting(api, threadID) {
  // Burahin ang lumang timer kung mayroon man
  if (idleTimers.has(threadID)) {
    clearTimeout(idleTimers.get(threadID));
  }

  // Mag-set ng timer: kapag walang nag-chat sa loob ng 10 seconds, magsisimula ang spam count 1-50
  const timer = setTimeout(async () => {
    const config = loadConfig();
    if (!config.active) return;

    // 1. Magpapadala muna ng isang Seno reply
    const randomSeno = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    api.sendMessage(`[IDLE TRIGGER] Walang nag-cha-chat kaya:\n\n${randomSeno}`, threadID);

    // 2. Magbibilang ng 1 hanggang 50 na may resibo
    for (let i = 1; i <= 50; i++) {
      // Re-check kung naka-active pa rin
      if (!loadConfig().active) break;

      const timeStamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
      const resiboText = `🧾 [RESIBO COUNT: ${i}/50]\n───────────────────\n🔢 Bilang: ${i}\n⏰ Time: ${timeStamp}\n🥷 Status: Active Seno Spam Count\n───────────────────`;

      api.sendMessage(resiboText, threadID);

      // Delay na 1.5 seconds bawat bilang para hindi ma-ban agad ng Facebook
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }, 10000); // 10 seconds idle time

  idleTimers.set(threadID, timer);
}

// ===== EVENT HANDLER (EVERY CHAT AUTO-RESPONDER) =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;

  // Huwag pansinin kapag walang body o kapag sariling chat ng bot
  if (!body || senderID === api.getCurrentUserID()) return;

  // Huwag pansinin kapag ang mismong command na "halimaw" ang tina-type
  if (body.toLowerCase().startsWith("halimaw")) return;

  const config = loadConfig();
  if (!config.active) return;

  // 1. BAWAT MAG-CHAT: Rereplayan agad ng bot ng random Seno
  const selectedRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  api.sendMessage(selectedRoast, threadID);

  // 2. I-reset ang Idle Timer dahil may nag-chat na
  startIdleCounting(api, threadID);
};

// ===== COMMAND CONTROLLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // ID Restriction Validation
  if (String(senderID) !== ALLOWED_ID) {
    return api.sendMessage(
      "❌ Wala kang permiso para gamitin ang command na ito.",
      threadID,
      messageID
    );
  }

  const sub = (args[0] || "").toLowerCase();
  const config = loadConfig();

  if (sub === "on") {
    config.active = true;
    saveConfig(config);

    // Simulan din ang Idle Timer
    startIdleCounting(api, threadID);

    return api.sendMessage(
      "🥷🩸 TARANTADONG HALIMAW (AUTO-REPLY + TIKAS COUNT 1-50): ACTIVATED\n" +
      "───────────────────\n" +
      "🩸 Mode: Instant Reply sa Lahat ng Mag-chat\n" +
      "🥷 Idle Mode: 1 Seno + 1-50 Count with Resibo (pag walang nagchachat)\n" +
      "🩸 Prefix: No Prefix\n" +
      "───────────────────\n" +
      "🩸 Gamitin ang `halimaw off` para i-turn off.",
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    config.active = false;
    saveConfig(config);

    // I-clear ang timer kapag in-off
    if (idleTimers.has(threadID)) {
      clearTimeout(idleTimers.get(threadID));
      idleTimers.delete(threadID);
    }

    return api.sendMessage(
      "🥷🩸 TARANTADONG HALIMAW: DISABLED\n" +
      "───────────────────\n" +
      "Napatay na ang auto-responder at idle counter.",
      threadID,
      messageID
    );
  }

  if (sub === "status") {
    const isRunning = config.active;
    const statusSymbol = isRunning ? "🥷🩸 ONLINE (ACTIVE)" : "🛑 OFFLINE";

    return api.sendMessage(
      "📊 TARANTADONG HALIMAW STATUS\n" +
      "───────────────────\n" +
      `• Status: ${statusSymbol}\n` +
      `• Target: Lahat ng mag-chat\n` +
      `• Idle Feature: Auto-count 1-50 with Resibo\n` +
      "───────────────────",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    "🥷🩸 TARANTADONG HALIMAW PANEL\n" +
    "───────────────────\n" +
    "▶️ halimaw on  — Simulan ang auto-reply at idle count\n" +
    "⏸️ halimaw off — I-off ang bot\n" +
    "📈 halimaw status — I-check ang status\n" +
    "───────────────────",
    threadID,
    messageID
  );
};
