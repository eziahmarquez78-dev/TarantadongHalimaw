const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "halimaw",
  version: "7.2.0-150-REPLIES",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "Tarantadong Halimaw — 150 Replies | Prefixless | 1:1 Reply | 5s Delay",
  usePrefix: false,
  commandCategory: "Fun",
  usages: ". = ON | .. = OFF | ... = STATUS",
  cooldowns: 3
};

const DATA_PATH = path.join(__dirname, "halimaw_config.json");
const lastReply = new Map();

// ==============================================
// 🩸 150 REPLIES — TAGALOG & ENGLISH
// ==============================================
const ROASTS = [
  // ENGLISH (1-75)
  "Bro really thought that message was necessary 🥷🩸",
  "The confidence… the delusion… unmatched 🥷🩸",
  "Say less, we already lost brain cells reading that 🥷🩸",
  "You typed all that just to embarrass yourself? 🥷🩸",
  "Main character energy but the plot is mid 🥷🩸",
  "Who hurt you? Because that sentence hurt all of us 🥷🩸",
  "Please stop before the group chat files a restraining order 🥷🩸",
  "You really just said that out loud… in text… permanently 🥷🩸",
  "The audacity is loud but the intelligence is on mute 🥷🩸",
  "This is why group chats need a mute button for specific people 🥷🩸",
  "Bro woke up and chose violence against the English language 🥷🩸",
  "I'm not even mad, I'm just disappointed… and second-hand embarrassed 🥷🩸",
  "Your message just aged like milk left in the sun 🥷🩸",
  "Somewhere a grammar teacher is crying 🥷🩸",
  "This energy is giving 'I peaked in high school' 🥷🩸",
  "You dropped that like it was fire. It was not 🥷🩸",
  "The group chat was peaceful until you arrived 🥷🩸",
  "Please log off for the sake of everyone's mental health 🥷🩸",
  "That was a choice… a bold, terrible choice 🥷🩸",
  "I'm taking notes on how not to communicate 🥷🩸",
  "Your keyboard called — it wants its letters back 🥷🩸",
  "Silence is golden — your message is bronze at best 🥷🩸",
  "I'd explain why you're wrong, but I don't have the bandwidth 🥷🩸",
  "Every time you type, an angel loses brain cells 🥷🩸",
  "You're not wrong, you're just… not even trying 🥷🩸",
  "This isn't a hot take, it's a cold mess 🥷🩸",
  "Some questions are better left unanswered — yours is one 🥷🩸",
  "Don't feel bad, not everyone has good judgment 🥷🩸",
  "Your message is like a cloud — empty and floating away 🥷🩸",
  "Confidence: 100 / Sense: 0 🥷🩸",
  "That aged faster than milk 🥷🩸",
  "Bravery isn't knowing what to say — it's knowing when to stop 🥷🩸",
  "Not every idea needs to leave your head 🥷🩸",
  "Keep going — you're almost making sense 🥷🩸",
  "Your message has been filed under 'Why though?' 🥷🩸",
  "It's okay to be quiet — really 🥷🩸",
  "Don't mistake volume for value 🥷🩸",
  "Thinking is hard, I get it — but try anyway 🥷🩸",
  "That's not a take, that's a mistake 🥷🩸",
  "If I agreed with you, we'd both be wrong 🥷🩸",
  "You're the reason they put instructions on shampoo bottles 🥷🩸",
  "I'd argue, but I don't speak nonsense 🥷🩸",
  "You're loud but not clear — like a bad speaker 🥷🩸",
  "The floor is yours — please give it back 🥷🩸",
  "I'm not laughing at you, I'm laughing with concern 🥷🩸",
  "Your message is a mystery — no solution found 🥷🩸",
  "Bold choice to type that out 🥷🩸",
  "We all have moments — this is yours 🥷🩸",
  "Say less, mean less 🥷🩸",
  "Your contribution: zero. Your confidence: infinite 🥷🩸",
  "You're not making history, just noise 🥷🩸",
  "That's not a thought, that's a sound 🥷🩸",
  "I'd reply properly, but nonsense takes time to decode 🥷🩸",
  "Keep talking — I'm enjoying the example 🥷🩸",
  "Your words are free — but they cost us patience 🥷🩸",
  "This is what happens when you skip the thinking part 🥷🩸",
  "Not every opinion needs airtime 🥷🩸",
  "Brave… but wrong 🥷🩸",
  "I'd ask what you mean, but I don't want to know 🥷🩸",
  "This is why we can't have quiet chats 🥷🩸",
  "Your message is a question mark with no answer 🥷🩸",
  "You're not helping the conversation 🥷🩸",
  "Some people shine — you just reflect 🥷🩸",
  "That's not a point, that's a post 🥷🩸",
  "Don't type it just because you can 🥷🩸",
  "Your brain on vacation? Send it a postcard 🥷🩸",
  "I'm speechless — mostly because nothing needs saying 🥷🩸",
  "Some people speak from experience — you speak from habit 🥷🩸",
  "This is exactly why we have filters 🥷🩸",
  "Your keyboard deserves better 🥷🩸",
  "That's a special kind of wrong 🥷🩸",
  "You're practicing for something — just not intelligence 🥷🩸",

  // TAGALOG (76-150)
  "Akala mo ba may kwenta sinabi mo? Wala naman 🥷🩸",
  "Kalmahan mo lang, hindi naman tayo naghahabol ng medalya 🥷🩸",
  "Grabe ang tapang sa chat, sa personal siguro tahimik 🥷🩸",
  "Ilang oras mo pinag-isipan yan? Sayang lang oras 🥷🩸",
  "Bakit parang galit ka? Nasaktan ka ba sa totoo? 🥷🩸",
  "Tumigil ka na bago ka pa mahalin ng sarili mong salita 🥷🩸",
  "Pwede bang magpahinga ka muna? Nakakapagod basahin ka 🥷🩸",
  "Ang lakas ng loob mo, pero kulang sa laman 🥷🩸",
  "Sabi nila magsalita ka lang kung may idadagdag ka — manahimik ka na 🥷🩸",
  "Parang radyo na sira — paulit-ulit, walang saysay 🥷🩸",
  "Bakit ka pa sumagot kung wala naman kang naiintindihan? 🥷🩸",
  "Isipin mo muna bago mo pindutin ang send — libre mag-isip 🥷🩸",
  "Hindi lahat dapat sinasabi, lalo na kapag walang kwenta 🥷🩸",
  "Ang gulo ng sinabi mo, parang buhay mo 🥷🩸",
  "Huwag kang mag-alala, hindi ka naman nila iniintindi 🥷🩸",
  "Ang taas ng lipad, pero mababa ang bagsak 🥷🩸",
  "Sana kasing talino ng pagta-type mo ang sinabi mo 🥷🩸",
  "Dami mong sinabi, pero wala kang naipunto 🥷🩸",
  "Magsalita ka kapag may laman na ang utak mo 🥷🩸",
  "Ang lakas ng boses sa chat, pero wala kang pinatunayan 🥷🩸",
  "Wag kang magmagaling, hindi naman ikaw ang bida dito 🥷🩸",
  "Ang dami mong alam, pero wala kang napatunayan 🥷🩸",
  "Mas maganda pang tumahimik kaysa magsalita ng walang saysay 🥷🩸",
  "Isipin mo muna bago ka magsalita, baka mapahiya ka lang 🥷🩸",
  "Ang ganda ng sinabi mo… kung may kwenta sana 🥷🩸",
  "Hindi lahat ng nasa isip mo ay dapat ilabas 🥷🩸",
  "Ang bilis ng kamay sa pag-type, pero mabagal ang utak 🥷🩸",
  "Dami mong sinabi, pero parang wala naman 🥷🩸",
  "Magpahinga ka na, napagod na ang utak ko sa pagbasa sayo 🥷🩸",
  "Hindi ka naman napipilitang magsalita kung wala kang sasabihin 🥷🩸",
  "Ang lakas ng loob mong magsalita, kahit mali naman 🥷🩸",
  "Tumahimik ka na lang, mas malinis pa ang hangin 🥷🩸",
  "Sana mag-isip ka muna bago ka magpadala ng mensahe 🥷🩸",
  "Ang taas ng tingin mo sa sarili mo, pero mababa naman ang tingin sayo ng iba 🥷🩸",
  "Huwag kang mag-isip na mahalaga ang sinabi mo, hindi naman 🥷🩸",
  "Ang gulo ng sinabi mo, parang sinasabing wala kang naiintindihan 🥷🩸",
  "Mas maganda pang manahimik kaysa magsalita ng kalokohan 🥷🩸",
  "Hindi ka naman nagpapagaling, nagpapakita ka lang ng kawalan 🥷🩸",
  "Ang bilis magsalita, pero mabagal mag-isip 🥷🩸",
  "Wag kang mag-alala, hindi ka naman nila pinakikinggan 🥷🩸",
  "Dami mong sinabi, pero wala kang naipunto — ulit 🥷🩸",
  "Ang lakas ng loob mong magsalita nang ganyan 🥷🩸",
  "Mas tahimik ka, mas mukha kang matalino 🥷🩸",
  "Hindi lahat ng gusto mong sabihin ay dapat marinig nila 🥷🩸",
  "Ang gulo ng mensahe mo, parang buhay mo — walang direksyon 🥷🩸",
  "Tumigil ka na, baka lalo kang mapahiya 🥷🩸",
  "Sana matuto kang tumahimik kapag wala kang sasabihin 🥷🩸",
  "Ang taas ng lipad, pero mababa ang bagsak — ulit 🥷🩸",
  "Huwag kang mag-isip na tama ka, mali naman 🥷🩸",
  "Dami mong sinabi, pero iisa lang ang ibig sabihin — wala 🥷🩸",
  "Mas maganda pang magbasa kaysa magsalita ng walang alam 🥷🩸",
  "Ang lakas ng loob mo, pero kulang sa katotohanan 🥷🩸",
  "Wag kang mag-alala, hindi mo nag-iisa — marami ring hindi nakakaintindi 🥷🩸",
  "Ang ganda ng pagkaka-type, sayang wala namang laman 🥷🩸",
  "Tumahimik ka na, makakatulong ka pa sa mundo 🥷🩸",
  "Isipin mo muna bago ka magsalita — libre lang mag-isip 🥷🩸",
  "Ang taas ng tingin mo sa sarili mo, pero wala kang pinatunayan 🥷🩸",
  "Hindi lahat ng nasa isip mo ay dapat ilabas — lalo na kung walang kwenta 🥷🩸",
  "Dami mong sinabi, pero parang paulit-ulit lang 🥷🩸",
  "Mas maganda pang manahimik kaysa magsalita nang mali 🥷🩸",
  "Ang bilis ng pag-type, pero mabagal ang pag-intindi 🥷🩸",
  "Wag kang mag-alala, hindi ka naman nila iniintindi talaga 🥷🩸",
  "Tumigil ka na, baka lalo kang magmukhang tanga 🥷🩸",
  "Sana matuto kang mag-isip bago ka magpadala 🥷🩸",
  "Ang lakas ng loob mong magsalita kahit mali naman 🥷🩸",
  "Mas tahimik ka, mas maganda 🥷🩸",
  "Hindi lahat ng gusto mong sabihin ay mahalaga 🥷🩸",
  "Ang gulo ng sinabi mo, parang walang katapusan 🥷🩸",
  "Tumigil ka na, sapat na ang nakita namin 🥷🩸",
  "Isipin mo muna bago ka magsalita, para hindi ka mapahiya 🥷🩸",
  "Ang taas ng lipad, pero mababa ang bagsak — pangatlong beses na 🥷🩸",
  "Huwag kang mag-isip na tama ka, mali naman talaga 🥷🩸",
  "Dami mong sinabi, pero wala kang naipunto — paulit-ulit 🥷🩸",
  "Mas maganda pang mag-aral kaysa magsalita ng walang alam 🥷🩸",
  "Ang lakas ng loob mo, pero kulang sa kaalaman 🥷🩸",
  "Wag kang mag-alala, hindi ka naman nag-iisa sa pagiging mali 🥷🩸",
  "Ang ganda ng pagkaka-type, sayang wala namang saysay 🥷🩸",
  "Tumahimik ka na, makakatulong ka pa sa sarili mo 🥷🩸",
  "Isipin mo muna bago ka magpadala — libre lang talaga 🥷🩸"
];

