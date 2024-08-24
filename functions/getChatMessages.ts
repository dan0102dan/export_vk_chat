import { setTimeout } from 'timers/promises'
import { API, getAttachment } from './index'
import fs from 'fs'
export default async (user_id: number) => {
	const path = `${process.cwd()}/${user_id}`
	fs.mkdirSync(path, { recursive: true }) // создаём папку, куда будем кидать все данные)

	const messages = fs.createWriteStream(`${path}/_chat.txt`)
	let canContinue = true, offset = 0

	while (canContinue) {
		try {
			const { data } = await API.post('/method/messages.getHistory', {}, {
				params: {
					user_id,
					count: 200,
					rev: 1,
					offset
				}
			})
			if (!data)
				return console.error('Chat not found, check', '\x1b[36mconfig.ts\x1b[0m')
			if (data.error)
				return console.error('Error:', data.error.error_msg)

			const chat = data.response
			for (const message of chat?.items) {
				console.log(message)
				message.date = new Date(message.date * 1000)
				const date = `[${String(message.date.getDate()).padStart(2, '0')}.${String(message.date.getMonth()).padStart(2, '0')}.${message.date.getFullYear()}, ${String(message.date.getHours()).padStart(2, '0')}:${String(message.date.getSeconds()).padStart(2, '0')}:${String(message.date.getMilliseconds()).padStart(2, '0')}]`

				if (message.text?.length > 0)
					messages.write(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + message.text + '\n')
				if (message.attachments?.length > 0) {
					const files = await getAttachment(message.attachments, path)
					for (const file of files)
						messages.write(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + `<attached: ${file.name}>` + '\n')
				}
			}

			offset += chat?.items?.length
			canContinue = chat?.items?.length > 0
		} catch (e) {
			return console.error('Error:', e.response.data.error.error_msg)
		}
		await setTimeout(5000)
	}

	console.log('Complete! Saved folder: ', path)
}