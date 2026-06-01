import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, History, TrendingUp, Plus } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/my-goal", label: "My Goals", icon: <Target size={20} /> },
    { to: "/log", label: "Add Meal", icon: <Plus size={20} /> },
    { to: "/history", label: "History", icon: <History size={20} /> },
    { to: "/progress", label: "Progress", icon: <TrendingUp size={20} /> },
  ];

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__brand">
        <span className="dash-sidebar__logo">GS</span>
        <span className="dash-sidebar__name">GymScan</span>
      </div>
      <nav className="dash-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `dash-sidebar__link ${isActive ? "dash-sidebar__link--active" : ""}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
