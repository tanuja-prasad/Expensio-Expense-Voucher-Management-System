# Expensio — Expense Voucher Management System


**Submitted by:** Tanuja Prasad | MCA, MIT World Peace University

## 1. Project Overview

I developed Expensio, a web-based Expense Voucher Management System, to digitize employee expense claims from draft creation through Director approval and Accounts reimbursement tracking. The application centralizes voucher records, reduces manual follow-up, and provides role-specific access.

## 2. Technology Stack

Frontend: React, Vite, Tailwind CSS, React Router, Axios.  
Backend: Node.js, Express.js, REST APIs.  
Database: MySQL using mysql2 and parameterized SQL queries.  
Authentication and security: JWT, bcryptjs, protected routes, backend role authorization.  
Signature uploads: Multer and Sharp; images are delivered through authenticated endpoints.

## 3. User Roles and Functionalities

Employee: Logs in; creates, edits, or deletes personal draft vouchers; uploads or reuses a signature; submits signed vouchers; views only personal claims and rejection reasons.  
Director: Reviews submitted vouchers, searches and filters records, approves with a signature or rejects with a reason, and views approval dashboard statistics.  
Accounts: Views organization-wide submitted vouchers, approval decisions, signatures, and dashboard statistics; filters records and tracks reimbursements. An additional Accounts-only extension records Approved vouchers as Not Paid or Paid.

### demo login

employee : employee@gmail.com 
password : emp@123

director : director@gmail.com
password : dir@123

accounts : accounts@gmail.com
password : acc@123

## 4. Voucher and Reimbursement Workflow

DRAFT → PENDING_APPROVAL → APPROVED or REJECTED.  
A submitted voucher is represented by PENDING_APPROVAL. Rejected vouchers display the Director's reason. Approved vouchers are read-only as expense claims.  
Additional payment tracking: APPROVED + NOT_PAID → APPROVED + PAID (reimbursement recorded). Payment state is stored separately from approval status; marking Paid does not transfer money.

## 5. Dashboards

Employee: Total vouchers, drafts, pending, approved, rejected, and total amount claimed, limited to the signed-in employee.  
Director: Pending approvals, decisions, pending amount, and recent activity.  
Accounts: Total submitted vouchers, pending approval, approved, rejected, total approved expense amount, and recent approved vouchers. Payment extension adds to-process, reimbursement-done, and reimbursed-amount figures.

## 6. Database Design

users — account details, unique email, password hash, role, department, and optional profile signature.  
vouchers — unique generated voucher number, employee foreign key, dates, department, category, title, description, positive amount, employee signature, status, and timestamps.  
voucher_approvals — voucher/director references, approval or rejection decision, Director signature or rejection reason, and decision timestamp.  
voucher_payments (optional extension migration) — one row per voucher, PAID/NOT_PAID status, paid-by user, and payment timestamps.  
Core schema: backend/database/schema.sql. Extension migration: backend/database/accounts_payment_migration.sql (from the separate Accounts Payment Extension patch; confirm it is merged into your final repository).

## 7. Project Setup

Prerequisites: Node.js 20+, npm, MySQL 8+.  
1. Clone the GitHub repository.  
2. Create the database using backend/database/schema.sql for a fresh installation; do not re-run CREATE DATABASE on an existing database.  
3. Copy backend/.env.example to backend/.env and configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT, and CLIENT_URL.  
4. If using reimbursement tracking, merge the Accounts Payment Extension into the final project, then execute backend/database/accounts_payment_migration.sql once.  
5. In backend/: npm install; optionally run node scripts/seedUsers.js for local demo users; then npm run dev.  
6. In frontend/: npm install; set VITE_API_BASE_URL to http://localhost:5000/api (or the configured backend port); then npm run dev.  
7. Visit http://localhost:5173 and sign in with a locally configured account for each role.  
Never commit .env, database passwords, real JWT secrets, or production credentials.

## 8. API Documentation

POST /api/auth/login — public authentication.  
GET /api/auth/me — authenticated user.  
GET /api/vouchers/my and /api/vouchers/my/stats — Employee-only vouchers and metrics.  
POST /api/vouchers — create draft; PUT/DELETE /api/vouchers/:id — edit/delete own draft.  
POST /api/vouchers/:id/signature — upload employee signature; POST /api/vouchers/:id/submit — submit signed draft.  
GET /api/review, /api/review/stats, /api/review/:id — Director/Accounts read access.  
GET /api/review/:id/signature/:kind — authenticated signature view.  
POST /api/review/:id/approve and /api/review/:id/reject — Director only.  
GET /api/accounts/dashboard — Accounts dashboard.  
GET /api/accounts/payments — Accounts payment queue.  
PATCH /api/accounts/payments/:id — Accounts-only payment status update (PAID or NOT_PAID).  
Authenticated routes require Authorization: Bearer <JWT>. Signature upload uses multipart/form-data.

## 9. Validation and Authorization

Required: department, title, expense date, amount greater than zero, employee signature before submission, Director signature for approval, and a rejection reason for rejection.  
Only employees may change their own DRAFT vouchers. Submitted claims are read-only for employees. Only Directors approve/reject. Only Accounts can update reimbursement status, and only on approved vouchers. Backend role and ownership checks are essential; hiding frontend buttons is not sufficient.

## 10. Assumptions and Design Decisions

1. 'Submitted' and 'Pending Approval' are represented by one stored state: PENDING_APPROVAL.  
2. Drafts are private to employees; Director and Accounts organization-wide views focus on submitted vouchers. This is an implementation assumption despite the assignment's broad 'all vouchers' wording.  
3. Voucher numbers are generated automatically and uniquely.  
4. Accounts payment marking is an additional feature beyond the required read-only voucher workflow; it updates reimbursement metadata, not voucher details or Director decisions.  
5. Payment marking records completion of reimbursement outside the application; it does not initiate bank transfers.  
6. The payment extension stores current payment status, not a complete immutable payment history.
7.Assumed 3 users with different passwords.

## 11. Repository Structure

backend/src/controllers — request handlers and business logic.  
backend/src/routes — role-protected REST endpoints.  
backend/src/middleware — authentication, authorization, upload validation.  
backend/src/services — voucher data operations.  
backend/database — schema and migration SQL.  
frontend/src/pages — role-based dashboards, voucher forms, and details.  
frontend/src/api — authenticated Axios services.  
frontend/src/context and components — session state, shared UI, and protected routes.



## 12. Conclusion

Expensio demonstrates full-stack application development through role-based workflows, secure authentication, relational database design, REST APIs, signature uploads, validation, and dashboard reporting. The Accounts reimbursement extension demonstrates how the system can support operational follow-up after Director approval.

