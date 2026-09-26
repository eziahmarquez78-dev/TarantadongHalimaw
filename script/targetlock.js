const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

const TARGET_NICKNAME = "Saizen owns u mf";
const DEFAULT_GC_NAME = "SAIZEN OWNS YOUR HOOD";
const DELAY_BETWEEN = 450;

module.exports.config = {
  name: "target lock",
  version: "33.0.0-KALABAN-EDITION",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "💀 KALABAN MODE — REPLY NA PANG-ASAR!",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ". → simula | .. → itigil | ... → nickname | .... → gc name",
  cooldowns: 0
};

// 💬 KALABAN REPLIES — PANG-ASAR AT PANG-UWI!
const REPLIES = [
  "akala mo ba mananalo ka? 😏 hindi eh",
  "andito lang ako wag kang mag-alala — hindi ka makakatakas 💀",
  "san ka pupunta? dito ka lang lumaban 🫵",
  "wala kang takas sakin alam mo yan 😈",
  "tapos na ang pagtakas mo harapin mo na ako 😎",
  "bakit tahimik ka bigla? natakot ka ba? 😏",
  "bawat galaw mo nakikita ko lahat 👁️",
  "di ka makakaiwas dito alam mo yan 🔒",
  "akala mo ba nakaligtas ka? 😂",
  "bakit di ka sumasagot? nahihiya ka na ba? 😏",
  "wala kang laban sakin tanggapin mo na 😈",
  "palagi lang akong nandito — hindi ka makakaalis 💀",
  "di ka makakalimot sakin sigurado ako dun 😏",
  "ituloy mo lang kung kaya mo pa 😏",
  "simula pa lang to ha wag ka susuko 😈",
  "bawat oras nandito lang ako — hinihintay kita 🕐",
  "walang katapusan hangga't di ka sumuko ♾️",
  "san ka na? naghihintay pa rin ako sayo 📍",
  "hindi ako mapapagod — ikaw ang mapapagod 💪",
  "harapin mo na ako wag kang magtago 🕵️",
  "walang pahinga — hanggang sumuko ka 🤝",
  "may tinatago ka ba? bakit umiiwas? 🤔",
  "dito lang tayo hangga't di ka napapagod 😏",
  "kahit saan ka magpunta susundan kita 🗺️",
  "wag kang magtatago alam ko kung nasaan ka 👁️",
  "ayaw mo ba akong makita? kasi natatakot ka 😏",
  "andito na naman ako — hindi ka makawala 😈",
  "tignan mo ako kapag nagcha-chat ka ha 🫵",
  "alam ko lahat akala mo ba hindi ko alam? 😏",
  "hindi ka bibitawan hangga't di tayo tapos 🔗",
  "bawat salita mo binabasa ko lahat 📖",
  "wag kang mag-alala di ako aalis — ikaw ang aalis 😏",
  "ikaw lang ang tinitignan ko sa dami nila 👑",
  "tapos na ang pag-iwas harapin mo na ako 😎",
  "walang dulo to hangga't di mo inaamin 💍",
  "may kinatatakutan ka ba sakin? bakit lumalayo? 🤔",
  "nakaabang na ako sayo palagi 😏",
  "kahit magtago ka mahahanap pa rin kita 🕵️",
  "bakit ang bilis mo tumahimik? wala ka nang masabi? 😏",
  "hindi ka makakawala sa paningin ko 🔒",
  "palagi lang akong nakabantay sayo wag magulat 🛡️",
  "san man tayo magpunta magkasama pa rin tayo 🧭",
  "simula pa lang to akala mo ba tapos na? 😂",
  "bawat hakbang mo sinusundan kita nang mahigpit 👣",
  "wala akong gagawin masama — papatunayan ko lang 😏",
  "hindi ako mapapagod — ikaw mauuna pang sumuko ⏳",
  "tignan mo palagi andito lang ako sa likod mo 🧡",
  "hindi mauubos ang oras ko sayo ⏳",
  "parang ayaw mo na? kasi alam mo talo ka na 😏",
  "wag kang mag-isip ng iba — harapin mo lang ako 😈",
  "bakit tumitigil ka? magsalita ka naman 🗣️",
  "hindi ako aalis kahit anong mangyari 🛡️",
  "ikaw lang ang target ko sa lahat 👑",
  "palagi kong iniisip kung nasaan ka 🤔",
  "balik ka na hindi mo ako matatakasan 😏",
  "walang ibang makakatalo sayo kundi ako 🔒",
  "bakit ganyan ang tingin mo sakin? alam mo totoo 😏",
  "dikit lang tayo wag ka lalayo 🧲",
  "kahit anong mangyari di kita iiwan — hanggang dulo 🤝",
  "ako lang ang kalaban mo dito wag kang matakot 😈",
  "bakit parang iba ka na? sumuko ka na ba? 😏",
  "hindi magbabago ang tingin ko sayo 👁️",
  "palagi lang akong nandito kahit walang sagot 💬",
  "ikaw lang ang hinahanap ko sa dami nila 🔍",
  "di ka makakatakas sa isip ko 😏",
  "bawat galaw mo alam ko lahat talaga 👁️",
  "magkwento ka naman kung kaya mo pa 🎧",
  "bakit tahimik? wala ka nang maipagtatanggol? 😏",
  "hindi ako mapapagod kahit gaano katagal ⏳",
  "babalik at babalik sayo palagi 🔁",
  "ikaw lang ang kalaban ko walang iba 💯",
  "wag kang mag-alala di ako mawawala — ikaw ang susuko 🛡️",
  "san ka man magpunta susundan hanggang dulo 🗺️",
  "walang hanggan ang paghihintay ko sayo ♾️",
  "bakit ka lumalayo? dito ka lang lumaban 🫂",
  "hindi ka iiwan kahit magdilim pa 🌑",
  "palagi kang nasa isip ko alam mo ba? 💭",
  "ikaw ang target ko wag mo kalimutan 💛",
  "hindi na kailangan ng iba ikaw lang sapat na 😏",
  "mag-usap tayo wag kang magtago 🗣️",
  "bakit ganyan ang ngiti mo? kinakabahan ka ba? 😏",
  "di ka makakatakas sa akin alam mo yan 🔒",
  "nandito lang ako kahit anong oras ⏰",
  "hindi magbabago ang tingin ko sayo 👁️",
  "ikaw lang ang tinitingnan ko sa lahat 👑",
  "bakit ka umiiwas? may kinatatakutan ka ba? 😏",
  "palagi lang akong naghihintay sayo dito ⏳",
  "walang ibang makakatalo sayo sakin 💎",
  "magkwento ka kahit ano makikinig ako 🎧",
  "hindi ako aalis hangga't di mo sabihin na talo ka 🤝",
  "ikaw lang ang kasama ko hanggang dulo 🧭",
  "bakit parang ayaw mo na makausap ako? alam mo na 😏",
  "hindi ako mapapagod maghintay kahit taon pa ⏳",
  "ikaw lang mahalaga sakin wag mo kalimutan 💛",
  "palagi kong iniisip kung okay ka lang 🤔",
  "dito lang ako wag kang matakot — harapin mo 😈",
  "walang ibang makakakuha sayo kundi ako 🔒",
  "balik ka na hindi mo ako matatakasan 😏",
  "hindi mawawala kahit anong mangyari ♾️",
  "ikaw lang ang hinahanap ko palagi 🔍",
  "bakit parang malayo ka na kahit nandito ka? 😏",
  "palagi lang akong nakatingin sayo 👁️",
  "walang hanggan ang paghihintay ko sayo ⏳",
  "dito ka lang malapit sakin 🫂",
  "hindi ka bibitawan kailanman 🔗",
  "ikaw lang ang mundo ko wag mo kalimutan 🌍",
  "mag-usap tayo wag kang magtago 🗣️",
  "bakit tahimik ka? wala ka nang masabi? 😏",
  "andito lang ako handang makinig kung aaminin mo 🎧",
  "hindi ako aalis kahit anong sabihin nila 🤝",
  "ikaw lang sapat na kalaban ko 😏",
  "akala mo ba makakaalis ka? 😂 hindi eh",
  "hangga't di ka sumuko nandito lang ako 💀",
  "wala kang laban tanggapin mo na 😈",
  "ikaw ang target ko walang iba 👑",
  "tapos na ang pagtakas harapin mo na ako 😎",
  "bawat hakbang mo sinusundan kita 👣",
  "hindi ka makakawala alam mo yan 🔒",
  "walang ibang makakatalo sayo kundi ako 💎",
  "simula pa lang to wag ka sumuko agad 😏",
  "hindi ako aalis hanggang dulo 🧭",
  "dito ka lang lumaban kung may tapang ka 😈",
  "bakit tumahimik? kinakabahan ka na ba? 😏",
  "palagi lang akong nandito — hinihintay kita ♾️",
  "san ka man magpunta susundan kita 🗺️",
  "ikaw lang ang tinitignan ko sa lahat 👁️",
  "di ka makakaiwas alam mo yan 😏",
  "harapin mo na ako wag kang magtago 🕵️"
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
      `💀 KALABAN MODE — ONLINE!\n───────────────\n✅ Pang-asar na replies — ${REPLIES.length} na!\n✅ Dito lang sasagot\n✅ Permanent — hindi mawawala\n───────────────\n📋 COMMANDS:\n.     = Simula\n..    = Itigil lahat\n...   = Set nickname lahat\n....  = Lock GC Name\n....[text] = Custom GC Name\n───────────────`,
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

  // 💬 AUTO-REPLY — KALABAN MODE!
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
  console.log("💀 KALABAN MODE —", REPLIES.length, "REPLIES!");
  console.log("═══════════════════════════════════");
  console.log(`📍 Locked: ${TARGET_THREAD || "WALA PA"}`);
  console.log(`💬 Auto-Reply: ${isActive ? "ON ✅" : "OFF ❌"}`);
  console.log(`🔒 GC Name Lock: ${isNameLocked ? "ON ✅" : "OFF ❌"}`);
  console.log("═══════════════════════════════════");
};
