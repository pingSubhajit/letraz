import {Card} from '@/components/ui/card'
import {FlickeringGrid} from '@/components/ui/flickering-grid'

const LandingPageFeatures = () => {
	return (
		<section className="w-full px-4">
			{/* Bento Grid Container */}
			<div
				className="grid gap-4 w-full max-w-7xl mx-auto min-h-[800px] lg:min-h-[900px]"
				style={{
					gridTemplateColumns: 'repeat(12, 1fr)',
					gridTemplateRows: 'repeat(8, 1fr)'
				}}
			>
				<Card
					className="bg-neutral-300 rounded-2xl"
					style={{gridArea: '7 / 10 / 9 / 13'}}
				></Card>

				<Card
					className="bg-neutral-300 rounded-2xl"
					style={{gridArea: '4 / 10 / 7 / 13'}}
				></Card>

				<Card
					className=" rounded-2xl overflow-hidden border-none bg-[radial-gradient(circle,rgba(245,245,245,1)_0%,rgba(229,229,229,1)_100%)]"
					style={{gridArea: '4 / 6 / 9 / 10'}}
				>
					<FlickeringGrid />
				</Card>

				<Card
					className="bg-neutral-300 rounded-2xl"
					style={{gridArea: '6 / 1 / 9 / 6'}}
				>

				</Card>

				<Card
					className="bg-neutral-300 rounded-2xl"
					style={{gridArea: '4 / 1 / 6 / 6'}}
				>

				</Card>

				<Card
					className="bg-flame-500 rounded-2xl"
					style={{gridArea: '1 / 1 / 4 / 6'}}
				></Card>

				<Card
					className="bg-neutral-300 rounded-2xl"
					style={{gridArea: '1 / 6 / 4 / 13'}}
				></Card>
			</div>
		</section>
	)
}

export default LandingPageFeatures
