CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"technologies" varchar[],
	"role" varchar NOT NULL,
	"accomplishments" varchar[],
	"links" varchar[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
