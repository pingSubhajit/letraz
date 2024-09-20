CREATE TABLE IF NOT EXISTS "educations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"institution_name" varchar,
	"first_name" varchar,
	"degree" varchar,
	"country" varchar,
	"started_from_month" integer,
	"started_from_year" integer,
	"finished_at_month" integer,
	"finished_at_year" integer,
	"current" boolean,
	"description" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
