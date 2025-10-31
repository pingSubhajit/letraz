import {queryOptions, useQuery} from '@tanstack/react-query'
import {USER_INFO_QUERY_KEY} from '@/lib/user-info/keys'
import {getPersonalInfoFromDB} from '@/lib/user-info/actions'

export const userInfoQueryOptions = queryOptions({
	queryKey: USER_INFO_QUERY_KEY,
	queryFn: getPersonalInfoFromDB

})

export const useUserInfoQuery = () => {return useQuery(userInfoQueryOptions)}
