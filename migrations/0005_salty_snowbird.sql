CREATE TABLE IF NOT EXISTS "personal_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"dob" date,
	"nationality" varchar,
	"address" varchar,
	"city" varchar,
	"postal" varchar,
	"country" varchar,
	"website" varchar,
	"profile_text" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
