import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ showSearch = false }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  function handleSearch() {
    if (searchTerm.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src="/Images/logo1.png" alt="Property Master Logo" />
          <div className="navbar-logo-text">
            <h1>Property Master</h1>
            <span>All India</span>
          </div>
        </Link>

        {/* Search (only on listings page) */}
        {showSearch && (
          <div className="navbar-search-wrap">
            <div className="search-inner">
              <input
                type="text"
                placeholder="Search by location (e.g., 'Vadodara')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSearch} aria-label="Search">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Nav links (hidden on mobile) */}
        {!showSearch && (
          <nav className="navbar-links">
            <Link to="/listings?listing_type=Sell%20Property">For Buyers</Link>
            <Link to="/listings?listing_type=Rent%20%2F%20Lease%20Property">For Tenants</Link>
            <Link to="/sell">For Owner</Link>
            <Link to="/sell">For Dealer/Builder</Link>
          </nav>
        )}

        {/* User avatar */}
        <div className="navbar-right">
          <button
            className="user-avatar-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="user-menu">
              {user ? (
                <>
                  <div className="user-menu-header">
                    <p>Signed in as:</p>
                    <p>{user.email}</p>
                  </div>
                  <div className="user-menu-body">
                    <button onClick={() => { logout(); setMenuOpen(false); }}>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="user-menu-body user-menu-guest">
                  <p className="user-menu-guest-hint">Not signed in</p>
                  <button
                    className="btn-orange btn-full view-details-btn"
                    onClick={() => { setMenuOpen(false); navigate('/?login=1'); }}
                  >
                    Login / Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
