import {getUserInfo} from './actions'

import {queryOptions, useQuery} from '@tanstack/react-query'


export const userInfoQueryOption = queryOptions({
	queryKey: ['user-info'],
	queryFn: getUserInfo
})


export const useUserInfoQuery = () => useQuery(userInfoQueryOption)

