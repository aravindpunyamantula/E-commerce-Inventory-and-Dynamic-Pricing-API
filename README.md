# E-commerce Inventory & Dynamic Pricing API

## Project Overview

This project is a backend service for an e-commerce platform that manages **real-time inventory**, **product variants**, and a **dynamic pricing engine**.
The system goes beyond basic CRUD operations and focuses on **transaction safety**, **concurrency control**, and **business-critical logic** such as inventory reservation, price snapshots, and checkout consistency.

The backend is fully **Dockerized**, uses **MySQL with transactional guarantees**, and prevents **overselling even under concurrent requests**.

---

## Architecture & Design Decisions

The application follows a **layered architecture**:

```
Routes → Controllers → Services → Repositories → Database
```

### Key Design Decisions

* **Controllers** handle HTTP request/response orchestration
* **Services** contain core business logic (pricing engine, cart operations)
* **Repositories** isolate raw database access
* **Database-level locking** enforces inventory consistency
* **Pricing engine** is isolated for extensibility and rule composability
* **Background worker** manages inventory reservation expiration

This separation of concerns improves **maintainability**, **testability**, and **scalability**.

---

## Architecture Diagram

A high-level architecture diagram illustrating the interaction between the API, database, pricing engine, and background worker is provided here:


architecture.png [https://github.com/aravindpunyamantula/E-commerce-Inventory-and-Dynamic-Pricing-API/blob/main/architecture.png]


---

## Docker Setup

The project is fully containerized using **Docker** and **Docker Compose**.

### Services

* **Backend**: Node.js + Express
* **Database**: MySQL 8.0

### Docker Features

* Automatic database creation
* Automatic schema initialization via SQL script
* MySQL healthcheck to avoid startup race conditions
* Backend startup waits until the database is healthy

### Running the Application

```bash
docker-compose down -v
docker-compose up --build
```

The API will be available at:

```
http://localhost:3000
```

Health check endpoint:

```
GET /health
```

---

## Database Initialization & Migrations

The database schema is automatically created on container startup using:

```
db/init.sql
```

This ensures:

* Consistent environment setup
* Reproducible deployments
* No manual database migration steps

---

## Database Schema Overview

The database is designed to model real-world e-commerce requirements.

### Core Entities

* **Categories**

  * Hierarchical (parent–child relationship)
* **Products**

  * Belong to categories
* **Variants**

  * SKU-based
  * Attribute-driven (size, color)
  * Optional price adjustment
* **Inventory**

  * `stock_quantity`
  * `reserved_quantity`
* **Pricing Rules**

  * Seasonal discounts
  * Bulk discounts
  * User-tier discounts
* **Carts & Cart Items**

  * Price snapshot stored at add-to-cart time

A detailed ERD is provided here:

```
schema.png
```

---

## Inventory Reservation & Expiration Flow

1. User adds a variant to the cart
2. Inventory row is locked using `SELECT ... FOR UPDATE`
3. Available stock is validated
4. Reserved quantity is incremented
5. Reservation expiry is set (15 minutes)
6. A background job releases expired reservations
7. On checkout:

   * Reserved stock is converted to permanent stock deduction
   * The transaction commits atomically

This flow guarantees **zero overselling**, even under high concurrency.

---

## Background Worker (Reservation Expiry)

A background worker periodically:

* Identifies expired cart reservations
* Decrements `reserved_quantity`
* Makes inventory available again
* Removes expired cart items

The worker runs on a fixed interval and is **idempotent**, ensuring safe repeated execution.

The worker starts automatically when the application runs.

---

## Dynamic Pricing Logic

The pricing engine applies rules in a **deterministic priority order**:

1. Seasonal discounts
2. Bulk quantity discounts
3. User-tier discounts

### Example

* Base price: ₹500
* Quantity: 2
* User tier: Gold (15%)

```
Base total: 1000
Seasonal discount: -10%
Bulk discount: -5%
User-tier discount: -15%
Final price: calculated dynamically
```

### Price Snapshot Guarantee

* Price is calculated when the item is added to the cart
* The calculated price is stored as a snapshot
* Future pricing rule changes do **not** affect existing cart items

---

## Concurrency Control

To ensure data integrity:

* Inventory updates are executed inside **database transactions**
* Row-level locking is enforced using:

  ```sql
  SELECT ... FOR UPDATE
  ```
* Checkout is performed atomically
* All validation failures trigger transaction rollback

This design ensures correctness under concurrent access.

---

## API Documentation

All REST API endpoints are documented separately:

```
API.md
```

---

## Environment Variables

Create a `.env` file using the following template:

```env
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecommerce
DB_PORT=3306
PORT=3000
```

---

## Testing

All APIs were tested using:

* Postman
* Concurrent request simulations
* Dockerized environment

### Edge Cases Covered

* Overselling attempts
* Expired inventory reservations
* Concurrent add-to-cart operations
* Conflicting pricing rules

---

## Summary

This project demonstrates:

* Real-world backend system design
* Transaction-safe inventory management
* Dynamic pricing with rule prioritization
* Dockerized deployment
* Production-grade concurrency handling

---

