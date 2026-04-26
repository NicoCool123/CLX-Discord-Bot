ALTER TABLE "GuildSettings" ADD COLUMN "ticketsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GuildSettings" ADD COLUMN "welcomeEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GuildSettings" ADD COLUMN "loggingEnabled" BOOLEAN NOT NULL DEFAULT true;
