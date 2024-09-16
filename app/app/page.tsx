import NewResumeInput from '@/components/NewResumeInput'

const AppHome = () => {
	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome to the dashboard page!</p>

			<div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
				<NewResumeInput className="rounded-lg" />
				<div className="h-96 w-full bg-red-200 rounded-lg" />
				<div className="h-96 w-full bg-amber-200 rounded-lg" />
				<div className="h-96 w-full bg-rose-200 rounded-lg" />
				<div className="h-96 w-full bg-teal-200 rounded-lg" />
				<div className="h-96 w-full bg-purple-200 rounded-lg" />
				<div className="h-96 w-full bg-violet-200 rounded-lg" />
				<div className="h-96 w-full bg-yellow-200 rounded-lg" />
				<div className="h-96 w-full bg-orange-200 rounded-lg" />
				<div className="h-96 w-full bg-lime-200 rounded-lg" />
				<div className="h-96 w-full bg-sky-200 rounded-lg" />
				<div className="h-96 w-full bg-emerald-200 rounded-lg" />
				<div className="h-96 w-full bg-cyan-200 rounded-lg" />
				<div className="h-96 w-full bg-green-200 rounded-lg" />
				<div className="h-96 w-full bg-pink-200 rounded-lg" />
			</div>
		</div>
	)
}

export default AppHome
