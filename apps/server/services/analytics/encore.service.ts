import {Service} from 'encore.dev/service'
import {adminPathMiddleware} from '@/services/utils/admin-middleware'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

export default new Service('analytics', {
	middlewares: [errorHandlingMiddleware, adminPathMiddleware]
})
