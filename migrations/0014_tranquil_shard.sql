ALTER TYPE "resume_section_type" ADD VALUE 'projects';--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_base_unique" UNIQUE("user_id","base");