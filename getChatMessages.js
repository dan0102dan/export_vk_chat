import { vk } from './botTokens.js'
import fs from 'fs'
import { join } from 'path'

const id = 387716579 //id собеседника
let offset = 0 // начиная с какого сообщения сохранить переписку (если с начала переписки, то оставьте 0)

async function getChat () {
	var messages = []

	let chat = await vk.api.messages.getHistory({ peer_id: id, count: 200, offset }).catch((e) => console.log(e))
	offset = 200
	for (let value of chat.items) {
		let date = new Date(value.date)
		if (value.from_id === id) messages.push(`(${date.toLocaleString('ru', { day: 'numeric', month: 'long' })}) Собеседник: 🌝 ` + value.text)
		else messages.push(`(${date.toLocaleString('ru', { day: 'numeric', month: 'long' })}) Вы: 🌚 ` + value.text)
	}

	while (offset < chat.count) {
		console.log(offset + ' ' + chat.count)
		chat = await vk.api.messages.getHistory({ peer_id: id, count: 200, offset }).catch((e) => console.log(e))
		offset += 200
		for (let value of chat.items) {
			let date = new Date(value.date)
			if (value.from_id === id) messages.push(`(${date.toLocaleString('ru', { day: 'numeric', month: 'long' })}) Собеседник: 🌝 ` + value.text)
			else messages.push(`(${date.toLocaleString('ru', { day: 'numeric', month: 'long' })}) Вы: 🌚 ` + value.text)
		}
	}
	await fs.promises.mkdir(join(__dirname, `../chat_${id}`), { recursive: true })
	fs.writeFileSync(join(__dirname, `../chat_${id}/${Date.now()}.txt`), messages.join('\n'))
	console.log('все')
}
getChat()
