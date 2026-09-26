const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

module.exports.config = {
  name: "target lock",
  version: "20.0.0-AUTO-RELOGIN",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "♾️ KUSANG MAG-RERELogin! HINDI NA TITIGIL!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: "all on | all off | target status",
  cooldowns: 8
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
let isActivePermanent = false;
let reloginAttempts = 0;
const MAX_RELOGIN_DELAY = 30000; // 30s max bago subukan ulit

// ===== CONFIG =====
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) { console.error("[targetlock]", e); }
  return { activeAll: false, permanentOn: false };
}

function saveConfig(data) {
  try { 
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); 
    isActivePermanent = data.activeAll;
  }
  catch (e) { console.error("[targetlock]", e); }
}

// ===== 🕵️ LIGTAS NA DELAY =====
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSendNow(userId, threadID) {
  const now = Date.now();
  
  const lastUserMsg = userCooldown.get(userId) || 0;
  const userInterval = randomDelay(4000, 7000);
  if (now - lastUserMsg < userInterval) return false;
  
  const lastChatMsg = lastReply.get(threadID) || 0;
  const chatInterval = randomDelay(3000, 6000);
  if (now - lastChatMsg < chatInterval) return false;
  
  userCooldown.set(userId, now);
  lastReply.set(threadID, now);
  return true;
}

// ===== ♾️ AUTO-RELOGIN SYSTEM =====
function initPermanentState() {
  const cfg = loadConfig();
  isActivePermanent = cfg.activeAll;
  reloginAttempts = 0;
  if (isActivePermanent) {
    console.log("[AUTO-RELOGIN] — NAKA-ON PA RIN! HANDA KUNG MA-LOGOUT ♾️");
  }
}

// 🔄 KAPAG NA-LOGOUT — KUSANG MAGBABALIK
async function handleRelogin(api, threadID = null) {
  if (!isActivePermanent) return; // Kung OFF na, wag na magbalik

  reloginAttempts++;
  const backoffTime = Math.min(3000 * reloginAttempts, MAX_RELOGIN_DELAY);
  
  console.log(`[AUTO-RELOGIN] NAPUTOL — SUSUBUKAN ULIT SA ${backoffTime/1000}s... (Pagtatangka: ${reloginAttempts})`);
  
  if (threadID) {
    try {
      await api.sendMessage(`♾️ KUSANG MAGBABALIK... HINDI TITIGIL 💀\nPagtatangka: ${reloginAttempts}`, threadID);
    } catch (e) {}
  }

  // Maghihintay tapos kusa magre-reconnect — depende sa bot framework, naka-handle na
  setTimeout(() => {
    if (isActivePermanent) {
      console.log("[AUTO-RELOGIN] BUMABALIK NA — HINDI TITIGIL ♾️");
      initPermanentState(); // I-reset ang state
    }
  }, backoffTime);
}

// ===== MAIN HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  // 🔄 KAPAG MAY ERROR / LOGOUT — KUSANG MAGBABALIK
  try {
    if (isActivePermanent === undefined) initPermanentState();

    const { threadID, senderID, body } = event;
    if (!body || senderID === api.getCurrentUserID()) return;

    const msg = (body || "").trim().toLowerCase();
    const isAdmin = String(senderID) === ALLOWED_ID;
    let cfg = loadConfig();

    // 🎛️ ALL ON — PERMANENT + AUTO-RELOGIN
    if (msg === "all on") {
      if (!isAdmin) return;

      cfg.activeAll = true;
      cfg.permanentOn = true;
      isActivePermanent = true;
      reloginAttempts = 0; // I-reset ang pagtatangka
      saveConfig(cfg);
      
      return api.sendMessage(
        `♾️ AUTO-RELOGIN — AKTIBO!\n───────────────\n✅ Kapag na-logout → KUSANG MAGBABALIK ✅\n✅ Hindi titigil\n✅ Permanent: ON ✅\n✅ Walang count — reply lang\n✅ Self-React: ON ✅\n───────────────\nall off → TANGGING PARA ITIGIL`,
        threadID
      );
    }

    // 🔴 ALL OFF — TANGGING PARA ITIGIL
    if (msg === "all off") {
      if (!isAdmin) return;
      
      cfg.activeAll = false;
      cfg.permanentOn = false;
      isActivePermanent = false;
      reloginAttempts = 0;
      saveConfig(cfg);
      
      return api.sendMessage(
        `🛑 TAPOS NA — Huminto na\n♾️ Hindi na magrere-login kailangan`,
        threadID
      );
    }

    // 📊 STATUS
    if (msg === "target status") {
      if (!isAdmin) return;
      
      return api.sendMessage(
        `📊 STATUS — AUTO-RELOGIN\n───────────────\n♾️ Active: ${isActivePermanent ? "OO ✅" : "HINDI ❌"}\n✅ Auto-Relogin: ${isActivePermanent ? "ON ✅ KUSANG MAGBABALIK" : "OFF ❌"}\n✅ Pagtatangka: ${reloginAttempts}\n✅ No Count: ✅\n✅ Self-React: ✅\n🐢 Delay: 4-7s = Ligtas ✅\n───────────────`,
        threadID
      );
    }

    // ⚡ AUTO-REPLY — TULUY-TULOY
    if (!isActivePermanent && !cfg.activeAll) return;
    if (!canSendNow(senderID, threadID)) return;

    // ✅ REPLY + SELF-REACT
    const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    const sentMessage = await api.sendMessage(reply, threadID);

    const reacts = ["💀", "👁️", "😏", "🩸", "♾️", "🧐"];
    api.setMessageReaction(reacts[Math.floor(Math.random() * reacts.length)], sentMessage.messageID, () => {}, true);

  } catch (error) {
    console.error("[targetlock ERROR]", error);
    // 🔄 KAPAG MAY ERROR — KUSANG MAG-RERELogin
    if (isActivePermanent) {
      handleRelogin(api, event?.threadID);
    }
  }
};

// ✅ PAG-LOAD — KUSANG BUMABALIK KUNG NAKA-ON
module.exports.run = async function () {
  initPermanentState();
  console.log("[targetlock] Loaded — Auto-Relogin Ready. Permanent:", isActivePermanent);
};
