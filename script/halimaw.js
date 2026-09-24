const fs = require("fs");
const path = require("path");

// Allowed User ID para sa pag-control ng commands (halimaw on/off)
const ALLOWED_ID = "61594795855409";

module.exports.config = {
  name: "halimaw",
  version: "3.8.0",
  hasPermission: 0,
  credits: "sinzu / updated",
  description: "Tarantadong Halimaw - No Prefix Auto-Responder (Kahit Sino Kakanain)",
  usePrefix: false,
  commandCategory: "Fun",
  usages: "halimaw [on | off | status]",
  cooldowns: 3
};

const DATA_PATH = path.join(__dirname, "halimaw_config.json");

// Dynamic Cooldown Tracker para sa stealth execution
const threadCooldowns = new Map();

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

// ===== EVENT HANDLER (PM + GC AUTO-RESPONDER) =====
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;

  // Huwag pansinin kapag walang body, kapag command sa sarili, o kapag sariling chat ng bot
  if (!body || senderID === api.getCurrentUserID()) return;

  // Huwag sagutin kapag mismo yung control command "halimaw" ang tinatatype
  if (body.toLowerCase().startsWith("halimaw")) return;

  const config = loadConfig();
  if (!config.active) return;

  // Dynamic Cooldown Check (8s to 12s randomness)
  const now = Date.now();
  const lastTime = threadCooldowns.get(threadID) || 0;
  const dynamicCooldown = Math.floor(Math.random() * 4000) + 8000;

  if (now - lastTime < dynamicCooldown) return;

  // 85% Chance na sumagot sa Kahit Sino
  if (Math.random() > 0.85) return;

  threadCooldowns.set(threadID, now);

  const selectedRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  const typingDelay = Math.floor(Math.random() * 1500) + 1500;

  try {
    if (typeof api.sendTypingIndicator === "function") {
      api.sendTypingIndicator(threadID, true);
    }
  } catch (err) {}

  setTimeout(() => {
    try {
      if (typeof api.sendTypingIndicator === "function") {
        api.sendTypingIndicator(threadID, false);
      }
    } catch (err) {}

    api.sendMessage(selectedRoast, threadID);
  }, typingDelay);
};

// ===== COMMAND CONTROLLER =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // ID Restriction Validation para sa Control Commands
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
    return api.sendMessage(
      "🥷🩸 TARANTADONG HALIMAW (NO PREFIX MODE): ACTIVATED\n" +
      "───────────────────\n" +
      "🩸 Mode: Ninja Stealth Auto-Roast\n" +
      "🥷 Scope: Kahit Sino sa GC at PM\n" +
      "🩸 Target: Random 100 Seno Troll Replies\n" +
      "───────────────────\n" +
      "🩸 Gamitin ang `halimaw off` para i-turn off.",
      threadID,
      messageID
    );
  }

  if (sub === "off") {
    config.active = false;
    saveConfig(config);
    return api.sendMessage(
      "🥷🩸 TARANTADONG HALIMAW: DISABLED\n" +
      "───────────────────\n" +
      "Napatay na ang auto-responder.",
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
      `• Target: Kahit sino sa chat\n` +
      `• Prefix: Wala (No Prefix)\n` +
      "───────────────────",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    "🥷🩸 TARANTADONG HALIMAW PANEL\n" +
    "───────────────────\n" +
    "▶️ halimaw on  — Simulan ang auto-roast sa lahat\n" +
    "⏸️ halimaw off — I-off ang auto-roast\n" +
    "📈 halimaw status — I-check ang status\n" +
    "───────────────────",
    threadID,
    messageID
  );
};
