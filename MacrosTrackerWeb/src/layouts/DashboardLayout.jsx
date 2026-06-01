import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on navigation on mobile
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="dashboard-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar />
      <div className="dashboard-main-area">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
