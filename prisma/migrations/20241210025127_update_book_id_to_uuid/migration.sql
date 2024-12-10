/*
  Warnings:

  - The primary key for the `Book` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,volume]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Book_isbn_key` ON `Book`;

-- AlterTable
ALTER TABLE `Book` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Book_title_volume_key` ON `Book`(`title`, `volume`);
