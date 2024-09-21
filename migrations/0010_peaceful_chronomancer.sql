CREATE TABLE IF NOT EXISTS "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_name" varchar,
	"job_title" varchar,
	"city" varchar,
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
