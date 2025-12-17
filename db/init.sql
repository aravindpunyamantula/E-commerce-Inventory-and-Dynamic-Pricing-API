USE ecommerce;

CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  status ENUM('ACTIVE','ARCHIVED') DEFAULT 'ACTIVE',
  category_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE variants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  attributes JSON NOT NULL,
  price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE inventory (
  variant_id BIGINT PRIMARY KEY,
  stock_quantity INT NOT NULL,
  reserved_quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (variant_id) REFERENCES variants(id)
);

CREATE TABLE pricing_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('SEASONAL','BULK','USER_TIER') NOT NULL,
  condition_data JSON NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  priority INT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  start_time DATETIME NULL,
  end_time DATETIME NULL
);

CREATE TABLE carts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cart_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL,
  reservation_expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (variant_id) REFERENCES variants(id)
);
