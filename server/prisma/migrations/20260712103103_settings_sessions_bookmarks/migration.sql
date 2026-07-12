/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user_settings` ADD COLUMN `journalReminders` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `marketingEmails` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `travelReminders` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `theme` VARCHAR(191) NOT NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `profileVisibility` ENUM('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `travelPreferences` TEXT NULL,
    ADD COLUMN `username` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
