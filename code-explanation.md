# E-Commerce Microservices: Project Explanation

This document provides a high-level and technical overview of the microservices architecture, explaining how each component works and how they interact to provide a complete e-commerce experience.

---

## 🏗️ 1. Infrastructure (The Foundation)
Managed via **Docker Compose**, these services provide the "plumbing" for the application.

*   **RabbitMQ:** The "Digital Post Office." It allows services to talk to each other asynchronously. For example, when an order is placed, a message is sent here so the Catalogue service can update stock without slowing down the user.
*   **Elasticsearch:** The "Super-Fast Search Engine." It stores a copy of all products in a format optimized for text searching, allowing for instant results across names and descriptions.
*   **Redis:** The "Speedy Cache." Used to store frequently accessed data in memory to reduce database load and improve response times.

---

## 🚦 2. API Gateway & Discovery
*   **Service Discovery (Eureka):** The "Phonebook." Every microservice registers itself here so they can find each other's IP addresses and ports dynamically.
*   **API Gateway (Port 8081):** The "Single Entry Point."
    *   **Routing:** Directs `/api/v1/products` to the Catalogue service and `/api/v1/orders` to the Commande service.
    *   **Security:** Uses an `AuthenticationFilter` to check JWT tokens. It extracts the `userId` from the token and passes it to the microservices via the `X-User-Id` header.
    *   **CORS:** Configured to allow your React frontend (port 5173) to communicate safely with the backend.

---

## 📦 3. Core Microservices

### **A. User-Service**
*   **Role:** Identity & Profile Management.
*   **Key Logic:** Handles registration, login, and generates JWT "VIP Passes."
*   **Data:** Stores user credentials (hashed passwords), roles (Customer/Seller), and shipping addresses.

### **B. Catalogue-Service**
*   **Role:** Product & Inventory Authority.
*   **Key Logic:**
    *   Manages Product CRUD (Create, Read, Update, Delete).
    *   Handles image uploads (max 8) and shipping options.
    *   **Automation:** When a user creates their first product, it automatically calls the `user-service` to upgrade them to a "Seller" role.
    *   **Event Listener:** Listens for "Order Created" messages to decrease stock automatically.

### **C. Search-Service**
*   **Role:** Advanced Discovery.
*   **Key Logic:**
    *   Uses **Elasticsearch** to provide "Google-like" search functionality.
    *   **Weighting:** Matches in the "Name" are more important than matches in the "Description."
    *   **Synchronization:** Listens to RabbitMQ for new products added to the Catalogue and indexes them immediately.

### **D. Commande-Service**
*   **Role:** Shopping Cart & Order Processing.
*   **Key Logic:**
    *   **Cart:** Manages temporary items. It calls the `catalogue-service` to verify price and stock *before* allowing an item into the cart.
    *   **Checkout:** Converts the cart into a permanent `Order` record, clears the cart, and broadcasts an "Order Created" event to update the rest of the system.

---

## 🔄 4. Main Workflows (How it all connects)

### **1. The "Add to Cart" Flow**
1.  **Frontend** sends a request to `Gateway`.
2.  **Gateway** verifies the user is logged in and forwards to `Commande-Service`.
3.  **Commande-Service** asks `Catalogue-Service`: "Is this product real and in stock?"
4.  If yes, the item is saved to the **Cart Database**.

### **2. The "Place Order" Flow**
1.  **User** clicks Checkout.
2.  **Commande-Service** creates an `Order` record (snapshotting the current price).
3.  **Commande-Service** sends a message to **RabbitMQ**.
4.  **Catalogue-Service** hears the message and subtracts the items from the main **Inventory**.
5.  **Cart** is wiped clean.

### **3. The "Product Search" Flow**
1.  **User** types "Running Shoes".
2.  **Gateway** routes the request to **Search-Service**.
3.  **Search-Service** queries **Elasticsearch** (not the SQL DB) for instant results.
4.  Results are returned with relevant details (Price, Name, ID).

---

## 🛠️ Tech Stack Summary
*   **Backend:** Java 21, Spring Boot 3.x, Spring Cloud Gateway.
*   **Communication:** REST (Synchronous) & RabbitMQ (Asynchronous).
*   **Databases:** PostgreSQL (Relational), Elasticsearch (Search), Redis (Cache).
*   **Security:** JWT (JSON Web Tokens).
*   **Frontend:** React (Vite).
