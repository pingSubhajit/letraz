// Central definition of analytics events and their properties
export type AnalyticsEvents =
	| {name: 'marketing_landing_view', properties?: {referrer_domain?: string, utm_source?: string, utm_medium?: string, utm_campaign?: string}}
	| {name: 'waitlist_submitted', properties?: {referrer?: string}}
	| {name: 'signup_started', properties?: Record<string, never>}
	| {name: 'signup_completed', properties?: Record<string, never>}
	| {name: 'onboarding_step_viewed', properties: {step: string}}
	| {name: 'onboarding_step_completed', properties: {step: string}}
	| {name: 'onboarding_completed', properties?: Record<string, never>}
	| {name: 'tailor_resume_submitted', properties: {target_type: 'url' | 'text', input_length_bucket: string, has_base_resume: boolean}}
	| {name: 'tailor_resume_created', properties: {resume_id: string, source?: 'dashboard' | 'cta'}}
	| {name: 'tailor_resume_ready', properties: {resume_id: string, processing_time_ms?: number, thumbnail: boolean}}
	| {name: 'tailor_resume_failed', properties: {error_category?: string, http_status?: number}}
	| {name: 'resume_import_submitted', properties: {file_type: string, file_size_kb_bucket: string}}
	| {name: 'resume_import_completed', properties: {extracted_sections_count?: number}}
	| {name: 'resume_import_failed', properties: {error_category?: string}}
	| {name: 'editor_tab_selected', properties: {tab: 'profile' | 'education' | 'experience' | 'skills' | 'certifications' | 'projects'}}
	| {name: 'section_reordered', properties?: Record<string, never>}
	| {name: 'resume_saved', properties: {resume_id?: string, sections_count?: number}}
	| {name: 'resume_opened', properties: {resume_id: string, base: boolean, status?: string | null}}
	| {name: 'resume_search', properties: {query_length_bucket: string, results_count_bucket?: string}}
	| {name: 'resume_deleted', properties: {resume_id: string, base?: boolean, has_exported_before?: boolean}}
	| {name: 'resume_export_clicked', properties: {resume_id: string, format: 'pdf' | 'tex'}}
	| {name: 'resume_export_succeeded', properties: {resume_id: string, format: 'pdf' | 'tex'}}
	| {name: 'resume_export_failed', properties: {resume_id: string, format: 'pdf' | 'tex', error_category?: string}}

export type AnalyticsEventName = AnalyticsEvents['name']
export type AnalyticsEventProps<T extends AnalyticsEventName> = Extract<AnalyticsEvents, {name: T}>['properties']
