const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

module.exports.config = {
  name: "target lock",
  version: "18.0.0-PURE-AUTO-REPLY",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "♾️ PURE AUTO-REPLY — Walang Count, Walang Session, Walang Limit!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: "all on | all off | target status",
  cooldowns: 12
};

// 💀 MARAMING REPLY — HINDI PAULIT-ULIT
const REPLIES = [
  "andito lang ako 😏",
  "nakita kita 👀",
  "bakit tumahimik ka? 🤔",
  "hindi ka makakatakas 💀",
  "san ka pupunta? 🫵",
  "wala kang takas 😈",
  "akala mo ba nakaligtas ka? hindi 😏",
  "bawat galaw mo, alam ko 💀",
  "di ka makakaiwas 🩸",
  "bakit di ka sumasagot? nahihiya ka ba? 🤭",
  "naghihintay ako sayo ♾️",
  "palagi lang akong nandito 🧐",
  "di ka makakalimot sa akin 💀",
  "bakit ka tumitigil? ituloy mo lang 😏",
  "simula pa lang ito 👁️",
  "bawat oras, nakatutok ako sayo 💀",
  "walang katapusan, tuloy lang 🩸",
  "san ka na? naghihintay pa rin ako 😈",
  "hindi ako mapapagod 💀",
  "tapos na ang pagtakas mo 🫵",
  "walang pahinga, walang hangganan 💀",
  "bakit ganyan? may tinatago ka ba? 😏",
  "dito lang tayo hangga't di ka napapagod 👀",
  "kahit saan ka magpunta, susundan kita 💀",
  "wag kang magtatago, alam ko kung nasaan ka 🩸",
  "bakit ganun? ayaw mo ba akong makita? 🤔",
  "andito na naman ako 😏",
  "tignan mo ako kapag nagcha-chat ka 🫵",
  "akala mo ba di ko alam? alam ko lahat 💀",
  "hindi ka bibitawan hangga't di tayo tapos 🩸",
  "bawat salita mo, naririnig ko 👁️",
  "wag kang mag-alala, di ako aalis 😈",
  "ikaw lang ang tinitignan ko 💀",
  "tapos na ang pag-iwas, harapin mo na 😏",
  "walang dulo, walang hanggan ♾️",
  "bakit ka umiiwas? may kinatatakutan ka? 🤭",
  "nakaabang na ako 👀",
  "kahit magtago ka, mahahanap pa rin kita 💀",
  "bakit ang bilis mo tumahimik? ituloy mo lang 🩸",
  "hindi ka makakawala sa paningin ko 😏",
  "palagi lang akong nakabantay 🧐",
  "san man tayo magpunta, magkasama pa rin 😈",
  "akala mo ba tapos na? simula pa lang 💀",
  "bawat hakbang mo, sinusundan ko 🩸",
  "wag kang mag-isip ng masama, alam ko lahat 👁️",
  "hindi ako mapapagod maghintay sayo 💀",
  "tignan mo palagi, andito lang ako 😏",
  "walang katapusan ang paghihintay ko sayo ♾️",
  "bakit ganyan? parang ayaw mo na 🤔"
];

const lastReply = new Map();
const userCooldown = new Map();

// ===== CONFIG =====
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) { console.error("[targetlock]", e); }
  return { activeAll: false };
}

function saveConfig(data) {
  try { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); }
  catch (e) { console.error("[targetlock]", e); }
}

// ===== 🕵️ LIGTAS NA DELAY =====
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSendNow(userId, threadID) {
  const now = Date.now();
  
  // Bawat tao — 4-7s pagitan
  const lastUserMsg = userCooldown.get(userId) || 0;
  const userInterval = randomDelay(4000, 7000);
  if (now - lastUserMsg < userInterval) return false;
  
  // Buong chat — 3-6s pagitan
  const lastChatMsg = lastReply.get(threadID) || 0;
  const chatInterval = randomDelay(3000, 6000);
  if (now - lastChatMsg < chatInterval) return false;
  
  userCooldown.set(userId, now);
  lastReply.set(threadID, now);
  return true;
}

// ===== MAIN HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!body || senderID === api.getCurrentUserID()) return;

  const msg = (body || "").trim().toLowerCase();
  const isAdmin = String(senderID) === ALLOWED_ID;
  const cfg = loadConfig();

  // 🎛️ ON — WALANG SESSION, WALANG COUNT
  if (msg === "all on") {
    if (!isAdmin) return;

    cfg.activeAll = true;
    saveConfig(cfg);
    return api.sendMessage(
      `♾️ AUTO-REPLY — ON!\n───────────────\n✅ Lahat aatakihin\n✅ Walang Auto-Count ✅\n✅ Walang Session Login ✅\n✅ Self-React sa sarili ✅\n✅ Walang Limitasyon ✅\n🛡️ Undetectable: LIGTAS ✅\n───────────────\nall off → itigil`,
      threadID
    );
  }

  // 🔴 OFF
  if (msg === "all off") {
    if (!isAdmin) return;
    cfg.activeAll = false;
    saveConfig(cfg);
    return api.sendMessage("🛑 TAPOS NA — huminto na", threadID);
  }

  // 📊 STATUS
  if (msg === "target status") {
    if (!isAdmin) return;
    return api.sendMessage(
      `📊 STATUS\n───────────────\n♾️ Active: ${cfg.activeAll ? "OO ✅" : "HINDI ❌"}\n✅ Walang Count ✅\n✅ Walang Session ✅\n✅ Self-React ✅\n🐢 Delay: 4-7s = Ligtas ✅\n📝 Reply: ${REPLIES.length} ✅\n───────────────`,
      threadID
    );
  }

  // ⚡ AUTO-REPLY — TULUY-TULOY LANG
  if (!cfg.activeAll) return;
  if (!canSendNow(senderID, threadID)) return;

  // ✅ REPLY + SELF-REACT — YUN LANG, WALANG BILANG
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  const sentMessage = await api.sendMessage(reply, threadID);

  const reacts = ["💀", "👁️", "😏", "🩸", "♾️", "🧐"];
  api.setMessageReaction(reacts[Math.floor(Math.random() * reacts.length)], sentMessage.messageID, () => {}, true);
};

module.exports.run = async function () {};
