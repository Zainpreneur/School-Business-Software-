import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: "📊", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { to: "/students", label: "Students", icon: "🎓" },
  { to: "/teachers", label: "Teachers", icon: "🧑‍🏫", roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/academics", label: "Classes & Subjects", icon: "🏫", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { to: "/attendance", label: "Attendance", icon: "🗓️", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { to: "/exams", label: "Exams & Results", icon: "📝", roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { to: "/finance/invoices", label: "Fees & Invoices", icon: "💳", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { to: "/finance/expenses", label: "Expenses", icon: "🧾", roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { to: "/announcements", label: "Announcements", icon: "📣" },
  { to: "/users", label: "Users", icon: "👥", roles: ["SUPER_ADMIN", "ADMIN"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="text-2xl">🎒</span>
          <div>
            <p className="font-bold leading-tight text-slate-800">EduManage</p>
            <p className="text-xs text-slate-400">School Business Suite</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="md:hidden font-bold text-slate-800">🎒 EduManage</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role.replace("_", " ")}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
