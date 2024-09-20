CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"waiting_number" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
