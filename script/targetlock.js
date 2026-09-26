const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

module.exports.config = {
  name: "target lock",
  version: "25.0.0-NO-SELF-REACT",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "💬 . = simula | .. = itigil — WALANG REACTION",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ". → simula | .. → itigil",
  cooldowns: 8
};

// 💬 NATURAL — PARANG TAO LANG
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

// ===== CONFIG =====
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) { console.error("[targetlock]", e); }
  return { active: false, targetThread: null };
}

function saveConfig(data) {
  try { 
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); 
    isActive = data.active;
    TARGET_THREAD = data.targetThread;
  }
  catch (e) { console.error("[targetlock]", e); }
}

// ===== DELAY =====
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSendNow(userId, threadID) {
  const now = Date.now();
  const lastUserMsg = userCooldown.get(userId) || 0;
  if (now - lastUserMsg < randomDelay(3500, 6000)) return false;
  
  const lastChatMsg = lastReply.get(threadID) || 0;
  if (now - lastChatMsg < randomDelay(2500, 5000)) return false;
  
  userCooldown.set(userId, now);
  lastReply.set(threadID, now);
  return true;
}

// ===== MAIN HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, isGroup } = event;
  if (!body || senderID === api.getCurrentUserID()) return;

  const msg = (body || "").trim();
  const isAdmin = String(senderID) === ALLOWED_ID;
  let cfg = loadConfig();

  // ✅ TULDOK LANG = SIMULA
  if (msg === ".") {
    if (!isAdmin) return;

    isActive = true;
    TARGET_THREAD = String(threadID);
    cfg.active = true;
    cfg.targetThread = TARGET_THREAD;
    saveConfig(cfg);

    const type = isGroup ? "GC/GROUP" : "PM/CHAT";
    return api.sendMessage(
      `💬 SIMULA NA!\n───────────────\n✅ Dito lang: ${type}\n✅ Sa iba — WALA ✅\n✅ Reply lang — WALANG REACTION ✅\n✅ Natural na pagsasalita ✅\n───────────────\n.. → itigil`,
      threadID
    );
  }

  // ✅ DALAWANG TULDOK = ITIGIL
  if (msg === "..") {
    if (!isAdmin) return;
    
    isActive = false;
    TARGET_THREAD = null;
    cfg.active = false;
    cfg.targetThread = null;
    saveConfig(cfg);
    
    return api.sendMessage("🛑 TAPOS NA — huminto na", threadID);
  }

  // 💬 SASAGOT LANG SA TAMANG LUGAR
  if (!isActive || !TARGET_THREAD) return;
  if (String(threadID) !== String(TARGET_THREAD)) return;
  if (!canSendNow(senderID, threadID)) return;

  // ✅ REPLY LANG — WALANG REACTION!
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  await api.sendMessage(reply, threadID);
};

module.exports.run = async function () {
  const cfg = loadConfig();
  isActive = cfg.active;
  TARGET_THREAD = cfg.targetThread;
  console.log("[targetlock] Loaded — Locked:", TARGET_THREAD, "Active:", isActive);
};
