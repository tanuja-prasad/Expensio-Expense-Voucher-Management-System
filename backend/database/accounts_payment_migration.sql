-- Run ONCE against the existing Expensio database. No existing tables are altered.
USE expensio;
CREATE TABLE IF NOT EXISTS voucher_payments (
  voucher_id INT NOT NULL PRIMARY KEY,
  payment_status ENUM('NOT_PAID','PAID') NOT NULL DEFAULT 'NOT_PAID',
  paid_at DATETIME NULL,
  paid_by INT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_voucher_payments_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  CONSTRAINT fk_voucher_payments_user FOREIGN KEY (paid_by) REFERENCES users(id)
);
