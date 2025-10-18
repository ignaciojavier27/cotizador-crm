-- CreateTable
CREATE TABLE `Companies` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `rut` VARCHAR(50) NOT NULL,
    `logo_url` VARCHAR(500) NULL,
    `address` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `contact_email` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `Companies_rut_key`(`rut`),
    INDEX `Companies_rut_idx`(`rut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` CHAR(36) NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'seller') NOT NULL DEFAULT 'seller',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    INDEX `fk_users_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    INDEX `fk_categories_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` CHAR(36) NOT NULL,
    `category_id` INTEGER NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(100) NULL,
    `brand` VARCHAR(100) NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `tax_percentage` DECIMAL(5, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_products_company`(`company_id`),
    INDEX `fk_products_category`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Clients` (
    `id` CHAR(36) NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `client_company` VARCHAR(255) NULL,
    `reference_contact` VARCHAR(255) NULL,
    `data_consent` BOOLEAN NOT NULL DEFAULT false,
    `consent_date` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_clients_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_number` VARCHAR(50) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `client_id` CHAR(36) NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `total` DECIMAL(12, 2) NULL,
    `total_tax` DECIMAL(12, 2) NULL,
    `status` ENUM('sent', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'sent',
    `sent_at` DATETIME(0) NULL,
    `expires_at` DATETIME(0) NULL,
    `accepted_at` DATETIME(0) NULL,
    `rejection_reason` VARCHAR(500) NULL,
    `internal_notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `Quotations_quotation_number_key`(`quotation_number`),
    INDEX `fk_quotations_user`(`user_id`),
    INDEX `fk_quotations_client`(`client_id`),
    INDEX `fk_quotations_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NULL,
    `line_tax` DECIMAL(12, 2) NULL,

    INDEX `fk_qdetails_quotation`(`quotation_id`),
    INDEX `fk_qdetails_product`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation_History` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` INTEGER NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `previous_status` ENUM('sent', 'accepted', 'rejected', 'expired') NULL,
    `new_status` ENUM('sent', 'accepted', 'rejected', 'expired') NULL,
    `change_reason` VARCHAR(500) NULL,
    `changed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_qhistory_quotation`(`quotation_id`),
    INDEX `fk_qhistory_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Automations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` CHAR(36) NOT NULL,
    `type` ENUM('reminder', 'promotion') NOT NULL,
    `days_wait` INTEGER NULL,
    `email_subject` TEXT NULL,
    `email_content` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `fk_automations_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifications_Sent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` INTEGER NOT NULL,
    `automation_id` INTEGER NULL,
    `recipient_email` VARCHAR(255) NOT NULL,
    `type` ENUM('reminder', 'promotion') NOT NULL,
    `send_status` ENUM('sent', 'failed', 'pending') NOT NULL DEFAULT 'pending',
    `error_reason` VARCHAR(500) NULL,
    `sent_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `fk_notif_quotation`(`quotation_id`),
    INDEX `fk_notif_automation`(`automation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categories` ADD CONSTRAINT `Categories_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Clients` ADD CONSTRAINT `Clients_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotations` ADD CONSTRAINT `Quotations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotations` ADD CONSTRAINT `Quotations_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotations` ADD CONSTRAINT `Quotations_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Details` ADD CONSTRAINT `Quotation_Details_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_Details` ADD CONSTRAINT `Quotation_Details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_History` ADD CONSTRAINT `Quotation_History_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation_History` ADD CONSTRAINT `Quotation_History_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Automations` ADD CONSTRAINT `Automations_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifications_Sent` ADD CONSTRAINT `Notifications_Sent_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `Quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifications_Sent` ADD CONSTRAINT `Notifications_Sent_automation_id_fkey` FOREIGN KEY (`automation_id`) REFERENCES `Automations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
