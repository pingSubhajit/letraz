CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"resume_section_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"issuing_organization" varchar(255),
	"issue_date" date,
	"credential_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "educations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"resume_section_id" uuid NOT NULL,
	"institution_name" varchar(250) NOT NULL,
	"field_of_study" varchar(250) NOT NULL,
	"degree" varchar(250),
	"country_code" varchar(3),
	"started_from_month" integer,
	"started_from_year" integer,
	"finished_at_month" integer,
	"finished_at_year" integer,
	"current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"resume_section_id" uuid NOT NULL,
	"company_name" varchar(250) NOT NULL,
	"job_title" varchar(250) NOT NULL,
	"employment_type" varchar(20) NOT NULL,
	"city" varchar(50),
	"country_code" varchar(3),
	"started_from_month" integer,
	"started_from_year" integer,
	"finished_at_month" integer,
	"finished_at_year" integer,
	"current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proficiencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"resume_section_id" uuid NOT NULL,
	"level" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_skills" (
	"project_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "project_skills_project_id_skill_id_pk" PRIMARY KEY("project_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"resume_section_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255),
	"description" text,
	"role" varchar(255),
	"github_url" varchar(500),
	"live_url" varchar(500),
	"started_from_month" integer,
	"started_from_year" integer,
	"finished_at_month" integer,
	"finished_at_year" integer,
	"current" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_processes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"desc" varchar(250) NOT NULL,
	"status" varchar(15) DEFAULT 'INITIATED' NOT NULL,
	"status_details" varchar(250),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" varchar(25) NOT NULL,
	"index" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resume_sections_resume_id_index_unique" UNIQUE("resume_id","index")
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"job_id" varchar(25),
	"base" boolean DEFAULT false NOT NULL,
	"status" varchar(20),
	"thumbnail" varchar(1000),
	"process_id" uuid,
	"thumbnail_process_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resumes_user_id_job_id_unique" UNIQUE("user_id","job_id")
);
--> statement-breakpoint
CREATE TABLE "skill_aliases" (
	"skill_id" uuid NOT NULL,
	"alias_id" uuid NOT NULL,
	CONSTRAINT "skill_aliases_skill_id_alias_id_pk" PRIMARY KEY("skill_id","alias_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(250) NOT NULL,
	"category" varchar(50),
	"preferred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_category_name_unique" UNIQUE("category","name")
);
--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_resume_section_id_resume_sections_id_fk" FOREIGN KEY ("resume_section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educations" ADD CONSTRAINT "educations_resume_section_id_resume_sections_id_fk" FOREIGN KEY ("resume_section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_resume_section_id_resume_sections_id_fk" FOREIGN KEY ("resume_section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proficiencies" ADD CONSTRAINT "proficiencies_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proficiencies" ADD CONSTRAINT "proficiencies_resume_section_id_resume_sections_id_fk" FOREIGN KEY ("resume_section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_resume_section_id_resume_sections_id_fk" FOREIGN KEY ("resume_section_id") REFERENCES "public"."resume_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_process_id_resume_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."resume_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_thumbnail_process_id_resume_processes_id_fk" FOREIGN KEY ("thumbnail_process_id") REFERENCES "public"."resume_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_alias_id_skills_id_fk" FOREIGN KEY ("alias_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_base_resume" ON "resumes"("user_id") WHERE "base" = true;