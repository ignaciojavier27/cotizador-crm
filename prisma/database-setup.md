# Configuración de Base de Datos - Cotizador CRM

## 1. Configuración requerida

### 1.1 Versión MySQL
- **Mínimo:** MySQL 5.7
- **Recomendado:** MySQL 8.0+

### 1.2 Character Set y Collation
```sql
CHARACTER SET: utf8mb4
COLLATE: utf8mb4_unicode_ci
```

---
## 2. Creación base de datos en local

### 2.1 Creación de la base de datos
```sql
CREATE DATABASE cotizador_crm 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```
