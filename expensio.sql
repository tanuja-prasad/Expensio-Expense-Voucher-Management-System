create database expensio;

use expensio;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    employee_code VARCHAR(30) UNIQUE,
    department VARCHAR(100),
    role ENUM('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_number VARCHAR(30) UNIQUE NOT NULL,
    employee_id INT NOT NULL,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    employee_signature VARCHAR(255),

    status ENUM(
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED'
    ) DEFAULT 'DRAFT',

    submitted_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES users(id),
    CHECK (amount > 0)
);



CREATE TABLE voucher_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_id INT NOT NULL UNIQUE,
    director_id INT NOT NULL,
    decision ENUM('APPROVED', 'REJECTED') NOT NULL,
    director_signature VARCHAR(255),
    rejection_reason TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    FOREIGN KEY (director_id) REFERENCES users(id)
);

INSERT INTO users
(name, email, password, employee_code, department, role)
VALUES
('Demo Employee', 'employee@gmail.com', 'NOT_A_VALID_HASH',
 'EMP001', 'IT', 'EMPLOYEE'),

('Demo Director', 'director@gmail.com', 'NOT_A_VALID_HASH',
 NULL, 'Management', 'DIRECTOR'),

('Demo Accounts', 'accounts@gmail.com', 'NOT_A_VALID_HASH',
 NULL, 'Finance', 'ACCOUNTS');

INSERT INTO vouchers (
    voucher_number,
    employee_id,
    voucher_date,
    expense_date,
    department,
    title,
    category,
    description,
    amount
)
VALUES (
    'EV-000001',
    (SELECT id FROM users WHERE email = 'employee@gmail.com'),
    CURDATE(),
    '2026-10-10',
    'IT',
    'Office Travel',
    'TRAVEL',
    'Travel expenses for client meeting',
    1500.00
);

show tables;
select * from users;
select * from vouchers;

SELECT
    v.voucher_number,
    u.name AS employee_name,
    v.title,
    v.amount,
    v.status
FROM vouchers v
INNER JOIN users u
    ON v.employee_id = u.id;

