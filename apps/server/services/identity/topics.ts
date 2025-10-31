import {Topic} from 'encore.dev/pubsub'
import {UserCreatedEvent} from '@/services/identity/interface'

export const userCreated = new Topic<UserCreatedEvent>('user-created', {
	deliveryGuarantee: 'at-least-once'
})
