import {Bucket} from 'encore.dev/storage/objects'

/**
 * Resume Thumbnails Bucket
 * Stores generated thumbnail images for resumes
 * Public bucket to allow direct access to thumbnails via CDN
 */
export const resumeThumbnails = new Bucket('resume-thumbnails', {
	public: true,
	versioned: false
})

