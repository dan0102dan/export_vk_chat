import { API, getAttachment } from './index.js'
import fs from 'fs'

export default async function (user_id) {
	const path = `${process.cwd()}/${user_id}`
	fs.mkdirSync(path, { recursive: true }) // создаём папку, куда будем кидать все данные)

	const messages = []
	let canContinue = true, offset = 0

	while (canContinue) {
		const { data: { response: chat } } = await API.post('/method/messages.getHistory', {}, {
			params: {
				user_id,
				count: 200,
				offset
			}
		})

		for (const message of chat?.items) {
			message.date = new Date(message.date * 1000)
			const date = `[${String(message.date.getDate()).padStart(2, '0')}.${String(message.date.getMonth()).padStart(2, '0')}.${message.date.getFullYear()}, ${String(message.date.getHours()).padStart(2, '0')}:${String(message.date.getSeconds()).padStart(2, '0')}:${String(message.date.getMilliseconds()).padStart(2, '0')}]`

			if (message.body?.length > 0)
				messages.push(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + message.body + '\n')
			if (message.attachments?.length > 0) {
				const files = await getAttachment(message.attachments, path)
				for (const file of files)
					messages.push(`${date} ${message.from_id === user_id ? 'Собеседник' : 'You'}: ` + `<attached: ${file.name}>` + '\n')
			}
		}

		offset += chat?.items?.length
		canContinue = chat?.items?.length > 0
	}

	fs.writeFileSync(`${path}/_chat.txt`, messages.join('\n'))
	console.log('все')
}
