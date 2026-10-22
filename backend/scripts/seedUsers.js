require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../src/config/db");

const demoUsers = [
  {
    name: "Aarav Sharma",
    email: "employee@gmail.com",
    employeeCode: "EMP001",
    department: "IT",
    role: "EMPLOYEE",
    password: process.env.SEED_EMPLOYEE_PASSWORD
  },
  {
    name: "Meera Deshpande",
    email: "director@gmail.com",
    employeeCode: null,
    department: "Management",
    role: "DIRECTOR",
    password: process.env.SEED_DIRECTOR_PASSWORD
  },
  {
    name: "Priya Kulkarni",
    email: "accounts@gmail.com",
    employeeCode: null,
    department: "Finance",
    role: "ACCOUNTS",
    password: process.env.SEED_ACCOUNTS_PASSWORD
  }
];

async function seedUsers() {
  try {
    if (demoUsers.some(user => !user.password || user.password.length < 3)) {
      throw new Error("Set SEED_EMPLOYEE_PASSWORD, SEED_DIRECTOR_PASSWORD, and SEED_ACCOUNTS_PASSWORD in backend/.env (at least 12 characters each).");
    }
    if (new Set(demoUsers.map(user => user.password)).size !== 3) {
      throw new Error("Each demo role must have a different password.");
    }

    for (const user of demoUsers) {
      const password = await bcrypt.hash(user.password, 12);
      await db.execute(
        `INSERT INTO users
          (name, email, password, employee_code, department, role)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           password = VALUES(password),
           employee_code = VALUES(employee_code),
           department = VALUES(department),
           role = VALUES(role)`,
        [
          user.name,
          user.email,
          password,
          user.employeeCode,
          user.department,
          user.role
        ]
      );
    }

    console.log("Demo users created successfully");
  } catch (error) {
    console.error("Failed to seed users:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seedUsers();