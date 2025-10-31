import {middleware} from 'encore.dev/api'
import {handleError} from './errors'
import {v4 as uuidv4} from 'uuid'

/**
 * Global Error Handling Middleware
 * This middleware catches and processes all errors thrown by endpoints,
 * converting them to properly formatted API errors.
 */
export const errorHandlingMiddleware = middleware({}, async (req, next) => {
	try {
		return await next(req)
	} catch (err) {
		throw handleError(err, uuidv4())
	}
})

