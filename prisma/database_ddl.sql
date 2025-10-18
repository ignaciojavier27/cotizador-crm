-- ===========================================================
-- SISTEMA COTIZADOR CRM
-- Estructura de Base de Datos
-- Compatible con MySQL 5.7+
-- ===========================================================

-- ===========================================================
-- 1️⃣ CREACIÓN DE BASE DE DATOS
-- ===========================================================
CREATE DATABASE IF NOT EXISTS cotizador_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cotizador_crm;

-- ===========================================================
-- 2️⃣ CONFIGURACIÓN GLOBAL OPCIONAL
-- ===========================================================
-- Recomendado para desarrollo y entornos con UTF8 completo:
-- SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===========================================================
-- 3️⃣ TABLAS PRINCIPALES
-- ===========================================================

-- ======================
-- TABLE: Companies
-- ======================
CREATE TABLE Companies (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rut VARCHAR(50) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  address VARCHAR(255),
  phone VARCHAR(50),
  contact_email VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Users
-- ======================
CREATE TABLE Users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role ENUM('admin', 'seller') DEFAULT 'seller',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_users_company FOREIGN KEY (company_id)
    REFERENCES Companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Categories
-- ======================
CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_company FOREIGN KEY (company_id)
    REFERENCES Companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Products
-- ======================
CREATE TABLE Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  category_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  brand VARCHAR(100),
  base_price DECIMAL(10,2) NOT NULL,
  tax_percentage DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_products_company FOREIGN KEY (company_id)
    REFERENCES Companies(id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES Categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Clients
-- ======================
CREATE TABLE Clients (
  id CHAR(36) NOT NULL PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  client_company VARCHAR(255),
  reference_contact VARCHAR(255),
  data_consent BOOLEAN DEFAULT FALSE,
  consent_date DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_clients_company FOREIGN KEY (company_id)
    REFERENCES Companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Quotations
-- ======================
CREATE TABLE Quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_number VARCHAR(50) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  client_id CHAR(36) NOT NULL,
  company_id CHAR(36) NOT NULL,
  total DECIMAL(12,2),
  total_tax DECIMAL(12,2),
  status ENUM('sent', 'accepted', 'rejected', 'expired') DEFAULT 'sent',
  sent_at DATETIME DEFAULT NULL,
  expires_at DATETIME DEFAULT NULL,
  accepted_at DATETIME DEFAULT NULL,
  rejection_reason VARCHAR(500),
  internal_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_quotations_user FOREIGN KEY (user_id)
    REFERENCES Users(id),
  CONSTRAINT fk_quotations_client FOREIGN KEY (client_id)
    REFERENCES Clients(id),
  CONSTRAINT fk_quotations_company FOREIGN KEY (company_id)
    REFERENCES Companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Quotation_Details
-- ======================
CREATE TABLE Quotation_Details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2),
  line_tax DECIMAL(12,2),
  CONSTRAINT fk_qdetails_quotation FOREIGN KEY (quotation_id)
    REFERENCES Quotations(id),
  CONSTRAINT fk_qdetails_product FOREIGN KEY (product_id)
    REFERENCES Products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Quotation_History
-- ======================
CREATE TABLE Quotation_History (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  user_id CHAR(36) NOT NULL,
  previous_status ENUM('sent', 'accepted', 'rejected', 'expired'),
  new_status ENUM('sent', 'accepted', 'rejected', 'expired'),
  change_reason VARCHAR(500),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qhistory_quotation FOREIGN KEY (quotation_id)
    REFERENCES Quotations(id),
  CONSTRAINT fk_qhistory_user FOREIGN KEY (user_id)
    REFERENCES Users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Automations
-- ======================
CREATE TABLE Automations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  type ENUM('reminder', 'promotion') NOT NULL,
  days_wait INT,
  email_subject TEXT,
  email_content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_automations_company FOREIGN KEY (company_id)
    REFERENCES Companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TABLE: Notifications_Sent
-- ======================
CREATE TABLE Notifications_Sent (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  automation_id INT DEFAULT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  type ENUM('reminder', 'promotion') NOT NULL,
  send_status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_reason VARCHAR(500),
  sent_at DATETIME DEFAULT NULL,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_quotation FOREIGN KEY (quotation_id)
    REFERENCES Quotations(id),
  CONSTRAINT fk_notif_automation FOREIGN KEY (automation_id)
    REFERENCES Automations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- ✅ FIN DE SCRIPT
-- ===========================================================
