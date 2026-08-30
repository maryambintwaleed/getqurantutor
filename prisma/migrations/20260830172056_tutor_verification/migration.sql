-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "audioUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "idDocData" BYTEA,
ADD COLUMN     "idDocType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reviewNote" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- Teachers who already existed were vetted by hand; do not lock them out.
UPDATE "TutorProfile" SET "status" = 'APPROVED', "reviewedAt" = NOW();
