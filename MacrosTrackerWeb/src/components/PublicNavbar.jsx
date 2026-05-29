import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    if (!isHome) return;
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`public-navbar ${isScrolled ? "public-navbar--scrolled" : ""}`}>
      <div className="container public-navbar__container">
        <Link to="/" className="public-navbar__brand">
          GymScan
        </Link>
        
        <div className="public-navbar__desktop-menu">
          {isHome && (
            <>
              <a href="#home" onClick={(e) => scrollToSection(e, "home")} className="public-navbar__link">Home</a>
              <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="public-navbar__link">Features</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="public-navbar__link">How it Works</a>
            </>
          )}
        </div>

        <div className="public-navbar__actions">
          <Link to="/login" className="btn-modern-secondary btn--sm">Log In</Link>
          <Link to="/register" className="btn-modern-primary btn--sm">Sign Up</Link>
        </div>
        
        <button className="public-navbar__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="public-navbar__mobile-menu">
          {isHome && (
            <>
              <a href="#home" onClick={(e) => scrollToSection(e, "home")} className="public-navbar__mobile-link">Home</a>
              <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="public-navbar__mobile-link">Features</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="public-navbar__mobile-link">How it Works</a>
            </>
          )}
          <div className="public-navbar__mobile-actions">
            <Link to="/login" className="btn-modern-secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="btn-modern-primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
