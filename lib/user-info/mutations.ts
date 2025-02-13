import {UserInfo, UserInfoMutation} from '@/lib/user-info/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {addOrUpdateUserInfoToDB} from './actions'

export const useUpdateUserInfoMutation = (options?: MutationOptions<UserInfo, Error, UserInfoMutation>) => {
	return useMutation({
		mutationFn: async (userInfo) => addOrUpdateUserInfoToDB(userInfo),
		...options
	})
}
