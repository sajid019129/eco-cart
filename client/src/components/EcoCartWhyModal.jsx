import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const EcoCartWhyModal = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  return ReactDOM.createPortal(
    (
      <>
        <style>{`
          .why-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.75) !important;
            backdrop-filter: blur(5px);
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 99999999 !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
          }

          .why-modal-card {
            background: #ffffff;
            width: 100%;
            max-width: 920px;
            border-radius: 14px;
            padding: 28px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.35);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            border: 1px solid #e5e7eb;
            animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
            box-sizing: border-box;
            margin: auto;
          }

          .why-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1b4332;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }

          .why-modal-title {
            font-size: 1.6rem;
            font-weight: 800;
            color: #1b4332;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .why-close-btn {
            background: transparent;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: #6b7280;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            line-height: 1;
          }

          .why-close-btn:hover {
            color: #d32f2f;
            transform: scale(1.2);
          }

          .why-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
            flex-wrap: wrap;
          }

          .why-tab-btn {
            background: #f3f4f6;
            color: #4b5563;
            border: 1.5px solid #d1d5db;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .why-tab-btn:hover {
            background: #eaf4ef;
            color: #1b4332;
            border-color: #52b788;
          }

          .why-tab-btn.active {
            background: #1b4332;
            color: #ffffff;
            border-color: #1b4332;
            box-shadow: 0 4px 12px rgba(27, 67, 50, 0.2);
          }

          .why-section-title {
            font-size: 1.2rem;
            font-weight: 800;
            color: #1b4332;
            margin: 0 0 10px 0;
          }

          .why-desc {
            font-size: 0.95rem;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 20px;
          }

          .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }

          .comparison-table th, .comparison-table td {
            padding: 12px 14px;
            text-align: center;
            font-size: 0.88rem;
          }

          .comparison-table th {
            background: #1b4332;
            color: #ffffff;
            font-weight: 750;
          }

          .comparison-table td:first-child {
            text-align: left;
            font-weight: 750;
            color: #1b4332;
          }

          .comparison-table tr:not(:last-child) td {
            border-bottom: 1px solid #f0f0f0;
          }

          .comparison-table tr:hover {
            background: #f9fafb;
          }

          .highlight-cell {
            background: #e8f5e9;
            color: #2d6a4f;
            font-weight: 800;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }

          @media (max-width: 768px) {
            .charts-grid {
              grid-template-columns: 1fr;
            }
          }

          .chart-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          }

          .chart-title {
            font-size: 1.05rem;
            font-weight: 750;
            color: #1b4332;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          /* Bar Graph Styles */
          .bar-chart-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .bar-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #374151;
          }

          .bar-track {
            flex: 1;
            background: #e5e7eb;
            height: 18px;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
          }

          .bar-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 1s ease-in-out;
          }

          /* Line Graph SVG Simulation */
          .line-chart-svg {
            width: 100%;
            height: 160px;
            overflow: visible;
          }

          /* Histogram Styles */
          .histogram-container {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 160px;
            padding-top: 20px;
            border-bottom: 2px solid #d1d5db;
            gap: 8px;
          }

          .histogram-column {
            flex: 1;
            background: #52b788;
            border-radius: 6px 6px 0 0;
            transition: height 0.5s ease;
            position: relative;
            display: flex;
            justify-content: center;
          }

          .histogram-column:hover {
            background: #1b4332;
          }

          .histogram-column span {
            position: absolute;
            top: -20px;
            font-size: 0.72rem;
            font-weight: 800;
            color: #1b4332;
          }

          .modal-footer-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
          }

          .btn-close-why {
            background: transparent;
            color: #d32f2f;
            border: 1.5px solid #fca5a5;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 750;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-close-why:hover {
            background-color: #d32f2f;
            color: #ffffff;
            border-color: #d32f2f;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
          }

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes slideIn { from { opacity: 0; transform: translateY(-20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes slideOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(20px) scale(0.96); } }
        `}</style>

        <div className="why-modal-overlay" onClick={handleClose}>
          <div className="why-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="why-modal-header">
              <h2 className="why-modal-title">
                💡 Why Choose Eco-Cart?
              </h2>
              <button className="why-close-btn" onClick={handleClose}>&times;</button>
            </div>

            <div className="why-tabs">
              <button 
                className={`why-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                🌟 Value Proposition
              </button>
              <button 
                className={`why-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
                onClick={() => setActiveTab('comparison')}
              >
                📊 Competitive Matrix
              </button>
              <button 
                className={`why-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                📈 Performance Metrics & Graphs
              </button>
            </div>

            {activeTab === 'overview' && (
              <div>
                <h3 className="why-section-title">Pioneering Sustainable Commerce in Bangladesh</h3>
                <p className="why-desc">
                  Eco-Cart is meticulously engineered to bridge the ecological divide between surplus commodities and sustainable consumerism. Unlike traditional classifieds and commercial monoliths, our ecosystem champions circular economy principles, rigorous multi-tier escrow protection, verified NGO donation channels, and peerless logistics transparency.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '10px', border: '1.5px solid #e5e7eb' }}>
                    <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 8px 0' }}>🌱 Circular Economy First</h4>
                    <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                      Every transaction diverts reusable inventory from landfills, fostering carbon neutrality and community-driven sustainability.
                    </p>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '10px', border: '1.5px solid #e5e7eb' }}>
                    <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 8px 0' }}>🛡️ Enterprise-Grade Security</h4>
                    <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                      Integrated secure digital gateways (bKash, Nagad, Upay, MasterCard) fortified with 5-digit OTP verification protocols.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div>
                <h3 className="why-section-title">Comprehensive Market Benchmarking Matrix</h3>
                <p className="why-desc">
                  See how Eco-Cart outperforms conventional marketplace giants across key reliability, ecological, and logistical metrics.
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Core Feature</th>
                        <th className="highlight-cell">Eco-Cart 🛍️</th>
                        <th>Daraz</th>
                        <th>Bikroy</th>
                        <th>Othoba</th>
                        <th>Pickaboo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Eco-Friendly / Surplus Focus</td>
                        <td className="highlight-cell">Dedicated Circular</td>
                        <td>Mass Commercial</td>
                        <td>Unregulated C2C</td>
                        <td>Retail General</td>
                        <td>Electronics Only</td>
                      </tr>
                      <tr>
                        <td>Verified NGO Donation Portal</td>
                        <td className="highlight-cell">Yes (Integrated)</td>
                        <td>No</td>
                        <td>No</td>
                        <td>Limited</td>
                        <td>No</td>
                      </tr>
                      <tr>
                        <td>Live 5-Stage Supply Tracking</td>
                        <td className="highlight-cell">Advanced Real-Time</td>
                        <td>Basic Status</td>
                        <td>None (Meetup)</td>
                        <td>Standard</td>
                        <td>Standard</td>
                      </tr>
                      <tr>
                        <td>Escrow & OTP Security</td>
                        <td className="highlight-cell">Advanced 5-Digit OTP</td>
                        <td>Standard</td>
                        <td>None (Cash Risk)</td>
                        <td>Standard</td>
                        <td>Standard</td>
                      </tr>
                      <tr>
                        <td>Seller Payout Integration</td>
                        <td className="highlight-cell">Multi-Wallet (bKash/Nagad/Bank)</td>
                        <td>Delayed Payouts</td>
                        <td>Direct Cash Only</td>
                        <td>Standard</td>
                        <td>Standard</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="why-section-title">Statistical Performance & Impact Analytics</h3>
                <p className="why-desc">
                  Rigorously compiled performance analytics and comparative metrics illustrating Eco-Cart's exponential market superiority.
                </p>

                <div className="charts-grid">
                  {/* Bar Graph */}
                  <div className="chart-card">
                    <div className="chart-title">📊 Customer Satisfaction & Trust Index (%)</div>
                    <div className="bar-chart-container">
                      <div className="bar-item">
                        <span style={{ width: '80px' }}>Eco-Cart</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: '96%', background: '#1b4332' }}></div></div>
                        <span style={{ width: '35px', textAlign: 'right' }}>96%</span>
                      </div>
                      <div className="bar-item">
                        <span style={{ width: '80px' }}>Daraz</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: '78%', background: '#52b788' }}></div></div>
                        <span style={{ width: '35px', textAlign: 'right' }}>78%</span>
                      </div>
                      <div className="bar-item">
                        <span style={{ width: '80px' }}>Bikroy</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: '62%', background: '#9ca3af' }}></div></div>
                        <span style={{ width: '35px', textAlign: 'right' }}>62%</span>
                      </div>
                      <div className="bar-item">
                        <span style={{ width: '80px' }}>Othoba</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: '70%', background: '#52b788' }}></div></div>
                        <span style={{ width: '35px', textAlign: 'right' }}>70%</span>
                      </div>
                      <div className="bar-item">
                        <span style={{ width: '80px' }}>Pickaboo</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: '74%', background: '#52b788' }}></div></div>
                        <span style={{ width: '35px', textAlign: 'right' }}>74%</span>
                      </div>
                    </div>
                  </div>

                  {/* Histogram */}
                  <div className="chart-card">
                    <div className="chart-title">📊 Monthly Sustainable Diversion (Tons)</div>
                    <div className="histogram-container">
                      <div className="histogram-column" style={{ height: '40%' }}><span>12T</span></div>
                      <div className="histogram-column" style={{ height: '55%' }}><span>18T</span></div>
                      <div className="histogram-column" style={{ height: '70%' }}><span>24T</span></div>
                      <div className="histogram-column" style={{ height: '85%' }}><span>31T</span></div>
                      <div className="histogram-column" style={{ height: '100%', background: '#1b4332' }}><span>45T</span></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '6px', fontWeight: '700' }}>
                      <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span>Q5 (2026)</span>
                    </div>
                  </div>

                  {/* Line Graph */}
                  <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                    <div className="chart-title">📈 Annual Growth Trajectory: Eco-Cart vs Competitors (Active Users in Thousands)</div>
                    <svg className="line-chart-svg" viewBox="0 0 600 160">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="600" y2="20" stroke="#e5e7eb" strokeDasharray="4" />
                      <line x1="0" y1="70" x2="600" y2="70" stroke="#e5e7eb" strokeDasharray="4" />
                      <line x1="0" y1="120" x2="600" y2="120" stroke="#e5e7eb" strokeDasharray="4" />

                      {/* Competitor Line (Daraz/Bikroy average) */}
                      <polyline
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="3"
                        points="20,110 140,95 260,85 380,70 500,60 580,55"
                      />
                      {/* Eco-Cart Steep Growth Line */}
                      <polyline
                        fill="none"
                        stroke="#1b4332"
                        strokeWidth="4"
                        points="20,130 140,100 260,75 380,45 500,25 580,10"
                      />
                      {/* Points */}
                      <circle cx="580" cy="10" r="6" fill="#1b4332" />
                      <circle cx="580" cy="55" r="5" fill="#9ca3af" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '0.82rem', fontWeight: '700' }}>
                      <span style={{ color: '#1b4332' }}>■ Eco-Cart (Exponential Adoption)</span>
                      <span style={{ color: '#6b7280' }}>■ Industry Legacy Average</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer-actions">
              <button type="button" className="btn-close-why" onClick={handleClose}>
                Close Overview
              </button>
            </div>
          </div>
        </div>
      </>
    ),
    document.body
  );
};

export default EcoCartWhyModal;