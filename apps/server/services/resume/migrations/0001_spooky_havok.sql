ALTER TABLE "resumes" DROP CONSTRAINT "resumes_thumbnail_process_id_resume_processes_id_fk";
--> statement-breakpoint
ALTER TABLE "resumes" DROP COLUMN "thumbnail_process_id";