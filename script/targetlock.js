const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

const TARGET_NICKNAME = "Saizen owns u mf";
const DEFAULT_GC_NAME = "SAIZEN OWNS YOUR HOOD";
const DELAY_BETWEEN = 450;

module.exports.config = {
  name: "target lock",
  version: "32.0.0-MORE-REPLIES",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "♾️ BAGONG REPLIES — SOBRANG DAMI NA!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ". → simula | .. → itigil | ... → nickname | .... → gc name",
  cooldowns: 0
};

// 💬 BAGONG REPLIES — 100+ NA! HINDI UULIT AGAD!
const REPLIES = [
  "andito lang ako wag kang mag-alala 😊",
  "nakita kita agad hehe 👀",
  "bakit tahimik ka bigla? 😄",
  "hindi ka makakatakas sakin charot 😏",
  "san ka pupunta? dito ka lang 🫵",
  "wala kang takas sayo alam mo yan 😝",
  "akala mo ba nakaligtas ka? hindi eh 😈",
  "bawat galaw mo nakikita ko lahat 👁️",
  "di ka makakaiwas dito sa akin 🤭",
  "bakit di ka sumasagot? nahihiya ka ba? 😊",
  "naghihintay lang ako sayo maghapon ⏳",
  "palagi lang akong nandito wag kang mag-alala 💛",
  "di ka makakalimot sakin sigurado ako dun 😄",
  "ituloy mo lang nandito lang ako para sayo 💬",
  "simula pa lang to ha wag kang magtataka 😏",
  "bawat oras nandito lang ako hindi aalis 🕐",
  "walang katapusan tayo dito dalawa ♾️",
  "san ka na? naghihintay pa rin ako sayo 📍",
  "hindi ako mapapagod maghintay sayo kailanman 💪",
  "tapos na ang pagtakas mo harapin mo na ako 😎",
  "walang pahinga basta wag mo akong iiwan ha 🤝",
  "may tinatago ka ba sakin? bakit ganun? 🤔",
  "dito lang tayo hangga't di ka napapagod 😊",
  "kahit saan ka magpunta susundan kita 🗺️",
  "wag kang magtatago alam ko kung nasaan ka 😏",
  "ayaw mo ba akong makita? bakit ganun? 😢",
  "andito na naman ako hehehe 😄",
  "tignan mo ako kapag nagcha-chat ka ha 🫵",
  "alam ko lahat akala mo ba hindi ko alam? 👀",
  "hindi ka bibitawan hangga't di tayo tapos 🔗",
  "bawat salita mo binabasa ko lahat 📖",
  "wag kang mag-alala di ako aalis sayo 💛",
  "ikaw lang ang tinitignan ko sa dami nila 👑",
  "tapos na ang pag-iwas harapin mo na ako 😏",
  "walang dulo to basta wag mo akong iiwan 💍",
  "may kinatatakutan ka ba sakin? bakit umiiwas? 🤔",
  "nakaabang na ako sayo palagi 😊",
  "kahit magtago ka mahahanap pa rin kita 🕵️",
  "bakit ang bilis mo tumahimik? ituloy mo lang 💬",
  "hindi ka makakawala sa paningin ko 😏",
  "palagi lang akong nakabantay sayo wag magulat 🛡️",
  "san man tayo magpunta magkasama pa rin tayo 🧭",
  "simula pa lang to akala mo ba tapos na? 😄",
  "bawat hakbang mo sinusundan kita nang mahigpit 👣",
  "wala akong gagawin masama wag kang matakot 🤍",
  "hindi ako mapapagod maghintay sayo kailanman ♾️",
  "tignan mo palagi andito lang ako sa tabi mo 🧡",
  "hindi mauubos ang oras para sayo ⏳",
  "parang ayaw mo na sakin? bakit bigla ganun? 😢",
  "wag kang mag-isip ng iba ikaw lang gusto ko 😊",
  "bakit tumitigil ka? magsalita ka naman 🗣️",
  "hindi ako aalis kahit anong mangyari 🛡️",
  "ikaw lang ang mahalaga sakin sa lahat 💎",
  "palagi kong iniisip kung nasaan ka 🤔",
  "balik ka na andito lang ako naghihintay ⏳",
  "walang ibang makakakuha sayo kundi ako 🔒",
  "bakit ganyan ang tingin mo sakin? 😞",
  "dikit lang tayo wag ka lalayo 🧲",
  "kahit anong mangyari di kita iiwan 🤝",
  "ako lang ang kasama mo dito wag ka matakot 🤍",
  "bakit parang iba ka na? may nagbago ba? 🥺",
  "hindi magbabago ang nararamdaman ko sayo 💛",
  "palagi lang akong nandito kahit walang sagot 💬",
  "ikaw lang ang hinahanap ko sa dami nila 🔍",
  "di ka makakatakas sa isip ko 😏",
  "bawat galaw mo alam ko lahat talaga 👁️",
  "magkwento ka naman nandito lang ako makikinig 🎧",
  "bakit tahimik? galit ka ba sakin? 😔",
  "hindi ako mapapagod kahit gaano katagal ⏳",
  "babalik at babalik sayo palagi 🔁",
  "ikaw lang ang gusto ko walang iba 💯",
  "wag kang mag-alala di ako mawawala 🛡️",
  "san ka man magpunta susundan hanggang dulo 🗺️",
  "walang hanggan ang paghihintay ko sayo ♾️",
  "bakit ka lumalayo? dito ka lang sa akin 🫂",
  "hindi ka iiwan kahit magdilim pa 🌑",
  "palagi kang nasa isip ko alam mo ba? 💭",
  "ikaw ang lahat sakin wag mo kalimutan 💛",
  "hindi na kailangan ng iba ikaw lang sapat na ✨",
  "mag-usap tayo wag kang tumahimik 🗣️",
  "bakit ganyan ang ngiti mo? may itinatago ka ba? 😏",
  "di ka makakatakas sa akin alam mo yan 🔒",
  "nandito lang ako kahit anong oras ⏰",
  "hindi magbabago ang tingin ko sayo 👁️",
  "ikaw lang ang tinitingnan ko sa lahat 👑",
  "bakit ka umiiwas? may nagawa ba ako? 😢",
  "palagi lang akong naghihintay sayo dito ⏳",
  "walang ibang makakatalo sayo sakin 💎",
  "magkwento ka kahit ano makikinig ako 🎧",
  "hindi ako aalis hangga't di mo sabihin 🤝",
  "ikaw lang ang kasama ko hanggang dulo 🧭",
  "bakit parang ayaw mo na makausap ako? 😞",
  "hindi ako mapapagod maghintay kahit taon pa ⏳",
  "ikaw lang mahalaga sakin wag mo kalimutan 💛",
  "palagi kong iniisip kung okay ka lang 🤔",
  "dito lang ako wag kang matakot 🤍",
  "walang ibang makakakuha sayo kundi ako 🔒",
  "balik ka na nandito lang ako naghihintay 💬",
  "hindi mawawala kahit anong mangyari ♾️",
  "ikaw lang ang hinahanap ko palagi 🔍",
  "bakit parang malayo ka na kahit nandito ka? 😢",
  "palagi lang akong nakatingin sayo 👁️",
  "walang hanggan ang paghihintay ko sayo ⏳",
  "dito ka lang malapit sakin 🫂",
  "hindi ka bibitawan kailanman 🔗",
  "ikaw lang ang mundo ko wag mo kalimutan 🌍",
  "mag-usap tayo wag kang magtago 🗣️",
  "bakit tahimik ka? may problema ba? 🥺",
  "andito lang ako handang makinig 🎧",
  "hindi ako aalis kahit anong sabihin nila 🤝",
  "ikaw lang sapat na sakin 💛"
];