// Load Config
function loadConfig() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) { console.error("Load error:", e); }
  return { active: false };
}

function saveConfig(data) {
  try { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); }
  catch (e) { console.error("Save error:", e); }
}

// ===== EVENT HANDLER — PREFIXLESS | 1:1 REPLY | 5s DELAY =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  const msg = (body || "").trim();

  // Skip: sariling message
  if (senderID === api.getCurrentUserID()) return;

  // ===== TRIGGERS =====
  if (msg === ".") {
    const cfg = loadConfig();
    cfg.active = true;
    saveConfig(cfg);
    lastReply.clear();
    return api.sendMessage(
      "🥷🩸 HALIMAW ACTIVATED ✅\n" +
      "──────────────\n" +
      "🔢 Rule: 1 Msg = 1 Reply\n" +
      "⏱️ Delay: EXACTLY 5s\n" +
      "🔘 Prefixless: ON\n" +
      "📝 Replies: " + ROASTS.length + "\n" +
      "──────────────\n" +
      ".. = OFF | ... = Status",
      threadID, messageID
    );
  }

  if (msg === "..") {
    const cfg = loadConfig();
    cfg.active = false;
    saveConfig(cfg);
    lastReply.clear();
    return api.sendMessage("🥷🩸 HALIMAW DISABLED ❌", threadID, messageID);
  }

  if (msg === "...") {
    const isActive = loadConfig().active;
    return api.sendMessage(
      "📊 STATUS\n" +
      "──────────\n" +
      `• Active: ${isActive ? "✅ OO" : "❌ HINDI"}\n` +
      `• Rule: 1:1 Reply\n` +
      `• Delay: 5s\n` +
      `• Replies: ${ROASTS.length}\n` +
      "──────────",
      threadID, messageID
    );
  }

  // ===== AUTO-REPLY =====
  if (!msg) return;
  const config = loadConfig();
  if (!config.active) return;

  // 1 message = 1 reply — bawal doble
  if (lastReply.get(messageID)) return;
  lastReply.set(messageID, true);

  // 5 seconds fixed delay
  const DELAY = 5000;

  // Typing indicator
  try { if (typeof api.sendTypingIndicator === "function") api.sendTypingIndicator(threadID, true); } catch {}

  setTimeout(() => {
    try { if (typeof api.sendTypingIndicator === "function") api.sendTypingIndicator(threadID, false); } catch {}
    const reply = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    api.sendMessage(reply, threadID);
  }, DELAY);
};

module.exports.run = async function () {};
