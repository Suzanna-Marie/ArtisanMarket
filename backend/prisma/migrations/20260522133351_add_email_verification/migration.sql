-- AlterTable
ALTER TABLE "users" ADD COLUMN     "codeVerif" TEXT,
ADD COLUMN     "codeVerifExpire" TIMESTAMP(3),
ADD COLUMN     "emailVerifie" BOOLEAN NOT NULL DEFAULT false;
