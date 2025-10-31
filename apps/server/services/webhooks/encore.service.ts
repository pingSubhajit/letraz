import {Service} from 'encore.dev/service'
import {adminPathMiddleware} from '@/services/utils/admin-middleware'

export default new Service('webhooks', {
	middlewares: [adminPathMiddleware]
})
