/*
  Warnings:

  - You are about to drop the `Author` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Publisher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_bookTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_publisherId_fkey`;

-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_readStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_seriesId_fkey`;

-- DropTable
DROP TABLE `Author`;

-- DropTable
DROP TABLE `Book`;

-- DropTable
DROP TABLE `BookType`;

-- DropTable
DROP TABLE `Publisher`;

-- DropTable
DROP TABLE `ReadStatus`;

-- DropTable
DROP TABLE `Series`;

-- CreateTable
CREATE TABLE `books` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `releaseDate` DATETIME(3) NULL,
    `coverUrl` VARCHAR(512) NULL,
    `volume` INTEGER NULL,
    `isbn` VARCHAR(13) NULL,
    `bookType` ENUM('General', 'Manga', 'LightNovel', 'Other') NOT NULL DEFAULT 'General',
    `readStatus` ENUM('Unread', 'Completed', 'Reading') NOT NULL DEFAULT 'Unread',
    `authorId` VARCHAR(36) NOT NULL,
    `publisherId` VARCHAR(36) NOT NULL,
    `seriesId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `books_isbn_key`(`isbn`),
    INDEX `idx_bookType_readStatus`(`bookType`, `readStatus`),
    INDEX `idx_releaseDate_id`(`releaseDate`, `id`),
    UNIQUE INDEX `books_title_volume_key`(`title`, `volume`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authors` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `authors_name_key`(`name`),
    INDEX `idx_author_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publishers` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `publishers_name_key`(`name`),
    INDEX `idx_publisher_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `series_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publishers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
