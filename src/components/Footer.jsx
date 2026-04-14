import { Link } from 'react-router-dom';

export default function Footer({ onToolClick }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <Link to="/" className="footer-brand">
            <img src="/Images/logo1.png" alt="Property Master Logo" />
            <span>Property Master</span>
          </Link>
          <p className="footer-desc">Find your dream property, faster.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/listings?listing_type=Sell%20Property">For Buyers</Link></li>
            <li><Link to="/listings?listing_type=Rent%20%2F%20Lease%20Property">For Tenants</Link></li>
            <li><Link to="/sell">List Your Property</Link></li>
          </ul>
        </div>

        

        {/* Popular Tools */}
        <div>
          <h4>Popular Tools</h4>
          <ul>
            <li><button onClick={() => onToolClick && onToolClick('budget')}>Budget Calculator</button></li>
            <li><button onClick={() => onToolClick && onToolClick('emi')}>EMI Calculator</button></li>
            <li><button onClick={() => onToolClick && onToolClick('eligibility')}>Loan Eligibility</button></li>
            <li><button onClick={() => onToolClick && onToolClick('area')}>Area Converter</button></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Property Master. All rights reserved.</p>
      </div>
    </footer>
  );
}