const lastReply = new Map();
const userCooldown = new Map();
let isActive = false;
let TARGET_THREAD = null;
let LOCKED_GC_NAME = null;
let isNameLocked = false;

// ===== CONFIG =====
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

// ===== MAIN SYSTEM =====
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

  // ✅ . = SIMULA
  if (msg === ".") {
    if (!isAdmin) return;
    isActive = true;
    TARGET_THREAD = String(threadID);
    saveConfig({ ...cfg, active: true, targetThread: threadID });
    return api.sendMessage(
      `♾️ SYSTEM ONLINE!\n───────────────\n✅ Dito lang sasagot\n✅ ${REPLIES.length} replies — hindi uulit agad!\n✅ Permanent — hindi mawawala\n───────────────\n📋 COMMANDS:\n.     = Simula\n..    = Itigil lahat\n...   = Set nickname lahat\n....  = Lock GC Name\n....[text] = Custom GC Name\n───────────────`,
      threadID
    );
  }

  // ✅ .. = ITIGIL LAHAT
  if (msg === "..") {
    if (!isAdmin) return;
    isActive = false;
    isNameLocked = false;
    LOCKED_GC_NAME = null;
    TARGET_THREAD = null;
    saveConfig({ active: false, targetThread: null, lockedName: null, nameLocked: false });
    return api.sendMessage("🛑 SYSTEM OFF — lahat naka-hinto", threadID);
  }

  // ✅ ... = SET NICKNAME LAHAT
  if (msg === "...") {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs.filter(id => String(id) !== String(api.getCurrentUserID()));
      api.sendMessage(`💀 SETTING NICKNAME...\n👥 ${members.length} members`, threadID);
      let success = 0, fail = 0;
      for (const uid of members) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN));
        try {
          await api.changeNickname(TARGET_NICKNAME, threadID, uid);
          success++;
          if (success % 50 === 0) api.sendMessage(`✅ ${success}/${members.length}`, threadID);
        } catch { fail++; }
      }
      return api.sendMessage(`✅ TAPOS NA! ${success} tapos, ${fail} hindi`, threadID);
    } catch {
      return api.sendMessage("❌ Error — subukan mo ulit", threadID);
    }
  }

  // ✅ .... = LOCK GC NAME — DEFAULT
  if (msg === "....") {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    LOCKED_GC_NAME = DEFAULT_GC_NAME;
    isNameLocked = true;
    saveConfig({ ...cfg, lockedName: LOCKED_GC_NAME, nameLocked: true });
    await api.setTitle(LOCKED_GC_NAME, threadID);
    return api.sendMessage(`🔒 GC NAME LOCKED!\n✅ ${LOCKED_GC_NAME}\n✅ Babalik agad kung palitan!`, threadID);
  }

  // ✅ ....[TEXT] = CUSTOM GC NAME
  if (msg.startsWith("....")) {
    if (!isAdmin) return;
    if (!isGroup) return api.sendMessage("⚠️ Sa GC lang pwede ito!", threadID);
    let customName = msg.slice(4).trim();
    if (!customName) return api.sendMessage("⚠️ Ilagay ang pangalan!\nHal: ....SAIZEN OWNS YOUR HOOD", threadID);
    LOCKED_GC_NAME = customName;
    isNameLocked = true;
    saveConfig({ ...cfg, lockedName: LOCKED_GC_NAME, nameLocked: true });
    await api.setTitle(LOCKED_GC_NAME, threadID);
    return api.sendMessage(`🔒 GC NAME LOCKED!\n✅ ${LOCKED_GC_NAME}`, threadID);
  }

  // 🔒 PROTECT GC NAME
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

  // 💬 AUTO-REPLY — BAGONG REPLIES!
  if (!isActive || !TARGET_THREAD) return;
  if (String(threadID) !== String(TARGET_THREAD)) return;
  if (!canSendNow(senderID, threadID)) return;

  try {
    const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    await api.sendMessage(reply, threadID);
  } catch (err) {
    console.error("[reply error]", err);
  }
};

// ✅ AUTO-LOAD
module.exports.run = async function () {
  const cfg = loadConfig();
  isActive = cfg.active;
  TARGET_THREAD = cfg.targetThread;
  LOCKED_GC_NAME = cfg.lockedName;
  isNameLocked = cfg.nameLocked;

  console.log("═══════════════════════════════════");
  console.log("♾️ BAGONG REPLIES —", REPLIES.length, "TOTAL!");
  console.log("═══════════════════════════════════");
  console.log(`📍 Locked: ${TARGET_THREAD || "WALA PA"}`);
  console.log(`💬 Auto-Reply: ${isActive ? "ON ✅" : "OFF ❌"}`);
  console.log(`🔒 GC Name Lock: ${isNameLocked ? "ON ✅" : "OFF ❌"}`);
  console.log("═══════════════════════════════════");
};
