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

## 4. Voucher and Reimbursement Workflow

DRAFT → PENDING_APPROVAL → APPROVED or REJECTED.  
A submitted voucher is represented by PENDING_APPROVAL. Rejected vouchers display the Director's reason. Approved vouchers are read-only as expense claims.  
Additional payment tracking: APPROVED + NOT_PAID → APPROVED + PAID (reimbursement recorded). Payment state is stored separately from approval status; marking Paid does not transfer money.

## 5. Dashboards

Employee: Total vouchers, drafts, pending, approved, rejected, and total amount claimed, limited to the signed-in employee.  
Director: Pending approvals, decisions, pending amount, and recent activity.  
Accounts: Total submitted vouchers, pending approval, approved, rejected, total approved expense amount, and recent approved vouchers. Payment extension adds to-process, reimbursement-done, and reimbursed-amount figures.

## 6. Database Schema Explanation

users — account details, unique email, password hash, role, department, and optional profile signature.  
vouchers — unique generated voucher number, employee foreign key, dates, department, category, title, description, positive amount, employee signature, status, and timestamps.  
voucher_approvals — voucher/director references, approval or rejection decision, Director signature or rejection reason, and decision timestamp.  
voucher_payments (optional extension migration) — one row per voucher, PAID/NOT_PAID status, paid-by user, and payment timestamps.  
Core schema: backend/database/schema.sql. Extension migration: backend/database/accounts_payment_migration.sql (from the separate Accounts Payment Extension patch; confirm it is merged into your final repository).

## 7. Project Setup Instructions

Prerequisites: Node.js 20+, npm, MySQL 8+.  
1. Clone the GitHub repository.  
2. Create the database using backend/database/schema.sql for a fresh installation; do not re-run CREATE DATABASE on an existing database.  
3. Copy backend/.env.example to backend/.env and configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT, and CLIENT_URL.  
4. If using reimbursement tracking, merge the Accounts Payment Extension into the final project, then execute backend/database/accounts_payment_migration.sql once.  
5. In backend/: npm install; optionally run node scripts/seedUsers.js for local demo users; then npm run dev.  
6. In frontend/: npm install; configure the API base URL to match the backend port (see the frontend environment example); then npm run dev.  
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

## 10. Assumptions Made During Development

1. 'Submitted' and 'Pending Approval' are represented by one stored state: PENDING_APPROVAL.  
2. Drafts are private to employees; Director and Accounts organization-wide views focus on submitted vouchers. This is an implementation assumption despite the assignment's broad 'all vouchers' wording.  
3. Voucher numbers are generated automatically and uniquely.  
4. Accounts payment marking is an additional feature beyond the required read-only voucher workflow; it updates reimbursement metadata, not voucher details or Director decisions.  
5. Payment marking records completion of reimbursement outside the application; it does not initiate bank transfers.  
6. The payment extension stores current payment status, not a complete immutable payment history.
7. For demonstration and role-based access testing, three predefined users (Employee, Director, and Accounts) were assumed, each with a **different password**. These are independent login credentials, not a shared password. Passwords are configured through separate seed environment variables and stored as hashes in the database. Real passwords are never included in this README or committed to GitHub.

## 11. Database Schema and Migration Files

- `backend/database/schema.sql` — creates the core relational database tables and constraints for a fresh setup.
- `backend/database/accounts_payment_migration.sql` — optional additional migration for Accounts reimbursement tracking, if included in the final project.
- Run the core schema first, followed by the payment migration where applicable. Avoid rerunning initialization scripts against a populated database without checking their statements.

## 12. Environment Example Files

- `backend/.env.example` — documents backend port, allowed frontend origin, MySQL connection, JWT secret, and three distinct demo-user password variables.
- `frontend/.env.example` — documents the frontend API base URL.
- Copy each example to `.env`, provide local values, and do not commit the resulting `.env` files.

## 13. Screenshots or Demo Video (Optional)

Screenshots or a short demo video can be added to a `screenshots/` folder or linked here to demonstrate Employee voucher submission, Director approval/rejection, and Accounts voucher review/reimbursement tracking. This evidence is optional and should only be linked when actually available.

## 14. Repository Structure

backend/src/controllers — request handlers and business logic.  
backend/src/routes — role-protected REST endpoints.  
backend/src/middleware — authentication, authorization, upload validation.  
backend/src/services — voucher data operations.  
backend/database — schema and migration SQL.  
frontend/src/pages — role-based dashboards, voucher forms, and details.  
frontend/src/api — authenticated Axios services.  
frontend/src/context and components — session state, shared UI, and protected routes.

## 15. Evaluation and Verification Notes

The source archive and later Accounts payment extension were reviewed to prepare this documentation. I have not verified the merged final GitHub repository or completed end-to-end browser/database tests. Before submission, test login for all three roles; voucher creation/submission; approval/rejection with signatures; employee data isolation; Accounts read access; payment marking; and print behavior. Confirm the optional payment migration was applied and no secrets are committed.

## 16. Conclusion

Expensio demonstrates full-stack application development through role-based workflows, secure authentication, relational database design, REST APIs, signature uploads, validation, and dashboard reporting. The Accounts reimbursement extension demonstrates how the system can support operational follow-up after Director approval.

