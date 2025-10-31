import LaunchCountdown from '@/components/utilities/LaunchCountdown'

const Home = () => (
	<div
		className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 h-full gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
		<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
			<LaunchCountdown />
		</main>
	</div>
)
export default Home
