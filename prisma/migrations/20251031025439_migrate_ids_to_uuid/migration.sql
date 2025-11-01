/*
  Warnings:

  - The primary key for the `automations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications_sent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `quotation_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `quotation_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `quotations` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `notifications_sent` DROP FOREIGN KEY `Notifications_Sent_automation_id_fkey`;

-- DropForeignKey
ALTER TABLE `notifications_sent` DROP FOREIGN KEY `Notifications_Sent_quotation_id_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `Quotation_Details_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `Quotation_Details_quotation_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_history` DROP FOREIGN KEY `Quotation_History_quotation_id_fkey`;

-- AlterTable
ALTER TABLE `automations` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `categories` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notifications_sent` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `quotation_id` CHAR(36) NOT NULL,
    MODIFY `automation_id` CHAR(36) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `category_id` CHAR(36) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `quotation_details` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `quotation_id` CHAR(36) NOT NULL,
    MODIFY `product_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `quotation_history` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `quotation_id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `quotations` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Details` ADD CONSTRAINT `Quotation_Details_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Details` ADD CONSTRAINT `Quotation_Details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_History` ADD CONSTRAINT `Quotation_History_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifications_Sent` ADD CONSTRAINT `Notifications_Sent_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifications_Sent` ADD CONSTRAINT `Notifications_Sent_automation_id_fkey` FOREIGN KEY (`automation_id`) REFERENCES `Automations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
