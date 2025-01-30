'use client'

const LandingPageVideo = () => {
	return (
		<video
			loop
			autoPlay
			muted
			playsInline
			preload="none"
			className={'w-full h-full object-cover'}
		>
			<source
				src="/letraz-intro.webm"
				type="video/webm"
			/>
			<source
				src="/letraz-intro.mp4"
				type="video/mp4"
			/>
		</video>
	)
}

export default LandingPageVideo
