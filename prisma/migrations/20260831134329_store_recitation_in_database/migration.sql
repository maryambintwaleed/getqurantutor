-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "audioType" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Recitation" (
    "tutorId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recitation_pkey" PRIMARY KEY ("tutorId")
);

-- AddForeignKey
ALTER TABLE "Recitation" ADD CONSTRAINT "Recitation_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
