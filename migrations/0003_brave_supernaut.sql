CREATE TABLE IF NOT EXISTS "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_url" varchar,
	"title" varchar NOT NULL,
	"company_name" varchar NOT NULL,
	"location" varchar,
	"salary_max" varchar,
	"salary_min" varchar,
	"requirements" varchar[],
	"description" varchar,
	"responsibilities" varchar[],
	"benefits" varchar[]
);
