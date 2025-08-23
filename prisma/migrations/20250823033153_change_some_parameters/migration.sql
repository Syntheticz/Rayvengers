/*
  Warnings:

  - You are about to drop the column `Section` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_username_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `Section`,
    DROP COLUMN `username`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `section` VARCHAR(191) NOT NULL,
    MODIFY `firstname` VARCHAR(191) NULL,
    MODIFY `lastname` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `User_name_idx` ON `User`(`name`);
