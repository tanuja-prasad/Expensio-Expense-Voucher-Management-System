# Expensio — Expense Voucher Management System

A full-stack web application for managing employee expense claims, Director approvals, and Accounts reimbursement tracking through a centralized, role-based workflow.

**Developed by:** Tanuja Prasad  
**Program:** Master of Computer Applications (MCA)  
**Institution:** MIT World Peace University, Pune

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)](https://jwt.io/)

**Repository:** [Expensio — Expense Voucher Management System](https://github.com/tanuja-prasad/Expensio-Expense-Voucher-Management-System)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Voucher Lifecycle](#voucher-lifecycle)
- [Dashboard and Analytics](#dashboard-and-analytics)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Security and Validation](#security-and-validation)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Future Enhancements](#future-enhancements)
- [Learning Outcomes](#learning-outcomes)
- [Project Status](#project-status)
- [Author](#author)

## 1. Overview

Expensio is a web-based Expense Voucher Management System designed to digitize and streamline the employee expense reimbursement workflow.

The application manages the expense claim lifecycle, starting with voucher creation by an employee and continuing through Director approval or rejection and Accounts reimbursement tracking.

It provides dedicated interfaces for employees, Directors, and Accounts personnel, ensuring that each role can access the functionality and information relevant to its responsibilities.

The system replaces fragmented, manual follow-ups with a centralized platform for voucher management, approval decisions, signature handling, and expense reporting.

### Project Objectives

- Digitize employee expense voucher creation and submission.
- Establish a structured approval process with clear status tracking.
- Implement role-based access control and employee-specific data access.
- Maintain approval records, signatures, and rejection reasons.
- Provide dashboards for monitoring expenses and workflow progress.
- Support Accounts personnel in tracking reimbursement completion.

## 2. Problem Statement

Traditional expense claim processes can involve paper forms, manual record maintenance, repeated follow-ups, and limited visibility into approval progress.

These processes make it difficult to track pending claims, maintain consistent records, and distinguish between approved expenses and completed reimbursements.

Expensio addresses these challenges by providing a centralized system where employees submit claims, Directors make approval decisions, and Accounts personnel review vouchers and record reimbursement status.

## 3. Key Features

### Employee Portal

- Secure login and authenticated access.
- Create, edit, and delete personal draft vouchers.
- Enter expense details, including department, category, date, title, description, and amount.
- Upload or reuse an employee signature.
- Submit signed vouchers for Director approval.
- View personal vouchers and their current status.
- Review rejection reasons and monitor claim progress.
- View dashboard statistics for personal expense claims.

### Director Approval Dashboard

- View submitted vouchers awaiting approval.
- Search and filter voucher records.
- Review expense details and employee signatures.
- Approve vouchers with a Director signature.
- Reject vouchers with a mandatory written reason.
- Monitor pending approvals, decisions, and pending expense amounts.
- View approval-related dashboard statistics.

### Accounts Workspace

- Access the organization-wide register of submitted vouchers.
- Review voucher details, approval decisions, and signatures.
- Search and filter records.
- View organization-level expense statistics.
- Track approved expenses requiring reimbursement.
- Record reimbursement status as `NOT_PAID` or `PAID` through the optional Accounts payment extension.

**Important:** Recording a voucher as paid updates its reimbursement status. It does not initiate a bank transfer or execute a financial transaction.

### Additional Capabilities

- RESTful API architecture.
- JWT-based authentication.
- Password hashing with bcryptjs.
- Backend-enforced role and ownership checks.
- Signature uploads using Multer and image processing using Sharp.
- Input validation and workflow-state restrictions.
- MySQL relational database integration using `mysql2` and parameterized SQL queries.

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Navigation | React Router |
| API communication | Axios |
| Backend | Node.js, Express.js |
| API architecture | REST APIs |
| Database | MySQL |
| Database connectivity | `mysql2`, parameterized SQL |
| Authentication | JSON Web Tokens (JWT) |
| Password security | bcryptjs |
| File uploads | Multer |
| Image processing | Sharp |
| Development tools | npm, Git, GitHub |

## 5. System Architecture

Expensio follows a client-server architecture that separates the user interface, backend business logic, and database operations.

```text
                 Employee / Director / Accounts
                              |
                              v
                   React + Vite Frontend
                 Tailwind CSS / React Router
                              |
                              v
                       Axios API Client
                              |
                              v
                    Express.js REST API
                              |
                  +-----------+-----------+
                  |           |           |
                  v           v           v
             Authentication  RBAC      Validation
              and JWT      Middleware   and Rules
                  |           |           |
                  +-----------+-----------+
                              |
                              v
                    Business Logic Layer
                              |
                    +---------+---------+
                    |                   |
                    v                   v
               MySQL Database     Signature Handling
               mysql2 / SQL       Multer / Sharp
                    |
                    v
              Voucher Records,
              Approval Data,
              User Information
```

### Architectural Principles

- **Separation of concerns:** Frontend components, API routes, controllers, middleware, and database operations have distinct responsibilities.
- **Centralized business logic:** Voucher transitions and authorization rules are enforced by the backend.
- **Relational data management:** MySQL maintains relationships between users, vouchers, and approval records.
- **API-driven communication:** The frontend communicates with the backend through REST endpoints.
- **Role-aware access:** Requests are checked against authentication, ownership, and authorization rules.

## 6. User Roles and Permissions

| Capability | Employee | Director | Accounts |
|---|---|---|---|
| View personal vouchers | Yes | — | — |
| Create draft vouchers | Yes | No | No |
| Edit or delete own drafts | Yes | No | No |
| Submit vouchers | Yes | No | No |
| Review submitted vouchers | Personal claims | Organization-wide | Organization-wide |
| Approve or reject claims | No | Yes | No |
| Add Director approval signature | No | Yes | No |
| View approval decisions | Own claims | Organization-wide | Organization-wide |
| View dashboard statistics | Personal | Organization-wide | Organization-wide |
| Update reimbursement status | No | No | Yes, if extension is enabled |

The role-permission matrix describes the intended access model. Each permission must be enforced by the backend rather than relying exclusively on frontend visibility.

## 7. Voucher Lifecycle

The application uses explicit voucher states to represent the approval workflow.

```text
                  Create Voucher
                        |
                        v
                      DRAFT
                        |
                 Submit with Signature
                        |
                        v
                PENDING_APPROVAL
                   /          \
                  /            \
             Approve            Reject
                |                  |
                v                  v
            APPROVED            REJECTED
                |
                v
       Accounts Reimbursement Tracking
                |
          +-----+------+
          |            |
          v            v
       NOT_PAID       PAID
```

### Workflow Rules

1. **Draft creation:** An employee creates a voucher and enters the required expense details.
2. **Draft modification:** The employee can modify or delete their own draft while it remains in `DRAFT`.
3. **Submission:** A valid employee signature is required before submission.
4. **Pending approval:** The voucher enters `PENDING_APPROVAL` and becomes read-only for the employee.
5. **Director decision:** The Director approves the voucher with a signature or rejects it with a reason.
6. **Accounts review:** Accounts personnel can inspect submitted vouchers and their approval outcomes.
7. **Reimbursement tracking:** When the payment extension is enabled, Accounts can record whether an approved voucher has been reimbursed.

Approval status and payment status are separate concepts. A voucher may be approved but not yet paid.

## 8. Dashboard and Analytics

Expensio provides role-specific dashboard metrics to help users understand their workload and expense activity.

### Employee Dashboard

- Total personal vouchers.
- Draft, pending, approved, and rejected counts.
- Total amount claimed.
- Visibility into rejection reasons and claim status.

### Director Dashboard

- Pending approvals.
- Approval and rejection activity.
- Total amount awaiting a decision.
- Recent voucher activity.

### Accounts Dashboard

- Total submitted vouchers.
- Pending approval and rejected counts.
- Approved expense amount.
- Recent approved vouchers.
- Reimbursement queue metrics, when the payment extension is enabled.

Dashboard values should be calculated from the underlying database records and scoped according to the authenticated user's role.

## 9. Database Design

The core application uses a relational MySQL schema to maintain user accounts, vouchers, and approval decisions.

### Core Tables

| Table | Purpose |
|---|---|
| `users` | Stores user details, unique email, password hash, role, department, and optional profile signature. |
| `vouchers` | Stores voucher number, employee reference, expense details, amount, employee signature, status, and timestamps. |
| `voucher_approvals` | Stores approval or rejection decisions, Director reference, signature or rejection reason, and decision timestamp. |
| `voucher_payments` | Optional extension table for reimbursement status, Accounts user reference, and payment timestamps. |

### Data Integrity Considerations

- Unique voucher numbers identify individual expense claims.
- Foreign keys connect vouchers with employees and approval records.
- Positive expense amounts are required.
- Approval and rejection actions are restricted by role and voucher state.
- Employee ownership determines which drafts and personal claims can be modified or viewed.
- Parameterized SQL queries help prevent SQL injection.
- The optional payment extension maintains reimbursement information separately from voucher approval status.

**Schema files**

- Core database schema: `backend/database/schema.sql`
- Optional reimbursement migration: `backend/database/accounts_payment_migration.sql`

The reimbursement migration should only be included in the setup instructions for the final repository if the extension has actually been merged and tested.

## 10. API Documentation

The backend exposes REST endpoints for authentication, voucher management, approval decisions, signature access, and Accounts operations.

Base URL for local development: `http://localhost:5000/api` (assuming the backend is configured to use port `5000`).

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve the authenticated user's information |

### Employee Voucher Operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/vouchers/my` | List the employee's vouchers |
| GET | `/vouchers/my/stats` | Retrieve personal voucher statistics |
| POST | `/vouchers` | Create a draft voucher |
| PUT | `/vouchers/:id` | Update an owned draft |
| DELETE | `/vouchers/:id` | Delete an owned draft |
| POST | `/vouchers/:id/signature` | Upload an employee signature |
| POST | `/vouchers/:id/submit` | Submit a signed draft |

### Director and Accounts Operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/review` | List submitted vouchers accessible to the role |
| GET | `/review/stats` | Retrieve review dashboard statistics |
| GET | `/review/:id` | Retrieve voucher details |
| GET | `/review/:id/signature/:kind` | Retrieve an authorized signature |
| POST | `/review/:id/approve` | Approve a voucher; Director only |
| POST | `/review/:id/reject` | Reject a voucher; Director only |
| GET | `/accounts/dashboard` | Retrieve Accounts dashboard statistics |

### Optional Accounts Payment Extension

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/accounts/payments` | Retrieve the reimbursement queue |
| PATCH | `/accounts/payments/:id` | Update an approved voucher's payment status |

The Accounts payment endpoints are available only if the extension has been integrated into the final backend.

### API Conventions

- Authenticated requests use the configured authentication mechanism and token.
- In the original implementation, protected endpoints use the `Authorization: Bearer <JWT>` header.
- Signature uploads use `multipart/form-data`.
- Backend authorization determines whether a request is permitted.
- Request payloads must satisfy the application's validation rules.

The endpoint list documents the supplied API contract. Confirm the actual route registrations and request/response payloads in the repository before treating it as an exhaustive API reference.

## 11. Security and Validation

Security is a key consideration because the application handles employee records, expense amounts, authentication credentials, and signatures.

### Implemented Design Elements

- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected frontend routes.
- Backend role-based authorization.
- Employee ownership checks for voucher operations.
- Parameterized SQL queries.
- Validation of required voucher fields.
- Positive-amount validation.
- Employee signature requirement before submission.
- Director signature requirement for approval.
- Mandatory rejection reason.
- Restrictions on modifying submitted or finalized claims.
- Authenticated access to signature images.

### Security Notes

Frontend route protection improves navigation and user experience, but it is not a security boundary. Every sensitive backend endpoint must independently enforce authentication, authorization, ownership, and workflow-state rules.

Before production deployment, review token expiry and storage, secret management, upload validation, HTTPS configuration, rate limiting, CORS settings, and error handling. These controls should only be described as implemented after verification against the actual source code.

## 12. Project Structure

The following is the documented logical structure. Confirm the exact filenames and nesting against the repository.

```text
Expensio-Expense-Voucher-Management-System/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── accounts_payment_migration.sql
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── scripts/
│   │   └── seedUsers.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── context/
│   │   └── components/
│   └── package.json
│
└── README.md
```

## 13. Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following tools:

- Node.js 20 or a compatible version supported by the project's dependencies.
- npm.
- MySQL 8 or a compatible MySQL server.
- Git.

Verify your installations:

```bash
node --version
npm --version
git --version
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/tanuja-prasad/Expensio-Expense-Voucher-Management-System.git

cd Expensio-Expense-Voucher-Management-System
```

### Step 2: Configure MySQL

Create the application database using the provided schema:

```sql
SOURCE backend/database/schema.sql;
```

Run this command from a MySQL client connected to the appropriate server, with the correct working directory and database permissions.

If the schema creates the database itself, do not rerun the database-creation statement against an existing installation.

### Step 3: Configure the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure the database connection, JWT secret, server port, and frontend origin.

For example, the backend environment may require:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=replace_with_a_strong_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

Use the exact variable names expected by the backend configuration. The values above are illustrative; verify them against `backend/.env.example`.

Start the backend:

```bash
npm run dev
```

If the project uses a different development script, follow the scripts defined in `backend/package.json`.

### Step 4: Configure the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file, if required, and configure the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### Step 5: Open the Application

Visit:

`http://localhost:5173`

Sign in using an account provisioned for the corresponding role.

For local demonstrations, create separate Employee, Director, and Accounts accounts. Do not use shared or default credentials in a public deployment.

### Step 6: Optional Reimbursement Setup

If the Accounts reimbursement extension is included in the final repository:

1. Verify that the backend routes, controller logic, and database integration for payments are present.
2. Apply `backend/database/accounts_payment_migration.sql` once to the correct database.
3. Verify that payment records are created or updated correctly.
4. Confirm that only Accounts users can update payment status.
5. Test that only approved vouchers can be marked paid or unpaid.

Do not apply an optional migration until its compatibility with the core schema has been confirmed.

## 14. Environment Configuration

Keep database credentials and authentication secrets outside version control.

| Variable | Purpose |
|---|---|
| `DB_HOST` | MySQL server hostname |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Application database |
| `JWT_SECRET` | Secret used for JWT signing and verification |
| `PORT` | Backend listening port |
| `CLIENT_URL` | Frontend origin used by backend configuration |

The required variables and their exact names depend on the repository's environment configuration.

**Never commit:**

- `.env` files containing real credentials.
- Database passwords.
- Production JWT secrets.
- Real user credentials or private signature files.

Commit a sanitized `.env.example` containing placeholder values instead.

## 15. Future Enhancements

Potential improvements that could extend the application include:

- Automated email notifications for voucher submission, approval, and rejection.
- A complete, immutable reimbursement transaction history.
- Receipt and invoice attachments.
- Advanced reporting with export to CSV or PDF.
- Pagination and optimized filtering for large voucher registers.
- Automated backend and frontend test suites in CI.
- Deployment with HTTPS and managed database hosting.
- Audit logging for all significant workflow transitions.
- Improved accessibility and responsive design.
- More detailed expense trend and department-level analytics.

These are proposed enhancements, not claims about existing functionality.

## 16. Learning Outcomes

Developing Expensio provides practical experience with:

- Building a full-stack application using React and Node.js.
- Designing and consuming REST APIs.
- Modeling relational data in MySQL.
- Implementing authentication and role-based authorization.
- Structuring backend routes, controllers, middleware, and services.
- Validating user input and enforcing workflow rules.
- Handling file uploads and signature images.
- Connecting frontend forms and dashboards to backend services.
- Managing source code and project changes using Git and GitHub.
- Translating a business workflow into an application design.

## 17. Project Status

Expensio is an academic full-stack development project focused on expense voucher lifecycle management.

The core documented scope includes employee voucher creation and submission, Director approval or rejection, role-specific dashboards, signature handling, and Accounts review. Reimbursement status tracking is an additional extension whose integration should be confirmed in the final repository.

**Verification note:** This README is based on the supplied project documentation. It does not independently establish that every listed feature is present in the current GitHub commit, that automated tests pass, or that a production deployment exists. Verify the code, environment configuration, migrations, and deployment status before making those claims.

## 18. Author

**Tanuja Prasad**  
Master of Computer Applications (MCA)  
MIT World Peace University, Pune

- GitHub: [@tanuja-prasad](https://github.com/tanuja-prasad)
- Project Repository: [Expensio — Expense Voucher Management System](https://github.com/tanuja-prasad/Expensio-Expense-Voucher-Management-System)

---

*Expensio — Streamlining expense claims through structured workflows, role-based access, and centralized voucher management.*
