import {UserInfo, UserInfoMutation} from '@/lib/user-info/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {updateUserInfo} from './actions'
// import {userInfoQueryOption} from './queries'


export const useUpadataUserInfoMutation = (options?: MutationOptions<UserInfo, Error, UserInfoMutation>) => {
	// const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (userInfo) => updateUserInfo(userInfo),
		// TODO: Implement the optimistic update
		/*
		 * onMutate: async (newUserInfo) => {
		 * 	await queryClient.cancelQueries(userInfoQueryOption)
		 * 	const previousUserInfo = queryClient.getQueryData<UserInfo>(['user-info'])
		 * 	queryClient.setQueryData(['user-info'], newUserInfo)
		 * 	return {previousUserInfo}
		 * },
		 */
		/*
		 * onError: (err, newUserInfo, context) => {
		 * 	if (context?.previousUserInfo) {
		 * 		queryClient.setQueryData(['user-info'], context.previousUserInfo)
		 * 	}
		 * },
		 * onSettled: () => {
		 * 	queryClient.invalidateQueries(userInfoQueryOption)
		 * },
		 */
		...options
	})
}
