ALTER TABLE "personal_info" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_info" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_user_id_unique" UNIQUE("user_id");