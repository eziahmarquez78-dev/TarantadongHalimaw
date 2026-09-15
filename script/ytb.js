const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs-extra");
const path = require("path");

async function getStreamAndSize(url, customPath = "") {
	const response = await axios({
		method: "GET",
		url,
		responseType: "stream",
		headers: {
			'Range': 'bytes=0-'
		}
	});
	if (customPath)
		response.data.path = customPath;
	const totalLength = response.headers["content-length"];
	return {
		stream: response.data,
		size: parseInt(totalLength || 0, 10)
	};
}

module.exports = {
	config: {
		name: "ytb",
		version: "2.0.0",
		author: "Sanzu AI",
		countDown: 5,
		role: 0,
		description: {
			vi: "Tải video, audio hoặc xem thông tin video trên YouTube sa Sanzu AI",
			en: "Download video, audio or view video information on YouTube via Sanzu AI"
		},
		category: "media",
		guide: {
			vi: "   {pn} [video|-v] [<tên video>|<link video>]\n   {pn} [audio|-a] [<tên video>|<link video>]\n   {pn} [info|-i] [<tên video>|<link video>]",
			en: "   {pn} [video|-v] [<video name>|<video link>]\n   {pn} [audio|-a] [<video name>|<video link>]\n   {pn} [info|-i] [<video name>|<video link>]\n   Halimbawa:\n    {pn} -v Fallen Kingdom\n    {pn} -a Fallen Kingdom\n    {pn} -i Fallen Kingdom"
		}
	},

	langs: {
		vi: {
			error: "❌ Sanzu AI Error: %1",
			noResult: "⭕ Không tìm thấy kết quả phù hợp cho: %1",
			choose: "%1Reply tin nhắn này bằng số để chọn bài hát/video hoặc nhập bất kỳ để hủy:",
			video: "video",
			audio: "âm thanh",
			downloading: "⬇️ [Sanzu AI] Đang tải xuống %1 \"%2\"...",
			downloading2: "⬇️ [Sanzu AI] Đang tải xuống %1 \"%2\"\n🔃 Tốc độ: %3MB/s\n⏸️ Đã tải: %4/%5MB (%6%)\n⏳ Ước tính thời gian còn lại: %7 giây",
			noVideo: "⭕ Rất tiếc, không tìm thấy video nào có dung lượng nhỏ hơn 83MB",
			noAudio: "⭕ Rất tiếc, không tìm thấy audio nào có dung lượng nhỏ hơn 26MB",
			info: "💠 [Sanzu AI YouTube Info]\nTiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscribers: %3\n⏱ Thời lượng: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày đăng: %7\n🔠 ID: %8\n🔗 Link: %9"
		},
		en: {
			error: "❌ Sanzu AI Error: %1",
			noResult: "⭕ No YouTube results found for: %1",
			choose: "%1Reply to this message with a number to select, or any key to cancel:\n",
			video: "video",
			audio: "audio",
			downloading: "⬇️ [Sanzu AI] Downloading %1 \"%2\"...",
			downloading2: "⬇️ [Sanzu AI] Downloading %1 \"%2\"\n🔃 Speed: %3MB/s\n⏸️ Downloaded: %4/%5MB (%6%)\n⏳ Time remaining: %7s",
			noVideo: "⭕ Sanzu AI: File size exceeds the 83MB video limit.",
			noAudio: "⭕ Sanzu AI: File size exceeds the 26MB audio limit.",
			info: "💠 [Sanzu AI YouTube Info]\nTitle: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscribers: %3\n⏱ Duration: %4\n👀 Views: %5\n👍 Likes: %6\n🆙 Upload Date: %7\n🔠 ID: %8\n🔗 Link: %9"
		}
	},

	onStart: async function ({ args, message, event, commandName, getLang, api }) {
		const { getStreamFromURL } = global.utils || {};

		if (!args[0]) return message.SyntaxError?.() || message.reply("⚠️ Paki-specify ang option: -v (video), -a (audio), o -i (info).");

		let type;
		switch (args[0].toLowerCase()) {
			case "-v":
			case "video":
				type = "video";
				break;
			case "-a":
			case "-s":
			case "audio":
			case "sing":
				type = "audio";
				break;
			case "-i":
			case "info":
				type = "info";
				break;
			default:
				return message.SyntaxError?.() || message.reply("⚠️ Invalid option!");
		}

		const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			try {
				const infoVideo = await getVideoInfo(args[1]);
				await handle({ type, infoVideo, message, getLang });
			} catch (err) {
				return message.reply(getLang("error", err.message));
			}
			return;
		}

		let keyWord = args.slice(1).join(" ");
		if (!keyWord) return message.reply("⚠️ Paki-lagay ang pangalan ng video o link!");

		keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
		const maxResults = 6;

		let result;
		try {
			result = (await search(keyWord)).slice(0, maxResults);
		} catch (err) {
			return message.reply(getLang("error", err.message));
		}

		if (!result || result.length === 0)
			return message.reply(getLang("noResult", keyWord));

		let msg = "";
		let i = 1;
		const thumbnails = [];

		for (const info of result) {
			if (getStreamFromURL && info.thumbnail) {
				thumbnails.push(getStreamFromURL(info.thumbnail));
			}
			msg += `${i++}. ${info.title}\n⏱️ Time: ${info.time}\n📺 Channel: ${info.channel.name}\n\n`;
		}

		const attachments = thumbnails.length > 0 ? await Promise.all(thumbnails) : [];

		message.reply({
			body: getLang("choose", msg),
			attachment: attachments
		}, (err, info) => {
			if (err) return;
			global.GoatBot?.onReply?.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				author: event.senderID,
				result,
				type
			});
		});
	},

	onReply: async ({ event, api, Reply, message, getLang }) => {
		const { result, type, author } = Reply;
		if (event.senderID !== author) return;

		const choice = parseInt(event.body, 10);
		if (!isNaN(choice) && choice >= 1 && choice <= result.length) {
			const infoChoice = result[choice - 1];
			api.unsendMessage(Reply.messageID);

			try {
				const infoVideo = await getVideoInfo(infoChoice.id);
				await handle({ type, infoVideo, message, getLang });
			} catch (err) {
				message.reply(getLang("error", err.message));
			}
		} else {
			api.unsendMessage(Reply.messageID);
		}
	}
};

