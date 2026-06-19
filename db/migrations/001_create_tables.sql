-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    city TEXT,
    role TEXT CHECK(role IN ('CUSTOMER', 'FARMER', 'COOPERATIVE', 'COMPANY', 'INDIVIDUAL_PRODUCER', 'RETAILER', 'COMMERCIAL')) DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    farm_location TEXT,
    experience INTEGER,
    certifications TEXT, -- Stored as JSON array
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Cooperatives table
CREATE TABLE IF NOT EXISTS cooperatives (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    members INTEGER,
    location TEXT,
    certifications TEXT, -- Stored as JSON array
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    company_name TEXT,
    industry TEXT,
    size TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Individual Producers table
CREATE TABLE IF NOT EXISTS individual_producers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    brand_name TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Retailers table
CREATE TABLE IF NOT EXISTS retailers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    store_name TEXT,
    location TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Commercial (Employees) table
CREATE TABLE IF NOT EXISTS commercial (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    department TEXT,
    employee_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    unit TEXT,
    origin TEXT,
    packaging TEXT,
    image TEXT,
    farmer_id TEXT,
    producer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(farmer_id) REFERENCES farmers(id),
    FOREIGN KEY(producer_id) REFERENCES individual_producers(id)
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')) DEFAULT 'PENDING',
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Wishlist table (Many-to-Many relationship between customers and products)
CREATE TABLE IF NOT EXISTS wishlist (
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, product_id),
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_producer ON products(producer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
