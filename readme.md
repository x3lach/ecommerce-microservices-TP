# E-Commerce Microservices Project

This is a summary of all the API endpoints currently available in the application. All requests should be made to the **API Gateway** (running on `http://localhost:8081`).

---

## 📅 Updates - Tuesday, December 16, 2025

### **Frontend Changes (`MyItemsPage.jsx`)**
- **Tabs Added**: Implemented "Add Item" and "Modifier my Item" tabs for better user navigation.
- **Product Management**:
  - **Listing**: Users can now view their own listed products under the "Modifier my Item" tab.
  - **Editing**: Added functionality to edit existing products. The form is pre-filled with product data, including existing images.
  - **Deleting**: Added a "Delete" button to remove products directly from the list.
- **Image Handling**:
  - Fixed image display issues by prepending the API Gateway URL.
  - Improved the image upload section to display existing server images alongside new uploads during editing.
- **UI/UX Improvements**:
  - Added a "Cancel" button in edit mode.
  - Improved validation to respect existing images during updates.
  - Ensured the user stays on the "Modifier my Item" tab when clicking "Modifier".

### **Backend Changes (`catalogue-service`)**
- **Database**: Added a new column `condition_state` to the `products` table.
- **Entity & DTOs**:
  - Updated `Product` entity, `ProductRequest`, and `ProductResponse` to include the `condition` field.
- **Service Logic**:
  - Refactored `ProductService.updateProduct` to accept `ProductRequest` DTO for consistency.
  - Updated logic to handle mapping of the new `condition` field.

---

## 📦 Catalogue-Service (Product Management)

This service handles the complete management of products.

### 1. Create a New Product

* **Endpoint:** `POST /api/v1/products`
* **Description:** Creates a new product in the database. This also triggers an event to update the `search-service`.
* **Example (Body - JSON):**
    ```json
    {
      "sku": "SKU-005",
      "name": "My New Product",
      "description": "This is a great new product.",
      "price": 19.99,
      "stockQuantity": 150,
      "condition": "New"
    }
    ```

### 2. Get All Products

* **Endpoint:** `GET /api/v1/products`
* **Description:** Retrieves a list of all products in the catalogue.
* **Example:**
    * No body needed. Just send a `GET` request.

### 3. Get a Single Product by ID

* **Endpoint:** `GET /api/v1/products/{id}`
* **Description:** Retrieves a single product by its unique ID. This is used internally by the `commande-service`.
* **Example:**
    * `GET http://localhost:8081/api/v1/products/b7d5f22a-a8e7-4892-97a9-603a8ac8f87d`

### 4. Update an Existing Product

* **Endpoint:** `PUT /api/v1/products/{id}`
* **Description:** Updates the details of an existing product. You only need to send the fields you want to change.
* **Example:**
    * **URL:** `http://localhost:8081/api/v1/products/b7d5f22a-a8e7-4892-97a9-603a8ac8f87d`
    * **Body (JSON):**
        ```json
        {
          "name": "The NEW 4th Product Name",
          "price": 55.99,
          "condition": "Like New"
        }
        ```

### 5. Delete a Product

* **Endpoint:** `DELETE /api/v1/products/{id}`
* **Description:** Deletes a product from the database. (Note: This will also trigger an event to remove it from the search index).
* **Example:**
    * `DELETE http://localhost:8081/api/v1/products/b7d5f22a-a8e7-4892-97a9-603a8ac8f87d`

### 6. Get Products by Seller

* **Endpoint:** `GET /api/v1/products/seller/{sellerId}`
* **Description:** Retrieves all products listed by a specific seller.
* **Example:**
    * `GET http://localhost:8081/api/v1/products/seller/123e4567-e89b-12d3-a456-426614174000`

---

## 🔎 Search-Service (Product Search)

This service provides advanced search capabilities using Elasticsearch.

### 1. Search for Products

* **Endpoint:** `GET /api/v1/search`
* **Description:** Searches for products across multiple fields (Name, SKU, and Description).
* **Example (using query parameters):**
    * **By Name:** `.../api/v1/search?q=The 4 Product`
    * **By SKU:** `.../api/v1/search?q=SKU-004`
    * **By Description:** `.../api/v1/search?q=test product 4`

---

## 🛒 Commande-Service (Cart & Orders)

This service handles the shopping cart and the checkout process.

### 1. Add an Item to the Cart

* **Endpoint:** `POST /api/v1/cart/items`
* **Description:** Adds a specific quantity of a product to the test user's cart. It calls the `catalogue-service` to verify price and stock.
* **Example (Body - JSON):**
    ```json
    {
      "productId": "b7d5f22a-a8e7-4892-97a9-603a8ac8f87d",
      "quantity": 2
    }
    ```

### 2. Get the Current Cart

* **Endpoint:** `GET /api/v1/cart`
* **Description:** Shows all items currently in the test user's cart.
* **Example:**
    * No body needed. Just send a `GET` request.

### 3. Create an Order (Checkout)

* **Endpoint:** `POST /api/v1/orders`
* **Description:** Converts the user's current cart into a confirmed order. This clears the cart and sends an `OrderCreatedEvent` to RabbitMQ, which triggers the `catalogue-service` to update its stock.
* **Example:**
    * No body needed. Just send a `POST` request.
