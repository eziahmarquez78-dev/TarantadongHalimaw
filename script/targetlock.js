const fs = require("fs");
const path = require("path");

const ALLOWED_ID = "61594795855409";
const BOT_NAME = "Saizen Bot";
const DATA_PATH = path.join(__dirname, "targetlock_config.json");

const TARGET_NICKNAME = "Saizen owns u mf";
const DEFAULT_GC_NAME = "SAIZEN OWNS YOUR HOOD";
const DELAY_BETWEEN = 450;

module.exports.config = {
  name: "target lock",
  version: "37.0.0-STRICT-REPLY",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "💀 Kahit anong message = 1 reply lang — walang sticker/gif/like/zone",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ".=on | ..=off | bilang naba ako=count | list=listahan",
  cooldowns: 0
};

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

// 🔢 BILANG SYSTEM
let isCountingMode = false;
let countThread = null;
let isCounting = false;
let currentNumber = 0;
let countTimer = null;
const MAX_COUNT = 50;
const COUNT_SPEED = 600;

// 📋 LISTAHAN NG NA-REPLYAN
const repliedUsers = new Map();
let listThread = null;

// ⚡ STRICT REPLY — 1 MESSAGE = 1 REPLY LANG
const lastReplyPerUser = new Map(); // userId → lastMsgTimestamp

const EXCLUDE_KEYWORDS = ["like", "zone"]; // wag replyan kapag ganito

let isActive = false;
let TARGET_THREAD = null;
let LOCKED_GC_NAME = null;
let isNameLocked = false;

function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) { console.error("[load error]", e); }
  return { active: false, targetThread: null, lockedName: null, nameLocked: false };
}

function saveConfig(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    isActive = data.active; TARGET_THREAD = data.targetThread;
    LOCKED_GC_NAME = data.lockedName; isNameLocked = data.nameLocked;
  } catch (e) { console.error("[save error]", e); }
}

// ✅ CHECK: DAPAT BA I-REPLYAN?
function shouldSkipReply(event, msg) {
  // Skip kung sariling message
  if (event.senderID === event.api.getCurrentUserID()) return true;
  
  // Skip sticker, gif, attachment na walang text
  if (event.type === "message" && !event.body && event.attachments?.length > 0) {
    const hasSticker = event.attachments.some(a => a.type === "sticker" || a.type === "animated_image");
    if (hasSticker) return true;
  }
  
  // Skip like/zone keywords
  const lowerMsg = msg.toLowerCase().trim();
  if (EXCLUDE_KEYWORDS.some(word => lowerMsg === word || lowerMsg.includes(word))) {
    return true;
  }
  
  // Skip kung wala talagang text
  if (!msg && (!event.attachments || event.attachments.length === 0)) return true;
  
  return false;
}

// ✅ CHECK: 1 MESSAGE = 1 REPLY LANG
function canReplyNow(userId) {
  const now = Date.now();
  const lastMsgTime = lastReplyPerUser.get(userId) || 0;
  // 1 reply lang bawat message — hindi mag-uulit sa parehong message
  if (now - lastMsgTime < 1000) return false; // iwas double reply
  lastReplyPerUser.set(userId, now);
  return true;
}

// 🔢 RESET COUNTING
function resetCounting(api, threadID, reason = "MAY NAGSALITA") {
  if (!isCountingMode || !isCounting) return;
  isCounting = false;
  currentNumber = 0;
  if (countTimer) clearTimeout(countTimer);
  countTimer = null;
  api.sendMessage(`❌ PUTOL! ${reason} — BILANG NAKA-RESET 💀`, threadID);
}

// 🔢 START COUNTING
async function startCounting(api, threadID) {
  if (isCounting) return;
  isCounting = true;
  currentNumber = 1;
  api.sendMessage(`🔢 [${BOT_NAME}] SIMULA NA! BILANG 1-${MAX_COUNT} — MABILIS NA! ⚡`, threadID);

  const doCount = async () => {
    if (!isCountingMode || !isCounting) return;
    await api.sendMessage(`${currentNumber}`, threadID);

    if (currentNumber >= MAX_COUNT) {
      isCounting = false;
      isCountingMode = false;
      const resibo = `
═══════════════════════════════
     🤖 ${BOT_NAME}
═══════════════════════════════
       📋 R E S I B O
═══════════════════════════════
✅ BILANG: 1 - ${MAX_COUNT}
✅ KUMPLETO: OO ✅
✅ HINDI NAPUTOL: OO ✅
✅ BILIS: MABILIS ⚡
═══════════════════════════════
      SUMUKO KA NA 💀
═══════════════════════════════
      `.trim();
      return api.sendMessage(resibo, threadID);
    }
    currentNumber++;
    countTimer = setTimeout(doCount, COUNT_SPEED);
  };
  doCount();
}

