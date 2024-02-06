-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "refreshToken" TEXT;
