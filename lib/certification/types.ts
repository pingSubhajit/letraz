import {z} from 'zod'

/*
 * Base schema for Certification
 * Based on the API documentation provided
 */
export const CertificationSchema = z.object({
	id: z.string().uuid().describe('Unique identifier for the certification').readonly(),
	name: z.string().max(255).describe('Name of the certification.'),
	issuing_organization: z.string().max(255).nullable().optional().describe('Organization that issued the certification'),
	issue_date: z.string().nullable().optional().describe('Date when the certification was issued.'),
	credential_url: z.string().max(200).nullable().optional().describe('Link to the certification credential.'),
	created_at: z.string().readonly().describe('Timestamp when the certification was first created.'),
	updated_at: z.string().readonly().describe('Timestamp when the certification was last updated.'),
	user: z.string().describe('The user who owns this certification'),
	resume_section: z.string().uuid().describe('The unique identifier for the resume section entry.')
})

/**
 * Schema for CertificationMutation
 * Derived by omitting read-only fields from CertificationSchema
 * Required fields: name, issuing_organization, issue_date
 * Optional field: credential_url
 */
export const CertificationMutationSchema = CertificationSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	user: true,
	resume_section: true
}).extend({
	name: z.string().min(1, {message: 'Required'}).max(255).describe('Name of the certification.'),
	issuing_organization: z.string().max(255).optional().describe('Organization that issued the certification'),
	// Accept ISO date string, Date, or null (parser may return null for unknown)
	issue_date: z.union([z.string(), z.date(), z.null(), z.undefined()]).optional().describe('Date when the certification was issued.'),
	credential_url: z.string().max(200).nullable().optional().describe('Link to the certification credential.')
})

// Infer TypeScript types from the schema
export type Certification = z.infer<typeof CertificationSchema>
export type CertificationMutation = z.infer<typeof CertificationMutationSchema>
