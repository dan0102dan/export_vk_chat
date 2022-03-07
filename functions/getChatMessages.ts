import { API, getAttachment } from './index.js'
import fs from 'fs'

export default async function (user_id) {
	const path = `${process.cwd()}/${user_id}`
	fs.mkdirSync(path, { recursive: true }) // создаём папку, куда будем кидать все данные)

	const messages = fs.createWriteStream(`${path}/_chat.txt`)
	let canContinue = true, offset = 0

	while (canContinue) {
		const { data: { response: chat } } = await API.post('/method/messages.getHistory', {}, {
			params: {
				user_id,
				count: 200,
				rev: 1,
				offset
			}
		})

		for (const message of chat?.items) {
			message.date = new Date(message.date * 1000)
			const date = `[${String(message.date.getDate()).padStart(2, '0')}.${String(message.date.getMonth()).padStart(2, '0')}.${message.date.getFullYear()}, ${String(message.date.getHours()).padStart(2, '0')}:${String(message.date.getSeconds()).padStart(2, '0')}:${String(message.date.getMilliseconds()).padStart(2, '0')}]`

			if (message.body?.length > 0)
				messages.write(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + message.body + '\n')
			if (message.attachments?.length > 0) {
				const files = await getAttachment(message.attachments, path)
				for (const file of files)
					messages.write(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + `<attached: ${file.name}>` + '\n')
			}
		}

		offset += chat?.items?.length
		canContinue = chat?.items?.length > 0
	}

	console.log('все')
}