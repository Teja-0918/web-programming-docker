# 📘 MERNexus Project Development Journey & Reference Guide

This document captures the complete step-by-step conversation, decisions, technical architecture, and commands from our pair-programming session.

---

## 📅 Project Overview & Goal
- **Original State:** Generic single-tenant MERN admin CRUD dashboard.
- **Transformed State:** Modern dual-role E-Commerce web application (**Customer Storefront** + **Admin Console**) containerized with **Docker** and pushed to **GitHub**.

---

## 🏗️ 1. Architecture & Features Implemented

### A. Dual-Role Architecture
1. **🛍️ Customer Mode:**
   - **Storefront Catalog:** Displays product cards with high-resolution images, pricing, and dynamic delivery estimates (`Order Date + product.deliveryDays`).
   - **Checkout Flow:** Interactive modal capturing customer name, contact phone, delivery address, city, state, pincode, and quantity.
   - **Registered Customer Autofill:** Dropdown allowing instant autofill from registered customer profiles.
   - **Instant Payment Simulation:** Sample **"💳 Pay Amount"** action updating payment status to `paid`.
   - **Order Tracking:** **"My Orders"** page displaying order ID, expected delivery date, shipping address, and delivery status badges (`In Transit` vs `Delivered`).

2. **⚙️ Admin Mode:**
   - **Product Management:** Add products with **Image URL** (with live preview and sample presets) and custom **Estimated Delivery (Days)**.
   - **Order Fulfillment:** Comprehensive table showing customer details, phone, full shipping address, items, and action buttons (`🚚 Deliver` and `💳 Mark Paid`).
   - **Users & Accounts Management:**
     - User accounts categorized with roles: `🛍️ Customer` vs `🛡️ Administrator`.
     - KPI summary cards (Total Accounts, Customers, Admins, Orders Placed).
     - Role filter tabs (`All`, `Customers`, `Admins`) and multi-field search.
     - Customer details view with complete associated order history and metrics.

---

## 🐳 2. Docker Containerization Setup

The entire application runs through **Docker Compose** across 3 coordinated services:

| Container | Image / Base | Role | Port Mapping |
| :--- | :--- | :--- | :--- |
| **`mernexus-mongo`** | `mongo:7.0` | Database with persistent volume `mongo-data` | `27017:27017` |
| **`mernexus-backend`** | Node.js 20 LTS Alpine | Express REST API with auto-seeding & connection retries | `4000:4000` |
| **`mernexus-frontend`** | Multi-Stage Node ➔ Nginx Alpine | Production React/Vite SPA served by Nginx | `5173:80` |

### Essential Docker Commands
```powershell
# Start all containers in the background
docker compose up -d

# Rebuild containers after code changes
docker compose up -d --build

# View container status
docker compose ps

# View live container logs
docker compose logs -f

# Stop all containers (keeps database data safe)
docker compose down
```

---

## 🐙 3. Git & GitHub Reference

- **GitHub Repository:** [https://github.com/Teja-0918/web-programming-docker.git](https://github.com/Teja-0918/web-programming-docker.git)

### The 3 Golden Git Commands (For Any Future Updates)
```powershell
# 1. Stage your changes
git add .

# 2. Save snapshot with a descriptive message
git commit -m "Your update message here"

# 3. Push to GitHub
git push
```

### How a Friend Runs Your Code
```powershell
# 1. Clone repository
git clone https://github.com/Teja-0918/web-programming-docker.git

# 2. Enter folder
cd web-programming-docker

# 3. Start everything with Docker
docker compose up -d
```
App will immediately be available at: **http://localhost:5173**
