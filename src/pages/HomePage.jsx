import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import API from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

function formatCurrency(val) {
  const n = Number(val);
  return isNaN(n) ? '₹ 0' : '₹ ' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function formatShort(val) {
  const n = Number(val);
  if (isNaN(n)) return '0';
  if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
  return (n / 1000).toFixed(0) + ' K';
}

const galleryItems = [
  { img: '/Images/Untitled design.png', label: 'Buying A Home', to: '/listings?listing_type=Sell%20Property&property_group=Residential' },
  { img: '/Images/Untitled design (1).png', label: 'Rent A Home', to: '/listings?listing_type=Rent%20%2F%20Lease%20Property&property_group=Residential' },
  { img: '/Images/Untitled design (2).png', label: 'Sell/Rent Property', to: '/sell' },
  { img: '/Images/Untitled design (3).png', label: 'Plots/Land', to: '/listings?property_group=Plot%2FLand' },
  { img: '/Images/Untitled design (6).png', label: 'Buying Commercial', to: '/listings?listing_type=Sell%20Property&property_group=Commercial' },
  { img: '/Images/Untitled design (7).png', label: 'Lease Commercial', to: '/listings?listing_type=Rent%20%2F%20Lease%20Property&property_group=Commercial' },
  { img: '/Images/Untitled design (8).png', label: 'Invest In Real Estate', to: '/listings?listing_type=Sell%20Property' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [category, setCategory] = useState('Buy');
  const [searchTerm, setSearchTerm] = useState('');
  const [newLaunches, setNewLaunches] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // Budget state
  const [savings, setSavings] = useState(2000000);
  const [emi, setEmi] = useState(20000);
  const [tenure, setTenure] = useState(20);

  // EMI state
  const [loanAmt, setLoanAmt] = useState(3000000);
  const [emiTenure, setEmiTenure] = useState(20);
  const [emiRate, setEmiRate] = useState(8.9);

  // Eligibility state
  const [income, setIncome] = useState(100000);
  const [existingEmi, setExistingEmi] = useState(10000);
  const [eliRate, setEliRate] = useState(8.9);
  const [eliTenure, setEliTenure] = useState(20);

  // Area state
  const [fromUnit, setFromUnit] = useState('Square Feet');
  const [toUnit, setToUnit] = useState('Square Meter');
  const [areaVal, setAreaVal] = useState(1);

  const areaUnits = {
    'Square Feet': 1, 'Square Meter': 10.7639, 'Square Yard (Gaj)': 9,
    'Acre': 43560, 'Hectare': 107639, 'Bigha': 27000, 'Cent': 435.6
  };

  useEffect(() => {
    API.get('/properties?is_new_launch=true')
      .then(res => setNewLaunches(res.data))
      .catch(() => {});
  }, []);

  function calcBudget() {
    const r = 8.75 / 100 / 12;
    const n = tenure * 12;
    const loan = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const total = savings + loan;
    return `${formatShort(total * 0.95)} – ${formatShort(total * 1.05)}`;
  }

  function calcEmi() {
    const r = emiRate / 12 / 100;
    const n = emiTenure * 12;
    const e = (loanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = e * n;
    return { monthly: Math.round(e), total: Math.round(total), interest: Math.round(total - loanAmt) };
  }

  function calcEligibility() {
    const maxEmi = income * 0.5 - existingEmi;
    const r = eliRate / 12 / 100;
    const n = eliTenure * 12;
    const loanAmount = maxEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    return { maxEmi: Math.round(maxEmi), loanAmount: Math.round(loanAmount), payable: Math.round(maxEmi * n) };
  }

  function calcArea() {
    const inSqFt = areaVal * (areaUnits[fromUnit] || 1);
    return (inSqFt / (areaUnits[toUnit] || 1)).toFixed(4);
  }

  const emiData = calcEmi();
  const eliData = calcEligibility();

  function handleSearch() {
    navigate(`/listings?category=${encodeURIComponent(category)}&search=${encodeURIComponent(searchTerm)}`);
  }

  function closeModal() { setActiveModal(null); }

  return (
    <div>
      <Navbar />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main className="page-content">

        {/* Search Section */}
        <section className="search-section">
          <div className="category-tabs">
            {['Buy','Rent','New Launch','Commercial','Plot/Lands','Projects'].map(cat => (
              <button
                key={cat}
                className={`category-btn${category === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search by location, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-orange" onClick={handleSearch}>Search</button>
          </div>
        </section>

        {/* Gallery Slider */}
        <section className="section-mb-3">
          <div className="slider-container">
            {galleryItems.map(item => (
              <Link key={item.label} to={item.to} className="slider-item">
                <img src={item.img} alt={item.label} />
                <h3>{item.label}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Tools */}
        <section className="section-mb-5">
          <div className="orange-banner">
            <h2>Use A Popular Tool</h2>
            <p>Go From Browsing To Buying</p>
          </div>
          <div className="tools-grid">
            {[
              { id: 'budget', img: '/Images/+.png', title: 'Budget Calculator', desc: 'Check For Affordability Range For Buying Home' },
              { id: 'emi', img: '/Images/+ (1).png', title: 'EMI Calculator', desc: 'Calculate Your Home Loan EMI' },
              { id: 'eligibility', img: '/Images/+ (2).png', title: 'Loan Eligibility', desc: 'See What You Can Borrow For Your Home' },
              { id: 'area', img: '/Images/+ (3).png', title: 'Area Converter', desc: 'Convert One Area Into Any Other Easily' },
            ].map(tool => (
              <div key={tool.id} className="tool-card" onClick={() => setActiveModal(tool.id)}>
                <img src={tool.img} alt={tool.title} />
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sections */}
        <section className="section-mb-4">
          <p className="section-subtitle">ALL PROPERTY NEEDS - ONE PORTAL</p>
          <h2 className="section-title">FIND BETTER PLACE TO LIVE, WORK<br />AND WONDER...</h2>

          {/* Buy a Home */}
          <div className="feature-section section-mb-4">
            <img src="/Images/Untitled design.png" alt="Living room" className="feature-img left" />
            <div className="info-card right-card">
              <p className="feature-label">BUY A HOME</p>
              <h3 className="feature-title">FIND, BUY &amp; OWN YOUR DREAM HOME</h3>
              <p className="feature-desc">Explore from Apartment Land, Builder Floor, Villas and more</p>
              <Link to="/listings" className="btn-link">Explore Buying</Link>
            </div>
          </div>

          {/* New Launch */}
          <div className="orange-section">
            <h2>NEW LAUNCHED PROJECTS</h2>
            <div className="slider-container">
              {newLaunches.length === 0
                ? <p className="no-launch-msg">No new launched projects at this time.</p>
                : newLaunches.map(p => {
                    const img = p.image_urls?.[0] || 'https://placehold.co/96x96/fed7aa/f97316?text=Proj';
                    const name = p.address ? p.address.split(',')[0].trim() : 'Project';
                    return (
                      <div key={p._id} className="new-launch-card">
                        <img src={img} alt={name} />
                        <div>
                          <h4>{name}</h4>
                          <p>{p.city}, {p.state}</p>
                          <p className="price-bhk">{formatCurrency(p.price)} | {p.bhk || 'N/A'} BHK</p>
                          <Link to="/listings">View Details</Link>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Plots/Land */}
          <div className="feature-section feature-mt4-mb4">
            <img src="/Images/Untitled design (3).png" alt="Plots" className="feature-img left" />
            <div className="info-card right-card">
              <p className="feature-label">BUY PLOTS/LAND</p>
              <h3 className="feature-title">RESIDENTIAL &amp; COMMERCIAL PLOT/LAND</h3>
              <p className="feature-desc">Explore Residential, Agricultural, Industrial and Commercial Plots/Land</p>
              <Link to="/listings" className="btn-link">Explore Buying</Link>
            </div>
          </div>

          {/* Sell/Rent */}
          <div className="feature-section section-mb-4">
            <img src="/Images/Untitled design (2).png" alt="Sell/Rent" className="feature-img right" />
            <div className="info-card left-card">
              <h3 className="feature-title">Sell or rent faster at the right price!</h3>
              <p className="feature-desc">List your property now</p>
              <Link to="/sell" className="btn-link">POST PROPERTY IT'S FREE</Link>
            </div>
          </div>

          {/* Commercial */}
          <p className="section-subtitle section-pt-2">COMMERCIAL SPACES</p>
          <h2 className="section-title">Choose from a wide variety of<br />commercial properties</h2>

          <div className="feature-section section-mb-4">
            <img src="/Images/Untitled design (6).png" alt="Commercial Buy" className="feature-img left" />
            <div className="info-card right-card">
              <p className="feature-label">BUY FOR COMMERCIAL USE</p>
              <h3 className="feature-title">Buy a Commercial property</h3>
              <p className="feature-desc">Explore from Office Spaces, Co-working spaces, Retail Shops, Land, Factories and more</p>
              <Link to="/listings" className="btn-link">Explore Buying</Link>
            </div>
          </div>

          <div className="feature-section section-mb-4">
            <img src="/Images/Untitled design (7).png" alt="Commercial Lease" className="feature-img right" />
            <div className="info-card left-card">
              <p className="feature-label">LEASE FOR COMMERCIAL USE</p>
              <h3 className="feature-title">Lease a Commercial property</h3>
              <p className="feature-desc">Explore from Office Spaces, Co-working spaces, Retail Shops, Land, Factories and more</p>
              <Link to="/listings" className="btn-link">Explore Buying</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer onToolClick={(tool) => setActiveModal(tool)} />

      {/* BUDGET MODAL */}
      {activeModal === 'budget' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box wide">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 className="modal-heading">Check your home buying budget</h2>
            <div className="calc-grid">
              <div>
                <div className="slider-row-gap">
                  <div className="slider-label-row"><label>Savings for buying home</label><span>{formatCurrency(savings)}</span></div>
                  <input type="range" min="0" max="200000000" step="100000" value={savings} onChange={e => setSavings(+e.target.value)} />
                  <div className="slider-ends"><span>₹ 0</span><span>₹ 20 Cr</span></div>
                </div>
                <div className="slider-row-gap">
                  <div className="slider-label-row"><label>EMI you can afford</label><span>{formatCurrency(emi)}</span></div>
                  <input type="range" min="1000" max="1000000" step="1000" value={emi} onChange={e => setEmi(+e.target.value)} />
                  <div className="slider-ends"><span>₹ 1,000</span><span>₹ 10 Lacs</span></div>
                </div>
                <div>
                  <div className="slider-label-row"><label>Preferred loan tenure</label><span>{tenure} Years</span></div>
                  <input type="range" min="1" max="30" step="1" value={tenure} onChange={e => setTenure(+e.target.value)} />
                  <div className="slider-ends"><span>1 yr</span><span>30 yrs</span></div>
                </div>
              </div>
              <div className="result-box result-box-center">
                <p className="label">Your home budget</p>
                <p className="budget-result-value">{calcBudget()}</p>
              </div>
            </div>
            <p className="note">*Estimated at an average interest rate of 8.75%</p>
          </div>
        </div>
      )}

      {/* EMI MODAL */}
      {activeModal === 'emi' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box wide">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 className="modal-heading-sm">EMI Calculator</h2>
            <div className="calc-grid">
              <div>
                <div className="form-row-3 calc-form-mb">
                  <div className="form-group"><label>Loan Amount (₹)</label><input type="number" value={loanAmt} onChange={e => setLoanAmt(+e.target.value)} /></div>
                  <div className="form-group"><label>Tenure (yrs)</label><input type="number" value={emiTenure} onChange={e => setEmiTenure(+e.target.value)} /></div>
                  <div className="form-group"><label>Interest Rate (%)</label><input type="number" step="0.1" value={emiRate} onChange={e => setEmiRate(+e.target.value)} /></div>
                </div>
                <Doughnut
                  data={{ labels: ['Principal', 'Interest'], datasets: [{ data: [loanAmt, emiData.interest], backgroundColor: ['#040459', '#FF7142'], borderWidth: 2 }] }}
                  options={{ responsive: true, cutout: '50%', plugins: { legend: { display: false } } }}
                />
                <div className="chart-legend">
                  <span><span className="legend-dot legend-dot-blue"></span>Principal</span>
                  <span><span className="legend-dot legend-dot-orange"></span>Interest</span>
                </div>
              </div>
              <div className="result-box result-box-center-gap">
                <p className="label">Monthly EMI</p>
                <p className="emi-monthly">₹ {emiData.monthly.toLocaleString('en-IN')}</p>
                <p className="label">Total Payable Amount</p>
                <p className="sub-value">₹ {emiData.total.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ELIGIBILITY MODAL */}
      {activeModal === 'eligibility' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box xl">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 className="modal-heading-sm">Loan Eligibility</h2>
            <div className="calc-grid">
              <div>
                <div className="form-row calc-form-mb">
                  <div className="form-group"><label>Net Monthly Income (₹)</label><input type="number" value={income} onChange={e => setIncome(+e.target.value)} /></div>
                  <div className="form-group"><label>Existing EMI (₹)</label><input type="number" value={existingEmi} onChange={e => setExistingEmi(+e.target.value)} /></div>
                  <div className="form-group"><label>Rate of Interest (%)</label><input type="number" step="0.1" value={eliRate} onChange={e => setEliRate(+e.target.value)} /></div>
                  <div className="form-group"><label>Tenure (years)</label><input type="number" value={eliTenure} onChange={e => setEliTenure(+e.target.value)} /></div>
                </div>
              </div>
              <div className="result-box text-center">
                <p className="label">You could borrow up to</p>
                <p className="eli-borrow">{formatCurrency(eliData.loanAmount)}</p>
                <p className="label">Total Payable</p>
                <p className="sub-value">{formatCurrency(eliData.payable)}</p>
                <br />
                <p className="label">Monthly EMI</p>
                <p className="eli-emi">{formatCurrency(eliData.maxEmi)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AREA CONVERTER MODAL */}
      {activeModal === 'area' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 className="modal-heading">Area Converter</h2>
            <p className="text-gray" style={null}>Convert between area units easily</p>
            <div className="form-row">
              <div className="form-group"><label>From</label>
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}>
                  {Object.keys(areaUnits).map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group"><label>To</label>
                <select value={toUnit} onChange={e => setToUnit(e.target.value)}>
                  {Object.keys(areaUnits).map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Value</label><input type="number" value={areaVal} onChange={e => setAreaVal(+e.target.value)} /></div>
            <div className="result-box">
              <p className="label">Result</p>
              <p className="value">{calcArea()}</p>
            </div>
            <p className="note">*For informational purposes only</p>
          </div>
        </div>
      )}
    </div>
  );
}
