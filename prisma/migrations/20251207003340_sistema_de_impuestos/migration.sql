/*
  Warnings:

  - You are about to drop the column `tax_percentage` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `line_tax` on the `quotation_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `tax_percentage`;

-- AlterTable
ALTER TABLE `quotation_details` DROP COLUMN `line_tax`;

-- CreateTable
CREATE TABLE `Taxes` (
    `id` CHAR(36) NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `percentage` DECIMAL(5, 2) NOT NULL,
    `description` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_taxes_company`(`company_id`),
    UNIQUE INDEX `unique_tax_name_per_company`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Taxes` (
    `product_id` CHAR(36) NOT NULL,
    `tax_id` CHAR(36) NOT NULL,

    INDEX `fk_product_tax_tax`(`tax_id`),
    PRIMARY KEY (`product_id`, `tax_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation_Detail_Taxes` (
    `id` CHAR(36) NOT NULL,
    `quotation_detail_id` CHAR(36) NOT NULL,
    `tax_id` CHAR(36) NOT NULL,
    `tax_name` VARCHAR(100) NOT NULL,
    `tax_percentage` DECIMAL(5, 2) NOT NULL,
    `tax_amount` DECIMAL(12, 2) NOT NULL,

    INDEX `fk_qdt_qdetail`(`quotation_detail_id`),
    INDEX `fk_qdt_tax`(`tax_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Taxes` ADD CONSTRAINT `Taxes_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Taxes` ADD CONSTRAINT `Product_Taxes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Taxes` ADD CONSTRAINT `Product_Taxes_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `Taxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Detail_Taxes` ADD CONSTRAINT `Quotation_Detail_Taxes_quotation_detail_id_fkey` FOREIGN KEY (`quotation_detail_id`) REFERENCES `Quotation_Details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Detail_Taxes` ADD CONSTRAINT `Quotation_Detail_Taxes_tax_id_fkey` FOREIGN KEY (`tax_id`) REFERENCES `Taxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
