export default function Home() {
	return (
		<main className="h-screen overflow-hidden flex justify-center items-center">
			<video autoPlay muted loop poster="/banner.png" className="aspect-video">
				<source src="/letraz-intro.mp4" type="video/mp4"/>
				Your browser does not support the video tag. You can <a href="/letraz-intro.mp4">download the video</a> instead.
			</video>
		</main>
	)
}
