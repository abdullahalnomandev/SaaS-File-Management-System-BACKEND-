-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('super_admin', 'admin', 'user');

-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('active', 'block');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "USER_ROLE" NOT NULL DEFAULT 'user',
    "profile_image" TEXT DEFAULT 'https://i.ibb.co/z5YHLV9/profile.png',
    "status" "USER_STATUS" NOT NULL DEFAULT 'active',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "package_id" INTEGER,
    "onetime_code" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_max_folder" INTEGER NOT NULL,
    "max_nesting_folder" INTEGER NOT NULL,
    "allowed_file_type" TEXT[],
    "max_file_size" INTEGER NOT NULL,
    "total_file_limit" INTEGER NOT NULL,
    "file_per_folder_limit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
