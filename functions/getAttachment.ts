import fs from 'fs'
import axios from 'axios'

export default async (attachments, path) => {
	const files = []

	for (const attachment of attachments) {
		console.log(attachment)
		switch (attachment.type) {
			case 'photo': {
				if (attachment.photo?.orig_photo?.url)
					files.push({
						name: `photo_${attachment.photo.id}.jpg`,
						link: attachment.photo.orig_photo.url
					})
				break
			}
			case 'video': {
				// console.log(attachment)
				break
			}
			case 'audio': {
				if (attachment.audio?.url)
					files.push({
						name: `audio_${attachment.audio.id}.mp3`,
						link: attachment.audio.url
					})
				break
			}
			case 'audio_message': {
				if (attachment.audio_message?.link_mp3)
					files.push({
						name: `audio_message_${attachment.audio_message.id}.mp3`,
						link: attachment.audio_message.link_mp3
					})
				break
			}
			case 'sticker': {
				if (attachment.sticker?.images?.url?.at(-1))
					files.push({
						name: `sticker_${attachment.sticker.id}.png`,
						link: attachment.sticker.images.url.at(-1)
					})
				break
			}
			case 'gift': {
				const prop = Object.keys(attachment.gift).map(e => e.split('_')).filter(e => Number(e[1])).sort((a, b) => Number(b[1]) - Number(a[1]))[0].join('_')
				if (attachment?.gift[prop])
					files.push({
						name: `gift_${attachment.gift.id}.jpg`,
						link: attachment.gift[prop]
					})
				break
			}
			case 'doc': {
				if (attachment.doc?.url)
					files.push({
						name: `${attachment.doc.title}_document.${attachment.doc.ext}`,
						link: attachment.doc.url
					})
				break
			}
			default:
				console.log('New type of data, create an issue if its important!', attachment)
				break
		}

		for (const file of files)
			try {
				const stream = fs.createWriteStream(`${path}/${file.name}`)
				await axios({
					url: file.link,
					method: 'GET',
					responseType: 'stream'
				})
					.then(response =>
						new Promise((resolve, reject) => {
							response.data.pipe(stream)

							stream.on('error', reject)
							stream.on('close', resolve)
						})
					)
			} catch {
				continue
			}
	}

	return files
}