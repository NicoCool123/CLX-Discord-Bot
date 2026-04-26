ALTER TABLE "GuildSettings" ADD COLUMN "ticketCategories" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "GuildSettings" ADD COLUMN "welcomeMessage" TEXT;
