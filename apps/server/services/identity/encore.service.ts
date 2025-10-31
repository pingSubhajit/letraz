import {Service} from 'encore.dev/service'
import {errorHandlingMiddleware} from '@/services/utils/middleware'

export default new Service('identity', {
	middlewares: [errorHandlingMiddleware]
})

