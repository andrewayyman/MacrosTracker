import { Link } from "react-router-dom";
import { Globe, MessageCircle, Share2, Mail } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container public-footer__container">
        <div className="public-footer__brand-col">
          <Link to="/" className="public-footer__brand">GymScan</Link>
          <p className="public-footer__desc">
            The smartest AI food scanner built for accurate nutrition tracking. 
            Hit your goals without the guesswork.
          </p>
          <div className="public-footer__socials">
            <a href="#" className="public-footer__social-link"><Globe size={20} /></a>
            <a href="#" className="public-footer__social-link"><MessageCircle size={20} /></a>
            <a href="#" className="public-footer__social-link"><Share2 size={20} /></a>
          </div>
        </div>
        
        <div className="public-footer__links-col">
          <h4 className="public-footer__title">Product</h4>
          <Link to="/#features" className="public-footer__link">Features</Link>
          <Link to="/#how-it-works" className="public-footer__link">How it Works</Link>
          <Link to="/login" className="public-footer__link">Sign In</Link>
          <Link to="/register" className="public-footer__link">Sign Up</Link>
        </div>

        <div className="public-footer__links-col">
          <h4 className="public-footer__title">Company</h4>
          <a href="#" className="public-footer__link">About Us</a>
          <a href="#" className="public-footer__link">Privacy Policy</a>
          <a href="#" className="public-footer__link">Terms of Service</a>
          <a href="#" className="public-footer__link">Contact</a>
        </div>
        
        <div className="public-footer__contact-col">
          <h4 className="public-footer__title">Contact Us</h4>
          <p className="public-footer__contact-item">
            <Mail size={16} /> support@gymscan.com
          </p>
        </div>
      </div>
      <div className="public-footer__bottom">
        <p>&copy; {new Date().getFullYear()} GymScan. All rights reserved.</p>
      </div>
    </footer>
  );
}
