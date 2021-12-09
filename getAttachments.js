import { vk } from './botTokens.js'

import fs from 'fs'
import { join, resolve } from 'path'
import axios from 'axios'

const id = 387716579 // id собеседника
const media_type = 'video' // тип вложения (photo, video, audio_message)
const messageID = 0 // начиная с какого сообщения скачать вложения (если с начала переписки, то оставьте 0)
const folder = 'attachments' // введите имя папки, куда будет сохранён файл 

async function getAttachments () {
	const __dirname = join(resolve(), `../${folder}`), links = []

	let attachment = await vk.api.messages.getHistoryAttachments({ peer_id: id, media_type: media_type, count: 200 }).catch((e) => console.log(e))
	for (let value of attachment.items) {
		if (value.message_id >= messageID)
			if (media_type === 'video') {
				const { files } = value.attachment.video
				if (files) links.push(files.mp4_1080 || files.mp4_720 || files.mp4_480 || files.mp4_360 || files.mp4_240)
			} else if (media_type === 'photo') {
				if (value.attachment.photo.sizes[value.attachment.photo?.sizes.length - 1]?.url) links.push(value.attachment.photo.sizes[value.attachment.photo.sizes.length - 1].url)
			} else if (media_type === 'audio_message') {
				if (value.attachment?.audio_message?.link_mp3) links.push(value.attachment.audio_message.link_mp3)
			}
	}
	while (attachment.next_from) {
		attachment = await vk.api.messages.getHistoryAttachments({ peer_id: id, media_type: media_type, count: 200, start_from: attachment.next_from }).catch((e) => console.log(e))
		for (let value of attachment.items) {
			if (value.message_id >= messageID)
				if (media_type === 'video') {
					const { files } = value.attachment.video
					if (files) links.push(files.mp4_1080 || files.mp4_720 || files.mp4_480 || files.mp4_360 || files.mp4_240)
				} else if (media_type === 'photo') {
					if (value.attachment.photo.sizes[value.attachment.photo?.sizes.length - 1]?.url) links.push(value.attachment.photo.sizes[value.attachment.photo.sizes.length - 1].url)
				} else if (media_type === 'audio_message') {
					if (value.attachment?.audio_message?.link_mp3) links.push(value.attachment.audio_message.link_mp3)
				}
		}
	}
	console.log('Файлов найдено: ' + links.length)
	//создаем папку
	fs.mkdirSync(__dirname, { recursive: true })
	console.log(`Была создана папка attachments. Путь: ${__dirname}`)

	console.log('Началась загрузка файлов, не закрывайте это окно.')

	for (let value of links) {
		if (value)
			await axios({
				url: value,
				method: 'GET',
				responseType: 'stream'
			}).then(async function (response) {
				await response.data.pipe(fs.createWriteStream(join(__dirname, `/${Date.now()}${media_type === 'photo' ? '.jpg' : media_type === 'video' ? '.mp4' : '.mp3'}`)))
			})
	}
} getAttachments()