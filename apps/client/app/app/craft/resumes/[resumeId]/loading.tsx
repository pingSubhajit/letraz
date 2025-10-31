import ResumeEditorSkeleton from '@/components/skeletons/ResumeEditorSkeleton'
import {ResumeHighlightProvider} from '@/components/resume/contexts/ResumeHighlightContext'

const Loading = () => {
	return (
		<ResumeHighlightProvider>
			<div className="flex h-screen w-full" role="main">
				<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative overflow-hidden shrink-0" />
				<div className="flex-1 min-w-0">
					<ResumeEditorSkeleton className="size-full bg-neutral-50 p-12" />
				</div>
			</div>
		</ResumeHighlightProvider>
	)
}

export default Loading

