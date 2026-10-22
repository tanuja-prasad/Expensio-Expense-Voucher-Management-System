import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { getDashboardPath } from "./utils/roleRoutes";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Profile from "./pages/shared/Profile";

// Employee
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import VoucherForm from "./pages/employee/VoucherForm";
import MyVouchers from "./pages/employee/MyVouchers";
import VoucherDetails from "./pages/employee/VoucherDetails";

// Director
import DirectorDashboard from "./pages/director/DirectorDashboard";

// Accounts
import AccountsDashboard from "./pages/accounts/AccountsDashboard";
import AccountsPayments from "./pages/accounts/AccountsPayments";



// Shared components for Director and Accounts
import ReviewVouchers from "./pages/shared/ReviewVouchers";
import ReviewDetails from "./pages/shared/ReviewDetails";

function Redirect() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="p-8">Restoring your session…</div>;
  }

  return (
    <Navigate
      replace
      to={user ? getDashboardPath(user.role) : "/login"}
    />
  );
}

function LoginRoute() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="p-8">Restoring your session…</div>;
  }

  return user ? (
    <Navigate replace to={getDashboardPath(user.role)} />
  ) : (
    <Login />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Redirect />} />

      <Route path="/login" element={<LoginRoute />} />

      {/* EMPLOYEE */}
      <Route
        element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />
          <Route
            path="/employee/vouchers"
            element={<MyVouchers />}
          />
          <Route
            path="/employee/vouchers/new"
            element={<VoucherForm />}
          />
          <Route
            path="/employee/vouchers/:id/edit"
            element={<VoucherForm />}
          />
          <Route
            path="/employee/vouchers/:id"
            element={<VoucherDetails />}
          />
        </Route>
      </Route>

      {/* DIRECTOR */}
      <Route
        element={<ProtectedRoute allowedRoles={["DIRECTOR"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/director/dashboard"
            element={<DirectorDashboard />}
          />
          <Route
            path="/director/pending"
            element={<ReviewVouchers pendingOnly />}
          />
          <Route
            path="/director/vouchers"
            element={<ReviewVouchers />}
          />
          <Route
            path="/director/vouchers/:id"
            element={<ReviewDetails />}
          />
        </Route>
      </Route>

      {/* ACCOUNTS */}
      <Route
        element={<ProtectedRoute allowedRoles={["ACCOUNTS"]} />}
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/accounts/dashboard"
            element={<AccountsDashboard />}
          />
          <Route path="/accounts/payments" element={<AccountsPayments />} />
          <Route
            path="/accounts/vouchers"
            element={<ReviewVouchers />}
          />
          <Route
            path="/accounts/vouchers/:id"
            element={<ReviewDetails />}
          />
        </Route>
        <Route path="/accounts" element={<AccountsDashboard />} />

      </Route>

      {/* PROFILE — ALL ROLES */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "DIRECTOR", "ACCOUNTS"]}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Redirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}