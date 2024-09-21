DO $$ BEGIN
 CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'freelance', 'self_employed', 'volunteer', 'trainee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "employment_type" "employment_type";