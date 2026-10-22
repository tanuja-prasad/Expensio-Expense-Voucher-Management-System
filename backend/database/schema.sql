CREATE DATABASE expensio;

USE expensio;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    employee_code VARCHAR(30) UNIQUE,
    profile_signature VARCHAR(100) NULL,
    department VARCHAR(100),
    role ENUM('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS')
        NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
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
    ) NOT NULL DEFAULT 'DRAFT',

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
    FOREIGN KEY (director_id) REFERENCES users(id),

    CHECK (
        (decision = 'APPROVED'
            AND director_signature IS NOT NULL)
        OR
        (decision = 'REJECTED'
            AND rejection_reason IS NOT NULL
            AND TRIM(rejection_reason) <> '')
    )
);