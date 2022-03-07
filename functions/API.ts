import axios from 'axios'
import { access_token } from '../config'

export default axios.create({
	baseURL: 'https://api.vk.com',
	headers: {
		'User-Agent': 'VKAndroidApp/6.7-5621 (Android 10; SDK 29; arm64-v8a; Ur App; ru; 1920x720)'
	},
	params: {
		lang: 'ru',
		access_token
	}
})