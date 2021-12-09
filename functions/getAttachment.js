import fs from 'fs'
import axios from 'axios'

export default async function (attachments, path) {
	const files = []

	for (const attachment of attachments) {
		switch (attachment.type) {
			case 'photo': {
				const prop = Object.keys(attachment.photo).map(e => e.split('_')).filter(e => Number(e[1])).sort((a, b) => Number(b[1]) - Number(a[1]))[0].join('_')
				if (attachment?.photo[prop]) {
					attachment.photo.date = new Date(attachment.photo.date * 1000)
					files.push({
						name: `${attachment.photo.id}-PHOTO-${attachment.photo.date.getFullYear()}-${String(attachment.photo.date.getMonth()).padStart(2, '0')}-${String(attachment.photo.date.getDate()).padStart(2, '0')}-${String(attachment.photo.date.getHours()).padStart(2, '0')}-${String(attachment.photo.date.getSeconds()).padStart(2, '0')}-${String(attachment.photo.date.getMilliseconds()).padStart(2, '0')}.jpg`,
						link: attachment.photo[prop]
					})
				}
				break
			}
			case 'video': {
				// console.log(attachment)
				break
			}
			case 'audio': {
				if (attachment.audio?.url)
					files.push({
						name: `${attachment.audio.owner_id}-${attachment.audio.id}'.mp3`,
						link: attachment.audio.url
					})
				break
			}
			case 'audio_message': {
				if (attachment.audio_message?.link_mp3)
					files.push({
						name: `${attachment.photo.id}.mp3`,
						link: attachment.audio_message.link_mp3
					})
				break
			}
			case 'sticker': {
				const prop = Object.keys(attachment.sticker).map(e => e.split('_')).filter(e => Number(e[1])).sort((a, b) => Number(b[1]) - Number(a[1]))[0].join('_')
				if (attachment?.sticker[prop]) {
					attachment.sticker.date = new Date(attachment.sticker.date * 1000)
					files.push({
						name: `${attachment.sticker.id}-PHOTO-${attachment.sticker.date.getFullYear()}-${String(attachment.sticker.date.getMonth()).padStart(2, '0')}-${String(attachment.sticker.date.getDate()).padStart(2, '0')}-${String(attachment.sticker.date.getHours()).padStart(2, '0')}-${String(attachment.sticker.date.getSeconds()).padStart(2, '0')}-${String(attachment.sticker.date.getMilliseconds()).padStart(2, '0')}.png`,
						link: attachment.sticker[prop]
					})
				}
				break
			}
			case 'gift': {
				const prop = Object.keys(attachment.gift).map(e => e.split('_')).filter(e => Number(e[1])).sort((a, b) => Number(b[1]) - Number(a[1]))[0].join('_')
				console.log('приз', attachment.gift[prop])
				if (attachment?.gift[prop]) {
					attachment.gift.date = new Date(attachment.gift.date * 1000)
					files.push({
						name: `${attachment.gift.id}-PHOTO-${attachment.gift.date.getFullYear()}-${String(attachment.gift.date.getMonth()).padStart(2, '0')}-${String(attachment.gift.date.getDate()).padStart(2, '0')}-${String(attachment.gift.date.getHours()).padStart(2, '0')}-${String(attachment.gift.date.getSeconds()).padStart(2, '0')}-${String(attachment.gift.date.getMilliseconds()).padStart(2, '0')}.jpg`,
						link: attachment.gift[prop]
					})
				}
				break
			}
			case 'doc': {
				console.log(attachment.doc.name)
				if (attachment.doc?.url)
					files.push({
						name: `${attachment.doc.name}.${attachment.doc.ext}`,
						link: attachment.doc.url
					})
				break
			}
			default:
				// console.log('пока не научился', attachment)
				break
		}
	}

	for (const file of files) {
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