// 📋 UPDATE LISTAHAN
async function updateGoneList(api, threadID) {
  if (!listThread || String(threadID) !== String(listThread)) return;
  try {
    const info = await api.getThreadInfo(threadID);
    const currentMembers = new Set(info.participantIDs.map(id => String(id)));
    const botId = String(api.getCurrentUserID());

    for (const [userId, data] of repliedUsers) {
      if (!currentMembers.has(userId) && userId !== botId) {
        data.gone = true;
      }
    }
  } catch (e) {}
}

// 📋 SHOW LIST
async function showGoneList(api, threadID) {
  listThread = String(threadID);
  await updateGoneList(api, threadID);

  const gone = [];
  const stillHere = [];

  for (const [userId, data] of repliedUsers) {
    if (data.gone) gone.push(`❌ ${data.name || `User ${userId.slice(-4)}`}`);
    else stillHere.push(`✅ ${data.name || `User ${userId.slice(-4)}`}`);
  }

  let msg = `🤖 ${BOT_NAME} — LISTAHAN NG NA-REPLYAN\n`;
  msg += `═══════════════════════════════\n`;
  msg += `Total na-replyan: ${repliedUsers.size}\n`;
  msg += `Nawala: ${gone.length}\n`;
  msg += `Nandito pa: ${stillHere.length}\n`;
  msg += `═══════════════════════════════\n`;

  if (gone.length > 0) {
    msg += `❌ NAWALA NA:\n${gone.join("\n")}\n`;
    msg += `═══════════════════════════════\n`;
  } else {
    msg += `❌ WALA PANG NAWALA ✅\n`;
  }

  if (stillHere.length > 0) {
    msg += `✅ NANDITO PA:\n${stillHere.join("\n")}`;
  }

  return api.sendMessage(msg, threadID);
}

