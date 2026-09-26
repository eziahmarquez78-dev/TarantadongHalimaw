const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

module.exports.config = {
  name: "target lock",
  version: "14.0.0-MORE-REPLIES",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "💀 MAS MARAMING REPLY — LAHAT AATAKIHIN + Anti-Spam!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: "all on | all off | target status",
  cooldowns: 8
};

// ==============================================
// 💀 MARAMING REPLY — 50+ NA! HINDI PAULIT-ULIT
// ==============================================
const REPLIES = [
  "andito lang ako, wag kang mag-alala 🩸",
  "nakita na kita, alam mo yan 👀",
  "bakit tumahimik ka bigla? may tinatago ka ba? 😏",
  "hindi ka makakatakas, alam mo naman yan 💀",
  "san ka pupunta? dito lang tayo ha 🫵",
  "wala kang takas sa paningin ko 👁️",
  "akala mo ba nakaligtas ka? hindi 😈",
  "bawat galaw mo, nakikita ko lahat 💀",
  "di ka makakaiwas, wag mo subukan 😏",
  "bakit di ka sumasagot? nahihiya ka ba? 🤭",
  "naghihintay ako sayo, walang hangganan ♾️",
  "palagi lang akong nandito, hindi aalis 💀",
  "isang beses, isang libong beses — parehas lang ako sayo 🩸",
  "di ka makakalimot sa akin, sigurado ako dyan 💀",
  "bakit ka tumitigil? ituloy mo lang, di ako aalis 👀",
  "simula pa lang ito, wag kang mag-aakalang tapos na 😈",
  "bawat oras, bawat minuto — nakatutok ako sayo 💀",
  "walang katapusan, tuloy lang tayo 😏",
  "san ka na? naghihintay pa rin ako dito 🧐",
  "hindi ako mapapagod, hindi ako titigil 💀",
  "tapos na ang pagtakas mo, harapin mo na 🩸",
  "walang pahinga, walang hangganan — ikaw lang ang layon ko 💀",
  "bakit ganyan ang tingin mo? parang may tinatago ka 😏",
  "dito lang tayo, hangga't di ka napapagod 👁️",
  "kahit saan ka magpunta, susundan kita 💀",
  "wag kang magtatago, alam ko kung nasaan ka 👀",
  "bakit ganun? ayaw mo ba akong makita? 🤔",
  "andito na naman ako, di ka makaiwas 😈",
  "tignan mo ako kapag nagcha-chat ka 🫵",
  "akala mo ba di ko alam ang ginagawa mo? alam ko 😏",
  "hindi ka bibitawan hangga't di tayo tapos 💀",
  "bawat salita mo, naririnig ko lahat 🩸",
  "wag kang mag-alala, di ako aalis kahit kailan 💀",
  "ikaw lang ang tinitignan ko sa dami nila 👀",
  "tapos na ang pag-iwas, harapin mo na 😈",
  "walang dulo, walang hanggan — ikaw lang 💀",
  "bakit ka umiiwas? may kinatatakutan ka ba? 😏",
  "nakaabang na ako, alam mo kung nasaan ako 👁️",
  "kahit magtago ka, mahahanap pa rin kita 💀",
  "bakit ang bilis mo tumahimik? ituloy mo lang 🩸",
  "hindi ka makakawala sa paningin ko ♾️",
  "palagi lang akong nakabantay, wag kang magulat 💀",
  "san man tayo magpunta, magkasama pa rin tayo 😏",
  "akala mo ba tapos na? simula pa lang ito 💀",
  "bawat hakbang mo, sinusundan ko lahat 🩸",
  "wag kang mag-isip ng masama, alam ko lahat 👀",
  "hindi ako mapapagod maghintay sayo 💀",
  "tignan mo palagi, andito lang ako 😈",
  "walang katapusan ang paghihintay ko sayo ♾️",
  "bakit ganyan? parang ayaw mo na 😏"
];

const idleTimers = new Map();
const countingState = new Map();
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

function stopAll(threadID) {
  if (idleTimers.has(threadID)) clearTimeout(idleTimers.get(threadID));
  idleTimers.delete(threadID);
  countingState.delete(threadID);
}