async function handle({ type, infoVideo, message, getLang }) {
	const { title, videoId } = infoVideo;
	const tmpDir = path.join(__dirname, "tmp");
	await fs.ensureDir(tmpDir);

	if (type === "video") {
		const MAX_SIZE = 83 * 1024 * 1024;
		const msgSend = await message.reply(getLang("downloading", getLang("video"), title));
		
		try {
			const { formats } = await ytdl.getInfo(videoId);
			const getFormat = formats
				.filter(f => f.hasVideo && f.hasAudio)
				.sort((a, b) => (b.contentLength || 0) - (a.contentLength || 0))
				.find(f => (f.contentLength || 0) < MAX_SIZE);

			if (!getFormat) return message.reply(getLang("noVideo"));

			const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);
			if (getStream.size > MAX_SIZE) return message.reply(getLang("noVideo"));

			const savePath = path.join(tmpDir, `${videoId}_${Date.now()}.mp4`);
			const writeStream = fs.createWriteStream(savePath);

			getStream.stream.pipe(writeStream);

			writeStream.on("finish", () => {
				message.reply({
					body: `🎬 Sanzu AI - Video Download:\n${title}`,
					attachment: fs.createReadStream(savePath)
				}, async (err) => {
					if (err) message.reply(getLang("error", err.message));
					await fs.remove(savePath);
					if (msgSend?.messageID) message.unsend(msgSend.messageID);
				});
			});
		} catch (err) {
			return message.reply(getLang("error", err.message));
		}
	} else if (type === "audio") {
		const MAX_SIZE = 26 * 1024 * 1024;
		const msgSend = await message.reply(getLang("downloading", getLang("audio"), title));

		try {
			const { formats } = await ytdl.getInfo(videoId);
			const getFormat = formats
				.filter(f => f.hasAudio && !f.hasVideo)
				.sort((a, b) => (b.contentLength || 0) - (a.contentLength || 0))
				.find(f => (f.contentLength || 0) < MAX_SIZE);

			if (!getFormat) return message.reply(getLang("noAudio"));

			const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp3`);
			if (getStream.size > MAX_SIZE) return message.reply(getLang("noAudio"));

			const savePath = path.join(tmpDir, `${videoId}_${Date.now()}.mp3`);
			const writeStream = fs.createWriteStream(savePath);

			getStream.stream.pipe(writeStream);

			writeStream.on("finish", () => {
				message.reply({
					body: `🎵 Sanzu AI - Audio Download:\n${title}`,
					attachment: fs.createReadStream(savePath)
				}, async (err) => {
					if (err) message.reply(getLang("error", err.message));
					await fs.remove(savePath);
					if (msgSend?.messageID) message.unsend(msgSend.messageID);
				});
			});
		} catch (err) {
			return message.reply(getLang("error", err.message));
		}
	} else if (type === "info") {
		const { title, lengthSeconds, viewCount, videoId, uploadDate, likes, channel } = infoVideo;
		const formatNumber = global.utils?.formatNumber || ((n) => n.toLocaleString());
		const getStreamFromURL = global.utils?.getStreamFromURL;

		const hours = Math.floor(lengthSeconds / 3600);
		const minutes = Math.floor((lengthSeconds % 3600) / 60);
		const seconds = Math.floor(lengthSeconds % 60);
		const time = `${hours ? hours + ":" : ""}${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

		let msg = getLang("info", title, channel.name, formatNumber(channel.subscriberCount || 0), time, formatNumber(viewCount), formatNumber(likes), uploadDate, videoId, `https://youtu.be/${videoId}`);

		let attachments = [];
		if (getStreamFromURL) {
			attachments = await Promise.all([
				getStreamFromURL(infoVideo.thumbnails[infoVideo.thumbnails.length - 1].url),
				getStreamFromURL(infoVideo.channel.thumbnails[infoVideo.channel.thumbnails.length - 1].url)
			]).catch(() => []);
		}

		message.reply({
			body: msg,
			attachment: attachments
		});
	}
}

async function search(keyWord) {
	try {
		const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
		const res = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
			}
		});
		const getJson = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
		const videos = getJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		const results = [];

		for (const video of videos) {
			if (video.videoRenderer?.lengthText?.simpleText) {
				results.push({
					id: video.videoRenderer.videoId,
					title: video.videoRenderer.title.runs[0].text,
					thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
					time: video.videoRenderer.lengthText.simpleText,
					channel: {
						id: video.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
						name: video.videoRenderer.ownerText.runs[0].text,
						thumbnail: video.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.pop()?.url?.replace(/s[0-9]+\-c/g, '-c') || ''
					}
				});
			}
		}
		return results;
	} catch (e) {
		throw new Error("Sanzu AI Search Error: Hindi ma-search ang video.");
	}
}

