CREATE TABLE "processes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"util_id" varchar(60),
	"desc" varchar(250) NOT NULL,
	"status" varchar(15) DEFAULT 'INITIATED' NOT NULL,
	"status_details" varchar(250),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