// ===== 🕵️ ANTI-SPAM — MATIBAY =====
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSendNow(userId, threadID) {
  const now = Date.now();
  
  // Bawal masyadong mabilis sa parehong tao
  const lastUserMsg = userCooldown.get(userId) || 0;
  const userInterval = randomDelay(2200, 4000);
  if (now - lastUserMsg < userInterval) return false;
  
  // Bawal sunod-sunod sa buong chat
  const lastChatMsg = lastReply.get(threadID) || 0;
  const chatInterval = randomDelay(1500, 3000);
  if (now - lastChatMsg < chatInterval) return false;
  
  userCooldown.set(userId, now);
  lastReply.set(threadID, now);
  return true;
}

// ===== ♾️ IDLE ATTACK =====
async function startIdleAttack(api, threadID) {
  stopAll(threadID);

  const timer = setTimeout(async () => {
    const cfg = loadConfig();
    if (!cfg.activeAll) return;

    countingState.set(threadID, true);
    
    const openers = [
      "😏 tahimik na... maghihintay ako sayo",
      "💀 walang tigil, nandito pa rin ako",
      "👁️ wag kang mag-aakalang nakaligtas ka",
      "♾️ simula pa lang, walang katapusan ito",
      "🩸 bakit tumahimik? di ako aalis hangga't di ka sumasagot"
    ];
    api.sendMessage(openers[Math.floor(Math.random() * openers.length)], threadID);

    while (countingState.has(threadID) && loadConfig().activeAll) {
      for (let i = 1; i <= 30; i++) {
        if (!countingState.has(threadID) || !loadConfig().activeAll) break;

        const time = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
        
        const resiboText = `♾️ BILANG: ${i}/30
───────────────
⏰ Oras: ${time}
💀 LAHAT AATAKIHIN
📝 Reply: MAS MARAMI ✅
🛡️ Anti-Spam: PROTECTED ✅
───────────────`;
        
        api.sendMessage(resiboText, threadID);
        await new Promise(r => setTimeout(r, randomDelay(3000, 5000)));
      }

      if (countingState.has(threadID) && loadConfig().activeAll) {
        await new Promise(r => setTimeout(r, randomDelay(5000, 10000)));
      }
    }
  }, 10000);

  idleTimers.set(threadID, timer);
}

// ===== MAIN HANDLER =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  if (!body || senderID === api.getCurrentUserID()) return;

  const msg = (body || "").trim().toLowerCase();
  const isAdmin = String(senderID) === ALLOWED_ID;
  const cfg = loadConfig();

  // 🎛️ COMMANDS — ADMIN LANG
  if (msg === "all on") {
    if (!isAdmin) return;

    cfg.activeAll = true;
    saveConfig(cfg);
    startIdleAttack(api, threadID);
    return api.sendMessage(
      `💀 LAHAT AATAKIHIN NA!\n───────────────\n✅ Mode: LAHAT NG MAGCHA-CHAT\n📝 Reply: 50+ NA — HINDI PAULIT-ULIT ✅\n🛡️ Anti-Spam: PROTECTED ✅\n♾️ Walang limitasyon: OO ✅\n───────────────\ni-type: all off → itigil`,
      threadID
    );
  }

  if (msg === "all off") {
    if (!isAdmin) return;
    cfg.activeAll = false;
    saveConfig(cfg);
    stopAll(threadID);
    return api.sendMessage("🛑 TAPOS NA — huminto na ang lahat 💀", threadID);
  }

  if (msg === "target status") {
    if (!isAdmin) return;
    return api.sendMessage(
      `📊 STATUS\n───────────────\n💀 LAHAT aatakihin: ${cfg.activeAll ? "OO ✅" : "HINDI ❌"}\n📝 Reply: ${REPLIES.length} NA ✅\n🛡️ Anti-Spam: ON ✅\n♾️ Walang limitasyon: ON ✅\n───────────────`,
      threadID
    );
  }

  // ⚡ ATAKE SA LAHAT
  if (!cfg.activeAll) return;
  if (!canSendNow(senderID, threadID)) return;

  // Random reaction
  const reacts = ["💀", "👁️", "😈", "🩸", "😏", "♾️", "🧐", "🤭"];
  api.setMessageReaction(reacts[Math.floor(Math.random() * reacts.length)], messageID, () => {}, true);

  // Random reply — mas marami kaya hindi paulit-ulit!
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  api.sendMessage(reply, threadID);

  startIdleAttack(api, threadID);
};

module.exports.run = async function () {};
