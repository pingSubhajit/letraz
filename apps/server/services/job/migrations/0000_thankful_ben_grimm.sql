CREATE TABLE "jobs" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"job_url" varchar(1000),
	"title" varchar(250) NOT NULL,
	"company_name" varchar(250) NOT NULL,
	"location" varchar(100),
	"currency" varchar(5),
	"salary_max" bigint,
	"salary_min" bigint,
	"requirements" jsonb,
	"description" varchar(3000),
	"responsibilities" jsonb,
	"benefits" jsonb,
	"status" varchar(1),
	"process_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
