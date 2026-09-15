const OWNER_NAME = "Sinzu";
const OWNER_FB = "https://www.facebook.com/profile.php?id=61594251452411";

module.exports = {
	config: {
		name: "help",
		aliases: ["h", "commands", "cmds"],
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem danh sách lệnh hoặc cách sử dụng chi tiết của 1 lệnh",
			en: "View list of commands or detailed usage of a command",
			tl: "Tingnan ang listahan ng mga command o ang detalyadong paggamit ng isang command"
		},
		category: "info",
		guide: {
			vi: "   {pn}: xem danh sách tất cả lệnh"
				+ "\n   {pn} <tên lệnh>: xem cách sử dụng chi tiết của 1 lệnh",
			en: "   {pn}: view list of all commands"
				+ "\n   {pn} <command name>: view detailed usage of a command",
			tl: "   {pn}: tingnan ang listahan ng lahat ng command"
				+ "\n   {pn} <pangalan ng command>: tingnan ang detalyadong paggamit ng isang command"
		}
	},

	langs: {
		vi: {
			listCommand: "📚 | Danh sách lệnh (%1 lệnh):\n\n%2\n\n👉 Gõ \"%3help <tên lệnh>\" để xem cách dùng chi tiết của 1 lệnh",
			commandNotFound: "⚠️ | Không tìm thấy lệnh \"%1\"",
			detail: "📖 | Chi tiết lệnh \"%1\"\n\n📌 Mô tả: %2\n🔑 Alias: %3\n🎯 Role: %4\n📂 Danh mục: %5\n\n📝 Cách dùng:\n%6",
			ownerFooter: "\n\n👑 Owner: %1\n📘 Facebook: %2",
			noAlias: "Không có",
			noDescription: "Không có mô tả",
			roleText: {
				0: "Tất cả thành viên",
				1: "Chỉ quản trị viên nhóm",
				2: "Chỉ admin bot"
			}
		},
		en: {
			listCommand: "📚 | Command list (%1 commands):\n\n%2\n\n👉 Type \"%3help <command name>\" to view detailed usage of a command",
			commandNotFound: "⚠️ | Command \"%1\" not found",
			detail: "📖 | Detail of command \"%1\"\n\n📌 Description: %2\n🔑 Alias: %3\n🎯 Role: %4\n📂 Category: %5\n\n📝 Usage:\n%6",
			ownerFooter: "\n\n👑 Owner: %1\n📘 Facebook: %2",
			noAlias: "None",
			noDescription: "No description",
			roleText: {
				0: "All members",
				1: "Group admin only",
				2: "Bot admin only"
			}
		},
		tl: {
			listCommand: "📚 | Listahan ng command (%1 na command):\n\n%2\n\n👉 I-type ang \"%3help <pangalan ng command>\" para tingnan ang detalyadong paggamit ng isang command",
			commandNotFound: "⚠️ | Hindi nahanap ang command na \"%1\"",
			detail: "📖 | Detalye ng command na \"%1\"\n\n📌 Deskripsyon: %2\n🔑 Alias: %3\n🎯 Role: %4\n📂 Kategorya: %5\n\n📝 Paano gamitin:\n%6",
			ownerFooter: "\n\n👑 May-ari (Owner): %1\n📘 Facebook: %2",
			noAlias: "Wala",
			noDescription: "Walang deskripsyon",
			roleText: {
				0: "Lahat ng miyembro",
				1: "Admin ng group lang",
				2: "Admin ng bot lang"
			}
		}
	},

	onStart: async function ({ args, message, getLang, threadsData, event, prefix }) {
		const { commands } = global.GoatBot;
		const lang = global.GoatBot.config.language || "en";

		// gets custom set role of a command in this group, if any
		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		if (!args[0]) {
			// group commands by category
			const grouped = {};
			for (const [name, command] of commands) {
				const cate = (command.config.category || "no category").toLowerCase();
				if (!grouped[cate])
					grouped[cate] = [];
				if (!grouped[cate].includes(name))
					grouped[cate].push(name);
			}

			let msg = "";
			let total = 0;
			for (const cate in grouped) {
				const list = grouped[cate].sort();
				total += list.length;
				msg += `╭─── ${cate.toUpperCase()} ───\n│ ${list.join(", ")}\n╰──────────────\n\n`;
			}

			return message.reply(
				getLang("listCommand", total, msg.trim(), prefix)
				+ getLang("ownerFooter", OWNER_NAME, OWNER_FB)
			);
		}

		const commandName = args[0].toLowerCase();
		const command = commands.get(commandName) || commands.get(global.GoatBot.aliases.get(commandName));

		if (!command)
			return message.reply(getLang("commandNotFound", commandName));

		const { config } = command;
		const name = config.name;
		const description = (typeof config.description == "object" ? config.description[lang] || config.description.en : config.description) || getLang("noDescription");
		const aliases = config.aliases?.length ? config.aliases.join(", ") : getLang("noAlias");
		const role = setRole[name] ?? config.role ?? 0;
		const roleText = getLang("roleText")[role] || role;
		const category = config.category || "-";

		let guide = config.guide;
		if (typeof guide == "object")
			guide = guide[lang]?.body || guide[lang] || guide.en?.body || guide.en || "";
		guide = (guide || "").replace(/\{pn\}/g, prefix + name).replace(/\{p\}/g, prefix).replace(/\{n\}/g, name);

		return message.reply(
			getLang("detail", name, description, aliases, roleText, category, guide)
			+ getLang("ownerFooter", OWNER_NAME, OWNER_FB)
		);
	}
};