module.exports.handleEvent = async function ({ api, event }) {
  const cfg = loadConfig();
  isActive = cfg.active; TARGET_THREAD = cfg.targetThread;
  LOCKED_GC_NAME = cfg.lockedName; isNameLocked = cfg.nameLocked;

  const { threadID, senderID, body, isGroup } = event;
  const msg = (body || "").trim();
  const isAdmin = String(senderID) === ALLOWED_ID;
  const senderIdStr = String(senderID);

  // 🔢 TRIGGER: bilang naba ako
  if (msg.toLowerCase().includes("bilang naba ako")) {
    if (!isAdmin) return;
    isCountingMode = true;
    countThread = String(threadID);
    if (countTimer) clearTimeout(countTimer);
    startCounting(api, threadID);
    return;
  }

  // 🔢 PUTOL KAPAG MAY NAGSALITA
  if (isCountingMode && String(threadID) === String(countThread)) {
    if (isCounting && currentNumber > 0) {
      resetCounting(api, threadID, "MAY NAGSALITA KAPAG NAGBIBILANG");
      return;
    }
  }

  // 📋 TRIGGER: list
  if (msg.toLowerCase() === "list") {
    if (!isAdmin) return;
    return showGoneList(api, threadID);
  }

  // ✅ . = SIMULA
  if (msg === ".") {
    if (!isAdmin) return;
    isActive = true; TARGET_THREAD = String(threadID);
    isCountingMode = false; countThread = null;
    listThread = String(threadID);
    lastReplyPerUser.clear();
    if (countTimer) clearTimeout(countTimer);
    saveConfig({ ...cfg, active: true, targetThread: threadID });
    return api.sendMessage(
      `🤖 ${BOT_NAME} — KALABAN MODE ON!\n` +
      `───────────────\n` +
      `✅ Kahit anong message = 1 reply lang\n` +
      `❌ Hindi replyan: Like/Zone/Sticker/GIF\n` +
      `✅ "bilang naba ako" = 🔢 Bilang 1-50\n` +
      `✅ "list" = 📋 Listahan ng nawala\n` +
      `───────────────`,
      threadID
    );
  }

  // ✅ .. = ITIGIL
  if (msg === "..") {
    if (!isAdmin) return;
    isActive = false; isNameLocked = false;
    isCountingMode = false; countThread = null;
    listThread = null;
    if (countTimer) clearTimeout(countTimer);
    TARGET_THREAD = LOCKED_GC_NAME = null;
    repliedUsers.clear();
    lastReplyPerUser.clear();
    saveConfig({});
    return api.sendMessage(`🛑 [${BOT_NAME}] LAHAT TUMIGIL — LISTAHAN NABURA`, threadID);
  }

  // ✅ ... = NICKNAME
  if (msg === "...") {
    if (!isAdmin || !isGroup) return;
    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs.filter(id => String(id) !== String(api.getCurrentUserID()));
      api.sendMessage(`🤖 ${BOT_NAME} — SETTING NICKNAME...\n👥 ${members.length} members`, threadID);
      let s = 0, f = 0;
      for (const id of members) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN));
        try { await api.changeNickname(TARGET_NICKNAME, threadID, id); s++; }
        catch { f++; }
      }
      return api.sendMessage(`✅ TAPOS! ${s} tapos, ${f} hindi`, threadID);
    } catch { return api.sendMessage("❌ Error", threadID); }
  }

  // ✅ .... = LOCK GC
  if (msg === "....") {
    if (!isAdmin || !isGroup) return;
    LOCKED_GC_NAME = DEFAULT_GC_NAME; isNameLocked = true;
    saveConfig({ ...cfg, lockedName: LOCKED_GC_NAME, nameLocked: true });
    await api.setTitle(LOCKED_GC_NAME, threadID);
    return api.sendMessage(`🔒 GC LOCKED!\n✅ ${LOCKED_GC_NAME}`, threadID);
  }

  // ✅ ....[name] = CUSTOM GC
  if (msg.startsWith("....")) {
    if (!isAdmin || !isGroup) return;
    const name = msg.slice(4).trim();
    if (!name) return api.sendMessage("⚠️ Ilagay ang pangalan!", threadID);
    LOCKED_GC_NAME = name; isNameLocked = true;
    saveConfig({ ...cfg, lockedName: name, nameLocked: true });
    await api.setTitle(name, threadID);
    return api.sendMessage(`🔒 GC LOCKED!\n✅ ${name}`, threadID);
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

  // 💬 MAIN REPLY SYSTEM
  if (!isActive || !TARGET_THREAD || String(threadID) !== String(TARGET_THREAD)) return;
  if (isCountingMode) return;

  // ⛔ SKIP CHECK
  if (shouldSkipReply(event, msg)) return;

  // ⚡ 1 MESSAGE = 1 REPLY LANG
  if (!canReplyNow(senderIdStr)) return;

  // 📋 RECORD USER
  if (!repliedUsers.has(senderIdStr)) {
    repliedUsers.set(senderIdStr, { name: null, lastSeen: Date.now(), gone: false });
    try {
      const info = await api.getUserInfo(senderID);
      const user = info[senderID];
      if (user?.name) repliedUsers.get(senderIdStr).name = user.name;
    } catch {}
  } else {
    repliedUsers.get(senderIdStr).lastSeen = Date.now();
    repliedUsers.get(senderIdStr).gone = false;
  }

  // ✅ SEND REPLY
  try {
    await api.sendMessage(REPLIES[Math.floor(Math.random() * REPLIES.length)], threadID);
  } catch (e) { console.error("[reply error]", e); }
};

module.exports.run = async function () {
  console.log("═══════════════════════════════════");
  console.log(`🤖 ${BOT_NAME} — SYSTEM ONLINE`);
  console.log("═══════════════════════════════════");
  console.log(`💬 Kalaban: ${isActive ? "ON ✅" : "OFF ❌"}`);
  console.log(`🔢 Bilang: ${isCountingMode ? "ON ✅" : "OFF ❌"}`);
  console.log(`📋 Listahan: ${listThread ? "TRACKING ✅" : "OFF ❌"}`);
  console.log(`🔒 GC Lock: ${isNameLocked ? "ON ✅" : "OFF ❌"}`);
  console.log(`⚡ Strict Reply: 1msg=1reply ✅`);
  console.log("═══════════════════════════════════");
};
