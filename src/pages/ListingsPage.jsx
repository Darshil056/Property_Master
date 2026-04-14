import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import API from '../api';

function formatPrice(p) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  return `₹${(p / 100000).toFixed(2)} Lac`;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mainImg, setMainImg] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [headerSearch, setHeaderSearch] = useState(searchParams.get('search') || '');

  const listingType = searchParams.get('listing_type');
  const propertyGroup = searchParams.get('property_group');
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (listingType) params.listing_type = listingType;
    if (propertyGroup) params.property_group = propertyGroup;
    if (search) params.search = search;
    if (category) {
      const c = category.toLowerCase();
      if (c === 'buy') params.listing_type = 'Sell Property';
      else if (c === 'rent') params.listing_type = 'Rent / Lease Property';
      else if (c === 'new launch' || c === 'projects') params.is_new_launch = true;
      else if (c === 'commercial') params.property_group = 'commercial';
      else if (c === 'plot/lands') params.property_group = 'plot/land';
    }
    API.get('/properties', { params })
      .then(res => { setProperties(res.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load properties.'); setLoading(false); });
  }, [listingType, propertyGroup, search, category]);

  function buildResultLabel() {
    const parts = [];
    if (listingType === 'Sell Property') parts.push('For Sale');
    if (listingType === 'Rent / Lease Property') parts.push('For Rent');
    if (propertyGroup) parts.push(propertyGroup);
    if (search) parts.push(`in "${search}"`);
    if (category) parts.push(category);
    return parts.length ? `Showing results for ${parts.join(' ')}` : 'Showing all properties';
  }

  function handleHeaderSearch() {
    const newParams = new URLSearchParams(searchParams);
    if (headerSearch.trim()) newParams.set('search', headerSearch.trim());
    else newParams.delete('search');
    setSearchParams(newParams);
  }

  function openModal(property) {
    setSelectedProperty(property);
    setMainImg(property.image_urls?.[0] || '');
  }

  function closeModal() { setSelectedProperty(null); }

  function getBadgeClass(p) {
    if (p.is_new_launch) return 'launch';
    if (p.listing_type === 'Sell Property') return 'sale';
    return 'rent';
  }

  function getBadgeLabel(p) {
    if (p.is_new_launch) return 'New Launch';
    if (p.listing_type === 'Sell Property') return 'For Sale';
    return 'For Rent';
  }

  return (
    <div>
      <Navbar showSearch />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main className="page-content">
        {/* Search row */}
        <div className="listing-search-row">
          <input
            type="text"
            className="listing-search-input"
            placeholder="Search by location (e.g., 'Vadodara')"
            value={headerSearch}
            onChange={e => setHeaderSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleHeaderSearch()}
          />
          <button className="btn-orange" onClick={handleHeaderSearch}>Search</button>
        </div>

        {/* Results header */}
        <div className="search-results-header">
          <h3>Search Results</h3>
          <p>{buildResultLabel()}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-spinner">
            <div className="spin"></div>
            <p className="loading-text">Loading Properties...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="no-results">
            <h3 className="error-heading">Error Loading Properties</h3>
            <p>{error}</p>
          </div>
        )}

        {/* No results */}
        {!loading && !error && properties.length === 0 && (
          <div className="no-results">
            <h3>No Properties Found</h3>
            <p>We couldn't find any properties matching your search. Try adjusting your filters.</p>
          </div>
        )}

        {/* Properties grid */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid-3">
            {properties.map(p => {
              const img = p.image_urls?.[0] || 'https://placehold.co/600x400/040459/FF7142?text=Property+Master';
              const name = p.address ? p.address.split(',')[0].trim() : p.city;
              const title = `${p.property_type}${p.bhk ? ` (${p.bhk} BHK)` : ''} in ${name}`;
              const price = p.listing_type === 'Rent / Lease Property'
                ? `₹${Number(p.price).toLocaleString('en-IN')}/month`
                : formatPrice(p.price);
              return (
                <div key={p._id} className="property-card">
                  <img src={img} alt={title} />
                  <div className="property-card-body">
                    <p className="location">{p.city}, {p.state}</p>
                    <p className="title" title={title}>{title}</p>
                    <div className="price-area">
                      <span>{price}</span>
                      <span className="sep">|</span>
                      <span>{Number(p.area_sqft).toLocaleString('en-IN')} sqft</span>
                    </div>
                    <button className="btn-orange btn-full view-details-btn" onClick={() => openModal(p)}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box xl prop-modal-box">
            <div className="prop-modal-grid">
              {/* Images */}
              <div className="prop-modal-images">
                <img
                  className="main-img"
                  src={mainImg || 'https://placehold.co/800x450?text=No+Image'}
                  alt="Property"
                />
                <div className="prop-modal-thumbs">
                  {(selectedProperty.image_urls || []).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Thumbnail ${i + 1}`}
                      className={url === mainImg ? 'active' : ''}
                      onClick={() => setMainImg(url)}
                    />
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="prop-modal-details">
                <button className="modal-close" onClick={closeModal}>✕</button>
                <span className={`badge ${getBadgeClass(selectedProperty)}`}>{getBadgeLabel(selectedProperty)}</span>
                <h2 className="modal-prop-title">
                  {selectedProperty.address?.split(',')[0] || selectedProperty.city}
                </h2>
                <p className="modal-prop-address">{selectedProperty.address}</p>

                <div className="modal-detail-card">
                  <p className="modal-price">
                    {selectedProperty.listing_type === 'Rent / Lease Property'
                      ? `₹${Number(selectedProperty.price).toLocaleString('en-IN')}/month`
                      : formatPrice(selectedProperty.price)}
                  </p>
                  <div className="detail-stats">
                    <div><p className="stat-label">BHK</p><p className="stat-value">{selectedProperty.bhk || 'N/A'}</p></div>
                    <div><p className="stat-label">Area</p><p className="stat-value">{selectedProperty.area_sqft} sqft</p></div>
                    <div className="stat-full-row">
                      <p className="stat-label">Property Type</p>
                      <p className="stat-value">{selectedProperty.property_type}</p>
                    </div>
                  </div>
                  <a className="call-btn" href={`tel:${selectedProperty.contact_number}`}>
                    Call: {selectedProperty.contact_number}
                  </a>
                </div>

                <hr className="modal-divider" />
                <h3 className="modal-desc-title">Description</h3>
                <p className="modal-desc-text">
                  {selectedProperty.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
