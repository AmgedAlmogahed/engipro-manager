CREATE SCHEMA "livefire_demo";
--> statement-breakpoint
CREATE TABLE "livefire_demo"."bad_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"total_amount" numeric(8, 2),
	"weight" double precision,
	"label" text
);
