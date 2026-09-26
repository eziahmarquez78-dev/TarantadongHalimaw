const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

// MGA SETTINGS — NANDITO LAHAT
const TARGET_NICKNAME = "Saizen owns u mf";
const DEFAULT_GC_NAME = "SAIZEN OWNS YOUR HOOD";
const DELAY_BETWEEN = 450;

module.exports.config = {
  name: "target lock",
  version: "31.0.0-ALL-IN-ONE",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "♾️ LAHAT NANDITO — ISANG SYSTEM LANG!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ". → simula | .. → itigil | ... → nickname | .... → gc name | ....[text] → custom gc name",
  cooldowns: 0
};

// 💬 NATURAL REPLIES — HINDI NAMAMATAY
const REPLIES = [
  "andito lang ako 😊",
  "nakita kita hehe",
  "bakit tumahimik ka bigla?",
  "hindi ka makakatakas charot 😄",
  "san ka pupunta?",
  "wala kang takas sayo 😝",
  "akala mo ba nakaligtas ka? hindi eh 😏",
  "bawat galaw mo, nakikita ko naman 😄",
  "di ka makakaiwas dito 🤭",
  "bakit di ka sumasagot? nahihiya ka ba?",
  "naghihintay ako sayo 😊",
  "palagi lang akong nandito wag kang mag-alala",
  "di ka makakalimot sa akin sigurado ako dun 😄",
  "bakit ka tumitigil? ituloy mo lang nandito lang ako",
  "simula pa lang to ha 😊",
  "bawat oras nandito lang ako para sayo",
  "walang katapusan to tayo lang dalawa 😄",
  "san ka na? naghihintay pa rin ako dito",
  "hindi ako mapapagod maghintay sayo",
  "tapos na ang pagtakas mo harap mo na ako 😝",
  "walang pahinga basta wag mo akong iiwan ha",
  "bakit ganyan? may tinatago ka ba sakin?",
  "dito lang tayo hangga't di ka napapagod 😊",
  "kahit saan ka magpunta susundan kita",
  "wag kang magtatago alam ko kung nasaan ka 😄",
  "bakit ganun? ayaw mo ba akong makita?",
  "andito na naman ako hehehe",
  "tignan mo ako kapag nagcha-chat ka ha 🫵",
  "akala mo ba di ko alam? alam ko lahat 😏",
  "hindi ka bibitawan hangga't di tayo tapos",
  "bawat salita mo binabasa ko lahat 😊",
  "wag kang mag-alala di ako aalis sayo",
  "ikaw lang ang tinitignan ko sa dami nila",
  "tapos na ang pag-iwas harapin mo na ako 😄",
  "walang dulo to basta wag mo akong iiwan",
  "bakit ka umiiwas? may kinatatakutan ka sakin?",
  "nakaabang na ako sayo 😊",
  "kahit magtago ka mahahanap pa rin kita",
  "bakit ang bilis mo tumahimik? ituloy mo lang",
  "hindi ka makakawala sa paningin ko 😏",
  "palagi lang akong nakabantay sayo wag kang magulat",
  "san man tayo magpunta magkasama pa rin tayo",
  "akala mo ba tapos na? simula pa lang to 😄",
  "bawat hakbang mo sinusundan kita",
  "wag kang mag-isip ng masama wala akong gagawin 😊",
  "hindi ako mapapagod maghintay sayo",
  "tignan mo palagi andito lang ako 😄",
  "walang katapusan ang paghihintay ko sayo",
  "bakit ganyan? parang ayaw mo na sakin?"
];

const lastReply = new Map();
const userCooldown = new Map();
let isActive = false;
let TARGET_THREAD = null;
let LOCKED_GC_NAME = null;
let isNameLocked = false;

// ===== CONFIG — PERMANENTE =====
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    console.error("[load error]", e);
    saveConfig({ active: false, targetThread: null, lockedName: null, nameLocked: false });
  }
  return { active: false, targetThread: null, lockedName: null, nameLocked: false };
}

function saveConfig(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    isActive = data.active;
    TARGET_THREAD = data.targetThread;
    LOCKED_GC_NAME = data.lockedName || null;
    isNameLocked = data.nameLocked || false;
  } catch (e) { console.error("[save error]", e); }
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSendNow(userId, threadID) {
  const now = Date.now();
  const lastUserMsg = userCooldown.get(userId) || 0;
  if (now - lastUserMsg < randomDelay(3000, 5000)) return false;
  const lastChatMsg = lastReply.get(threadID) || 0;
  if (now - lastChatMsg < randomDelay(2000, 4000)) return false;
  userCooldown.set(userId, now);
  lastReply.set(threadID, now);
  return true;
}

