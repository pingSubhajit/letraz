import {Suspense} from 'react'
import ProcessingView from './processing.client'

type PageProps = {
  params: Promise<{ resumeId: string }>
}

const ResumeProcessingPage = async ({params}: PageProps) => {
  const {resumeId} = await params
  return (
    <Suspense fallback={null}>
      <ProcessingView resumeId={resumeId} />
    </Suspense>
  )
}

export default ResumeProcessingPage