async function getVideoInfo(id) {
	id = id.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|\/shorts\/)/);
	id = id[2] !== undefined ? id[2].split(/[^0-9a-z_\-]/i)[0] : id[0];

	const { data: html } = await axios.get(`https://youtu.be/${id}?hl=en`, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
		}
	});

	const json = JSON.parse(html.match(/var ytInitialPlayerResponse = (.*?});/)[1]);
	const json2 = JSON.parse(html.match(/var ytInitialData = (.*?});/)[1]);
	const { title, lengthSeconds, viewCount, videoId, thumbnail, author } = json.videoDetails;

	const owner = json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer?.owner;

	return {
		videoId,
		title,
		video_url: `https://youtu.be/${videoId}`,
		lengthSeconds: parseInt(lengthSeconds.match(/\d+/)[0], 10),
		viewCount: parseInt(viewCount.match(/\d+/)[0], 10),
		uploadDate: json.microformat?.playerMicroformatRenderer?.uploadDate || "N/A",
		likes: json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer?.videoActions?.menuRenderer?.topLevelButtons?.find(x => x.segmentedLikeDislikeButtonViewModel)?.segmentedLikeDislikeButtonViewModel?.likeButtonViewModel?.likeButtonViewModel?.toggleButtonViewModel?.toggleButtonViewModel?.defaultButtonViewModel?.buttonViewModel?.accessibilityText?.replace(/\.|,/g, '')?.match(/\d+/)?.[0] || 0,
		thumbnails: thumbnail.thumbnails,
		author: author,
		channel: {
			id: owner?.videoOwnerRenderer?.navigationEndpoint?.browseEndpoint?.browseId || "",
			username: owner?.videoOwnerRenderer?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "",
			name: owner?.videoOwnerRenderer?.title?.runs[0]?.text || author,
			thumbnails: owner?.videoOwnerRenderer?.thumbnail?.thumbnails || [],
			subscriberCount: parseAbbreviatedNumber(owner?.videoOwnerRenderer?.subscriberCountText?.simpleText || "0")
		}
	};
}

function parseAbbreviatedNumber(string) {
	if (!string) return 0;
	const match = string.replace(',', '.').replace(' ', '').match(/([\d,.]+)([MK]?)/);
	if (match) {
		let [, num, multi] = match;
		num = parseFloat(num);
		return Math.round(multi === 'M' ? num * 1000000 : multi === 'K' ? num * 1000 : num);
	}
	return 0;
}
