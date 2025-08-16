import NewResumeInput from '@/components/NewResumeInput'
import {Suspense} from 'react'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'
import Link from 'next/link'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import {auth} from '@clerk/nextjs/server'
import {listResumesForUser} from '@/lib/resume/actions'

const AppHome = async () => {
	const {userId} = await auth()
	const resumes = await listResumesForUser()
	const baseResume = resumes?.find(r => r.base)

	return (
		<div className="p-8">
			<Suspense fallback={null}>
				<OnboardingWelcome />
			</Suspense>


			{/* Top row with centered Input box and Base Resume */}
			<div className="flex justify-center gap-8 mb-8">
				<NewResumeInput className="rounded-lg h-96 w-72" />
				{baseResume && (
					<Link href={`/app/craft?jobId=${encodeURIComponent(baseResume.id)}`} className="group">
						<div className="h-96 w-72 rounded-lg border-2 border-flame-400 bg-white overflow-hidden transition hover:shadow-2xl">
							<div className="flex-1 bg-white flex items-center justify-center h-[calc(100%-60px)]">
								{baseResume.thumbnail ? (
									<img
										src={baseResume.thumbnail}
										alt="Base resume"
										className="h-full w-full object-cover object-top"
									/>
								) : (
									<div className="text-sm text-neutral-500">No preview</div>
								)}
							</div>
							<div className="p-3 border-t bg-flame-500 text-white h-[60px]">
								<div className="text-sm flex flex-col">
									<p className="truncate font-semibold text-base">Base resume</p>
									<p className="text-xs text-white/70 truncate">Master resume for tailoring</p>
								</div>
							</div>
						</div>
					</Link>
				)}
			</div>

			{/* Search and Resume Grid Container */}
			<DashboardSearchContainer userId={userId || undefined} />
		</div>
	)
}

export default AppHome