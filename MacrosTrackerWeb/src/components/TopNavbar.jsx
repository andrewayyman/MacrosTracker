import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { logoutUser } from "../api/authClient";
import { User, Settings, LogOut, ChevronDown, Menu } from "lucide-react";

export default function TopNavbar({ onMenuClick }) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logoutUser(refreshToken, accessToken);
    } catch {
      // session may already be invalid on the server
    } finally {
      clearAuth();
      window.location.assign("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="dash-topnav">
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      <div className="dash-topnav__spacer"></div>
      <div className="dash-topnav__user" ref={dropdownRef}>
        <button 
          className="dash-topnav__profile-btn" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="dash-topnav__avatar">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <span className="dash-topnav__username">{user?.firstName || "User"}</span>
          <ChevronDown size={16} />
        </button>
        
        {dropdownOpen && (
          <div className="dash-topnav__dropdown">
            <Link to="/profile-setup" className="dash-topnav__dropdown-item" onClick={() => setDropdownOpen(false)}>
              <User size={16} /> Profile
            </Link>
            <Link to="/goal-setup" className="dash-topnav__dropdown-item" onClick={() => setDropdownOpen(false)}>
              <Settings size={16} /> Settings
            </Link>
            <div className="dash-topnav__dropdown-divider"></div>
            <button className="dash-topnav__dropdown-item text-danger" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
