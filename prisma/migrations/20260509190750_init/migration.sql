-- CreateEnum
CREATE TYPE "Source" AS ENUM ('HN', 'REDDIT', 'GITHUB');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "author" TEXT,
    "embeddedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTopic" (
    "storyId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "StoryTopic_pkey" PRIMARY KEY ("storyId","topicId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_source_externalId_key" ON "Story"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- AddForeignKey
ALTER TABLE "StoryTopic" ADD CONSTRAINT "StoryTopic_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTopic" ADD CONSTRAINT "StoryTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
