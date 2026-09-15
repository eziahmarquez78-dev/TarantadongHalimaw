module.exports = {
	config: {
		name: "setrole",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Chỉnh sửa role của lệnh (những lệnh có role < 2)",
			en: "Edit role of command (commands with role < 2)",
			tl: "I-edit ang role ng command (mga command na may role < 2)"
		},
		category: "info",
		guide: {
			vi: "   {pn} <commandName> <new role>: set role mới cho lệnh"
				+ "\n   Với:"
				+ "\n   + <commandName>: tên lệnh"
				+ "\n   + <new role>: role mới của lệnh với:"
				+ "\n   + <new role> = 0: lệnh có thể được sử dụng bởi mọi thành viên trong nhóm"
				+ "\n   + <new role> = 1: lệnh chỉ có thể được sử dụng bởi quản trị viên"
				+ "\n   + <new role> = default: reset role lệnh về mặc định"
				+ "\n   Ví dụ:"
				+ "\n    {pn} rank 1: (lệnh rank sẽ chỉ có thể được sử dụng bởi quản trị viên)"
				+ "\n    {pn} rank 0: (lệnh rank sẽ có thể được sử dụng bởi mọi thành viên trong nhóm)"
				+ "\n    {pn} rank default: reset về mặc định"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: xem role của những lệnh đã chỉnh sửa",
			en: "   {pn} <commandName> <new role>: set new role for command"
				+ "\n   With:"
				+ "\n   + <commandName>: command name"
				+ "\n   + <new role>: new role of command with:"
				+ "\n   + <new role> = 0: command can be used by all members in group"
				+ "\n   + <new role> = 1: command can be used by admin only"
				+ "\n   + <new role> = default: reset role of command to default"
				+ "\n   Example:"
				+ "\n    {pn} rank 1: (command rank can be used by admin only)"
				+ "\n    {pn} rank 0: (command rank can be used by all members in group)"
				+ "\n    {pn} rank default: reset to default"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: view role of edited commands",
			tl: "   {pn} <commandName> <bagong role>: mag-set ng bagong role para sa command"
				+ "\n   Kung saan:"
				+ "\n   + <commandName>: pangalan ng command"
				+ "\n   + <bagong role>: bagong role ng command kung saan:"
				+ "\n   + <bagong role> = 0: pwedeng gamitin ng lahat ng miyembro sa group"
				+ "\n   + <bagong role> = 1: admin lang ang pwedeng gumamit"
				+ "\n   + <bagong role> = default: ibalik ang role ng command sa default"
				+ "\n   Halimbawa:"
				+ "\n    {pn} rank 1: (admin lang ang pwedeng gumamit ng command rank)"
				+ "\n    {pn} rank 0: (lahat ng miyembro sa group pwedeng gumamit ng command rank)"
				+ "\n    {pn} rank default: ibalik sa default"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: tingnan ang role ng mga na-edit na command"
		}
	},

	langs: {
		vi: {
			noEditedCommand: "✅ Hiện tại nhóm bạn không có lệnh nào được chỉnh sửa role",
			editedCommand: "⚠️ Những lệnh trong nhóm bạn đã chỉnh sửa role:\n",
			noPermission: "❗ Chỉ có quản trị viên mới có thể thực hiện lệnh này",
			commandNotFound: "Không tìm thấy lệnh \"%1\"",
			noChangeRole: "❗ Không thể thay đổi role của lệnh \"%1\"",
			resetRole: "Đã reset role của lệnh \"%1\" về mặc định",
			changedRole: "Đã thay đổi role của lệnh \"%1\" thành %2"
		},
		en: {
			noEditedCommand: "✅ Your group has no edited command",
			editedCommand: "⚠️ Your group has edited commands:\n",
			noPermission: "❗ Only admin can use this command",
			commandNotFound: "Command \"%1\" not found",
			noChangeRole: "❗ Can't change role of command \"%1\"",
			resetRole: "Reset role of command \"%1\" to default",
			changedRole: "Changed role of command \"%1\" to %2"
		},
		tl: {
			noEditedCommand: "✅ Wala pang na-edit na role ng command sa group mo",
			editedCommand: "⚠️ Mga command sa group mo na na-edit ang role:\n",
			noPermission: "❗ Admin lang ang pwedeng gumamit ng command na ito",
			commandNotFound: "Hindi nahanap ang command na \"%1\"",
			noChangeRole: "❗ Hindi mapapalitan ang role ng command na \"%1\"",
			resetRole: "Naibalik na sa default ang role ng command na \"%1\"",
			changedRole: "Napalitan na ang role ng command na \"%1\" tungong %2"
		}
	},

	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		const { commands, aliases } = global.GoatBot;
		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0)
				return message.reply(getLang("noEditedCommand"));
			let msg = getLang("editedCommand");
			for (const cmd in setRole) msg += `- ${cmd} => ${setRole[cmd]}\n`;
			return message.reply(msg);
		}

		let commandName = (args[0] || "").toLowerCase();
		let newRole = args[1];
		if (!commandName || (isNaN(newRole) && newRole !== "default"))
			return message.SyntaxError();
		if (role < 1)
			return message.reply(getLang("noPermission"));

		const command = commands.get(commandName) || commands.get(aliases.get(commandName));
		if (!command)
			return message.reply(getLang("commandNotFound", commandName));
		commandName = command.config.name;
		if (command.config.role > 1)
			return message.reply(getLang("noChangeRole", commandName));

		let Default = false;
		if (newRole === "default" || newRole == command.config.role) {
			Default = true;
			newRole = command.config.role;
		}
		else {
			newRole = parseInt(newRole);
		}

		setRole[commandName] = newRole;
		if (Default)
			delete setRole[commandName];
		await threadsData.set(event.threadID, setRole, "data.setRole");
		message.reply("✅ " + (Default === true ? getLang("resetRole", commandName) : getLang("changedRole", commandName, newRole)));
	}
};