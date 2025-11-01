CREATE TABLE customer (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(100),
    billing_address TEXT,
    shipping_address TEXT,
    tax_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customer(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    notes TEXT,
    sub_total NUMERIC(12,2) NOT NULL,
    tax_total NUMERIC(12,2) NOT NULL,
    discount_total NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    balance_due NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_invoice_customer_status_date ON invoice(customer_id, status, issue_date);

CREATE TABLE invoice_item (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL
);

CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    paid_at TIMESTAMP NOT NULL
);
