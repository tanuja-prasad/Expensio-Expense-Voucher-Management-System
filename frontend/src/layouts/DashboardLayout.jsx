import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  ReceiptText,
  CircleUserRound,
  Bell,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { voucherApi } from "../api/vouchers";
import { reviewApi } from "../api/review";

const navigation = {
  EMPLOYEE: [
    {
      label: "Dashboard",
      path: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Vouchers",
      path: "/employee/vouchers",
      icon: FileText,
    },
    {
      label: "Create Voucher",
      path: "/employee/vouchers/new",
      icon: PlusCircle,
    },
  ],

  DIRECTOR: [
    {
      label: "Dashboard",
      path: "/director/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Pending Approvals",
      path: "/director/pending",
      icon: ClipboardCheck,
    },
    {
      label: "All Vouchers",
      path: "/director/vouchers",
      icon: FileText,
    },
  ],

  ACCOUNTS: [
    {
      label: "Dashboard",
      path: "/accounts/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "All Vouchers",
      path: "/accounts/vouchers",
      icon: FileText,
    },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seen, setSeen] = useState([]);

  // Lightweight status notifications based on the existing APIs.
  // No new database table or backend route is required.
  useEffect(() => {
    let active = true;
    const key = `expensio.seen.${user.id}`;
    try { setSeen(JSON.parse(sessionStorage.getItem(key) || "[]")); } catch { setSeen([]); }
    const refresh = async () => {
      try {
        let rows = [];
        if (user.role === "EMPLOYEE") {
          const response = await voucherApi.listMine();
          rows = (response.data.data || []).filter(v => ["APPROVED", "REJECTED"].includes(v.status));
        } else {
          const response = await reviewApi.list({ sort: "recent" });
          rows = (response.data.data || []).filter(v =>
            user.role === "DIRECTOR" ? v.status === "PENDING_APPROVAL" : v.status === "APPROVED"
          );
        }
        if (active) setNotifications(rows.slice(0, 10).map(v => ({
          key: `${v.id}-${v.status}`,
          title: `${v.voucher_number}: ${v.status.replaceAll("_", " ")}`,
          subtitle: v.title,
          to: user.role === "EMPLOYEE" ? `/employee/vouchers/${v.id}` : `/${user.role.toLowerCase()}/vouchers/${v.id}`
        })));
      } catch (error) { console.error("Notification refresh failed", error); }
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, [user.id, user.role]);

  const unread = notifications.filter(n => !seen.includes(n.key)).length;
  const markSeen = () => {
    const next = [...new Set([...seen, ...notifications.map(n => n.key)])];
    setSeen(next);
    sessionStorage.setItem(`expensio.seen.${user.id}`, JSON.stringify(next));
  };

  const links = navigation[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="exp-app">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`exp-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <ReceiptText size={27} />
            <span className="text-xl font-bold">
              Expensio
            </span>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-200 p-4">
          <div className="mb-4 px-3">
            <p className="truncate text-sm font-semibold">
              {user.name}
            </p>
            <p className="text-xs text-slate-500">
              {user.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="exp-topbar sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <h1 className="text-lg font-semibold text-slate-900">
              Expensio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen(v => !v)}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
                <Bell size={22} />
                {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 text-[10px] text-white">{unread}</span>}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-72 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:w-80">
                <div className="mb-3 flex items-center justify-between"><strong className="text-sm">Notifications</strong><button onClick={markSeen} className="text-xs text-blue-700">Mark all read</button></div>
                {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> :
                  <div className="max-h-80 space-y-1 overflow-auto">{notifications.map(n =>
                    <NavLink key={n.key} to={n.to} onClick={() => { markSeen(); setNotificationsOpen(false); }}
                      className={`block rounded-lg p-2 text-sm hover:bg-slate-50 ${seen.includes(n.key) ? "text-slate-500" : "bg-blue-50 text-slate-900"}`}>
                      <div className="font-medium">{n.title}</div><div className="truncate text-xs">{n.subtitle}</div>
                    </NavLink>)}</div>}
              </div>}
            </div>
          <NavLink to="/profile" className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-slate-100" title="View profile"><CircleUserRound size={27} className="text-slate-500"/><div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name}
            </p>
            <p className="text-xs text-slate-500">
              {user.role}
            </p>
          </div></NavLink>
          </div>
        </header>

        <main className="exp-main p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}