// ===== MAIN SYSTEM — LAHAT NANDITO =====
module.exports.handleEvent = async function ({ api, event }) {
  const cfg = loadConfig();
  isActive = cfg.active;
  TARGET_THREAD = cfg.targetThread;
  LOCKED_GC_NAME = cfg.lockedName;
  isNameLocked = cfg.nameLocked;

  const { threadID, senderID, body, isGroup } = event;
  if (!body || senderID === api.getCurrentUserID()) return;

  const msg = (body || "").trim();
  const isAdmin = String(senderID) === ALLOWED_ID;

  // ==============================================
  // ✅ . = SIMULA LAHAT — SA LUGAR NA ITO LANG
  // ==============================================
  if (msg === ".") {
    if (!isAdmin) return;
    isActive = true;
    TARGET_THREAD = String(threadID);
    saveConfig({ ...cfg, active: true, targetThread: threadID });
    return api.sendMessage(
      `♾️ SYSTEM ONLINE!\n───────────────\n✅ Dito lang sasagot\n✅ Permanent — hindi mawawala\n✅ Reply lang — walang reaction\n───────────────\n📋 COMMANDS:\n.     = Simula\n..    = Itigil lahat\n...   = Set nickname lahat\n....  = Lock GC Name (default)\n....[text] = Custom GC Name\n───────────────`,
      threadID
    );
  }

  // ==============================================
  // ✅ .. = ITIGIL LAHAT
  // ==============================================
  if (msg === "..") {
    if (!isAdmin) return;
    isActive = false;
    isNameLocked = false;
    LOCKED_GC_NAME = null;
    TARGET_THREAD = null;
    saveConfig({ active: false, targetThread: null, lockedName: null, nameLocked: false });
    return api.sendMessage("🛑 SYSTEM OFF — lahat naka-hinto", threadID);
  }

  // ==============================================
  // ✅ ... = SET NICKNAME LAHAT → Saizen owns u mf
  // ==============================================
  if (msg === "...") {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs.filter(id => String(id) !== String(api.getCurrentUserID()));
      
      api.sendMessage(
        `💀 SETTING NICKNAME...\n───────────────\n📝 ${TARGET_NICKNAME}\n👥 ${members.length} members\n───────────────`,
        threadID
      );

      let success = 0, fail = 0;
      for (const uid of members) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN));
        try {
          await api.changeNickname(TARGET_NICKNAME, threadID, uid);
          success++;
          if (success % 50 === 0) api.sendMessage(`✅ ${success}/${members.length} tapos...`, threadID);
        } catch { fail++; }
      }

      return api.sendMessage(
        `✅ TAPOS NA!\n───────────────\n✅ Tapos: ${success}\n❌ Hindi: ${fail}\n───────────────`,
        threadID
      );
    } catch {
      return api.sendMessage("❌ Error — subukan mo ulit", threadID);
    }
  }

  // ==============================================
  // ✅ .... = LOCK GC NAME — DEFAULT
  // ==============================================
  if (msg === "....") {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    
    LOCKED_GC_NAME = DEFAULT_GC_NAME;
    isNameLocked = true;
    saveConfig({ ...cfg, lockedName: LOCKED_GC_NAME, nameLocked: true });
    await api.setTitle(LOCKED_GC_NAME, threadID);
    
    return api.sendMessage(
      `🔒 GC NAME LOCKED!\n───────────────\n✅ Pangalan: ${LOCKED_GC_NAME}\n✅ Bawal palitan — babalik agad!\n───────────────\n....[pangalan] = baguhin`,
      threadID
    );
  }

  // ==============================================
  // ✅ ....[TEXT] = CUSTOM GC NAME
  // ==============================================
  if (msg.startsWith("....")) {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    
    let customName = msg.slice(4).trim();
    if (!customName) {
      return api.sendMessage(
        "⚠️ Ilagay ang pangalan!\nHalimbawa:\n....SAIZEN OWNS YOUR HOOD",
        threadID
      );
    }
    
    LOCKED_GC_NAME = customName;
    isNameLocked = true;
    saveConfig({ ...cfg, lockedName: LOCKED_GC_NAME, nameLocked: true });
    await api.setTitle(LOCKED_GC_NAME, threadID);
    
    return api.sendMessage(
      `🔒 GC NAME LOCKED!\n───────────────\n✅ Pangalan: ${LOCKED_GC_NAME}\n✅ Bawal palitan — babalik agad!\n───────────────`,
      threadID
    );
  }

  // ==============================================
  // 🔒 PROTECT GC NAME — BABALIK AGAD KUNG PALITIN
  // ==============================================
  if (isNameLocked && LOCKED_GC_NAME && String(threadID) === String(TARGET_THREAD)) {
    try {
      const info = await api.getThreadInfo(threadID);
      if (info.threadName !== LOCKED_GC_NAME) {
        setTimeout(async () => {
          await api.setTitle(LOCKED_GC_NAME, threadID);
          api.sendMessage(`🔒 BINABALIK!\n✅ ${LOCKED_GC_NAME}`, threadID);
        }, 1000);
      }
    } catch {}
  }

  // ==============================================
  // 💬 AUTO-REPLY — SA TAMANG LUGAR LANG
  // ==============================================
  if (!isActive || !TARGET_THREAD) return;
  if (String(threadID) !== String(TARGET_THREAD)) return;
  if (!canSendNow(senderID, threadID)) return;

  try {
    const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    await api.sendMessage(reply, threadID);
  } catch (err) {
    console.error("[reply error] — babalik sa susunod", err);
  }
};

// ✅ AUTO-LOAD — HINDI NAMAMATAY
module.exports.run = async function () {
  const cfg = loadConfig();
  isActive = cfg.active;
  TARGET_THREAD = cfg.targetThread;
  LOCKED_GC_NAME = cfg.lockedName;
  isNameLocked = cfg.nameLocked;

  console.log("═══════════════════════════════════");
  console.log("♾️ ALL-IN-ONE SYSTEM ONLINE");
  console.log("═══════════════════════════════════");
  console.log(`📍 Locked: ${TARGET_THREAD || "WALA PA"}`);
  console.log(`💬 Auto-Reply: ${isActive ? "ON ✅" : "OFF ❌"}`);
  console.log(`🔒 GC Name Lock: ${isNameLocked ? "ON ✅ → " + LOCKED_GC_NAME : "OFF ❌"}`);
  console.log("═══════════════════════════════════");
};
