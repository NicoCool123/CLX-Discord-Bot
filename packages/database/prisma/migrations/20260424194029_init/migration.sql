-- CreateEnum
CREATE TYPE "InfractionType" AS ENUM ('WARN', 'MUTE', 'BAN', 'KICK', 'UNBAN', 'AUTOMOD');

-- CreateEnum
CREATE TYPE "AutomodRuleType" AS ENUM ('SPAM', 'WORD_FILTER', 'LINK_DETECTION');

-- CreateEnum
CREATE TYPE "AutomodAction" AS ENUM ('WARN', 'TIMEOUT', 'KICK', 'BAN', 'DELETE');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" "InfractionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Infraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "automodEnabled" BOOLEAN NOT NULL DEFAULT true,
    "blacklistedWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spamThreshold" INTEGER NOT NULL DEFAULT 5,
    "spamInterval" INTEGER NOT NULL DEFAULT 5,
    "logChannelId" TEXT,
    "muteRoleId" TEXT,

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomodRule" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" "AutomodRuleType" NOT NULL,
    "action" "AutomodAction" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "AutomodRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_guildId_key" ON "User"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_guildId_key" ON "GuildSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomodRule_guildId_type_key" ON "AutomodRule"("guildId", "type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User"("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildSettings" ADD CONSTRAINT "GuildSettings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomodRule" ADD CONSTRAINT "AutomodRule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
