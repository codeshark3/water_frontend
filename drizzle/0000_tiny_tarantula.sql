CREATE TABLE "water_ml_account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"expiresAt" timestamp,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "water_ml_forecasts" (
	"id" text PRIMARY KEY NOT NULL,
	"diseaseType" text NOT NULL,
	"month" text NOT NULL,
	"isForecast" boolean DEFAULT false NOT NULL,
	"totalTests" integer,
	"positiveCases" integer,
	"infectionRate" integer,
	"forecastedInfectionRate" integer,
	"forecastedPositiveCases" integer,
	"forecastedTotalTests" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "water_ml_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"impersonatedBy" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "water_ml_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"participantId" text,
	"name" text,
	"gender" text,
	"age" integer,
	"location" text,
	"date" timestamp,
	"userId" text NOT NULL,
	"oncho" text,
	"schistosomiasis" text,
	"lf" text,
	"helminths" text,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "water_ml_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" integer,
	CONSTRAINT "water_ml_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "water_ml_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "water_ml_account" ADD CONSTRAINT "water_ml_account_userId_water_ml_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."water_ml_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_ml_session" ADD CONSTRAINT "water_ml_session_userId_water_ml_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."water_ml_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_ml_tests" ADD CONSTRAINT "water_ml_tests_userId_water_ml_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."water_ml_user"("id") ON DELETE no action ON UPDATE no action;