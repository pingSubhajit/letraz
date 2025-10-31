import {useEffect, useState} from 'react'

const useDomMounted = () => {
	const [mounted, setDomMounted] = useState(false)

	useEffect(() => {
		setDomMounted(true)
	}, [])

	return mounted
}

export default useDomMounted
