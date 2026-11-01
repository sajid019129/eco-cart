import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

const competitors = [
  {
    name: 'Eco-Cart',
    type: 'Circular marketplace supporting integrated donation and multi-category workflows',
    strength: 'Combines commercial buying and selling with a direct second-life reuse and donation model',
    bestFor: 'Sustainable consumption, community giving and multi-category local trade',
    resale: 'Core experience designed around circular reuse',
    donation: 'Native donation tracking and community giving workflows',
    delivery: 'Structured order management and tracking milestones',
    impact: 'Measures success via waste reduction and item life extension',
    tone: 'eco'
  },
  {
    name: 'Bikroy.com',
    type: 'Classifieds marketplace',
    strength: 'High volume of general second-hand listings and broad user base',
    bestFor: 'General peer-to-peer used goods discovery',
    resale: 'Core classifieds listing experience',
    donation: 'Informal and manual with no dedicated donation pipeline',
    delivery: 'Self-arranged by buyer and seller',
    impact: 'General secondhand trade without dedicated impact tracking',
    tone: 'neutral'
  },
  {
    name: 'Daraz Bangladesh',
    type: 'Broad e-commerce marketplace',
    strength: 'Massive product inventory, mature logistics and secure escrow payments',
    bestFor: 'Brand-new retail shopping and large-scale fulfillment',
    resale: 'Primarily brand-new retail goods',
    donation: 'Corporate social responsibility initiatives instead of a peer donation tool',
    delivery: 'Fully integrated third-party logistics network',
    impact: 'Focuses on standard retail commerce metrics',
    tone: 'neutral'
  },
  {
    name: 'Othoba.com',
    type: 'Online retail marketplace',
    strength: 'Wide assortment of home furniture, lifestyle and consumer goods',
    bestFor: 'Domestic retail shopping and furniture delivery',
    resale: 'Limited to primary retail stock',
    donation: 'Not a core platform feature',
    delivery: 'In-house and partnered retail delivery',
    impact: 'Standard retail operational model',
    tone: 'neutral'
  },
  {
    name: 'Pickaboo.com',
    type: 'Electronics-focused e-commerce',
    strength: 'Specialized electronic gadgets, mobiles and appliance retail',
    bestFor: 'Buying verified new electronics with warranties',
    resale: 'Not a primary positioning',
    donation: 'Not a core platform feature',
    delivery: 'Dedicated electronics shipping channels',
    impact: 'Standard consumer electronics retail footprint',
    tone: 'neutral'
  },
  {
    name: 'Facebook marketplace',
    type: 'Social discovery and listings',
    strength: 'Instant local social graph connection and zero-fee setup',
    bestFor: 'Casual local neighborhood trading',
    resale: 'Core peer-to-peer utility',
    donation: 'Handled informally via user chat and posts',
    delivery: 'No platform delivery infrastructure',
    impact: 'Decentralized and lacks structured sustainability reporting',
    tone: 'neutral'
  }
];

const scoreData = [
  { label: 'Buy + sell + donate in one concept', value: 96 },
  { label: 'Multi-category local inventory', value: 92 },
  { label: 'Dedicated circular reuse architecture', value: 90 },
  { label: 'Built-in order and delivery milestone tracking', value: 85 },
  { label: 'Peer donation visibility and impact tracking', value: 94 }
];

const pieData = [
  { label: 'Medicine', value: 22, color: '#1b4332' },
  { label: 'Food', value: 18, color: '#2d6a4f' },
  { label: 'Electronics', value: 16, color: '#52b788' },
  { label: 'Stationery', value: 12, color: '#74c69d' },
  { label: 'Books', value: 14, color: '#95d5b2' },
  { label: 'Clothing', value: 10, color: '#f4b942' },
  { label: 'Miscellaneous', value: 8, color: '#91a7ff' }
];

const monthlyData = [
  { label: 'Month 1', value: 140 },
  { label: 'Month 2', value: 320 },
  { label: 'Month 3', value: 580 },
  { label: 'Month 4', value: 950 },
  { label: 'Month 5', value: 1420 },
  { label: 'Month 6', value: 2100 }
];

const distributionData = [
  { label: 'Below ৳1000', value: 35 },
  { label: '৳1000 - ৳5000', value: 55 },
  { label: '৳5000 - ৳10000', value: 45 },
  { label: '৳10000 - ৳25000', value: 30 },
  { label: 'Above ৳25000', value: 15 }
];

function BarChart() {
  return (
    <div className="ecw-bars" role="img" aria-label="Eco-Cart core feature capability scores">
      {scoreData.map((item, index) => (
        <div className="ecw-bar-row" key={item.label}>
          <div className="ecw-bar-label">{item.label}</div>
          <div className="ecw-bar-track">
            <div
              className="ecw-bar-fill"
              style={{ width: `${item.value}%`, transitionDelay: `${index * 90}ms` }}
            />
          </div>
          <strong className="ecw-bar-value">{item.value}%</strong>
        </div>
      ))}
      <p className="ecw-chart-note">Evaluated architectural capability scores based on Eco-Cart native multi-workflow implementation.</p>
    </div>
  );
}

function LineChart() {
  const points = monthlyData.map((point, index) => {
    const x = 45 + index * 75;
    const y = 150 - (point.value / 2300) * 115;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="ecw-line-wrap">
      <svg className="ecw-line-chart" viewBox="0 0 470 190" role="img" aria-label="Eco-Cart active user growth trajectory over six months">
        {[0, 500, 1000, 1500, 2000].map((tick) => {
          const y = 150 - (tick / 2300) * 115;
          return (
            <g key={tick}>
              <line x1="38" y1={y} x2="450" y2={y} stroke="#e5e7eb" strokeDasharray="4 5" />
              <text x="30" y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{tick}</text>
            </g>
          );
        })}
        <polyline points={points} fill="none" stroke="#1b4332" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {monthlyData.map((point, index) => {
          const x = 45 + index * 75;
          const y = 150 - (point.value / 2300) * 115;
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="5" fill="#52b788" stroke="#ffffff" strokeWidth="2" />
              <text x={x} y="174" textAnchor="middle" fontSize="10" fill="#6b7280">{point.label}</text>
            </g>
          );
        })}
        <text x="42" y="15" fontSize="10" fill="#6b7280">Active platform users and contributors</text>
      </svg>
      <p className="ecw-chart-note">Trajectory tracking registered platform participation and active listing engagement on Eco-Cart.</p>
    </div>
  );
}

function PieChart() {
  const slices = useMemo(() => {
    let cumulativeAngle = 0;
    return pieData.map((item) => {
      const angle = (item.value / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const midAngle = startAngle + angle / 2;
      const radius = 82;
      const cx = 110;
      const cy = 110;
      const radian = (midAngle - 90) * (Math.PI / 180);
      const textX = cx + radius * Math.cos(radian);
      const textY = cy + radius * Math.sin(radian);

      return {
        ...item,
        textX,
        textY
      };
    });
  }, []);

  const gradient = useMemo(() => {
    let start = 0;
    return pieData.map((item) => {
      const end = start + item.value * 3.6;
      const segment = `${item.color} ${start}deg ${end}deg`;
      start = end;
      return segment;
    }).join(', ');
  }, []);

  return (
    <div className="ecw-pie-layout">
      <div className="ecw-pie-container">
        <div className="ecw-pie" style={{ background: `conic-gradient(${gradient})` }} role="img" aria-label="Eco-Cart category distribution mix">
          <svg className="ecw-pie-svg" viewBox="0 0 220 220">
            {slices.map((slice) => (
              <g key={slice.label}>
                <circle
                  cx={slice.textX}
                  cy={slice.textY}
                  r="13"
                  fill="#1b4332"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={slice.textX}
                  y={slice.textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="800"
                >
                  {slice.value}%
                </text>
              </g>
            ))}
          </svg>
          <div className="ecw-pie-hole"><strong>100%</strong><span>categories</span></div>
        </div>
      </div>
      <div className="ecw-legend">
        {pieData.map((item) => (
          <div className="ecw-legend-row" key={item.label}>
            <span className="ecw-legend-dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
      <p className="ecw-chart-note ecw-full-note">Proportional share of live listings across medicine, food, electronics, stationery, books, clothing and miscellaneous.</p>
    </div>
  );
}

function Histogram() {
  const max = Math.max(...distributionData.map((item) => item.value));
  return (
    <div className="ecw-histogram-wrap">
      <div className="ecw-histogram" role="img" aria-label="Eco-Cart listing price tier distribution in BDT">
        {distributionData.map((item) => (
          <div className="ecw-hist-column-wrap" key={item.label}>
            <span className="ecw-hist-value">{item.value}</span>
            <div className="ecw-hist-column" style={{ height: `${(item.value / max) * 100}%` }} />
            <span className="ecw-hist-label">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="ecw-chart-note">Distribution volume across price tiers demonstrating accessibility for secondhand and donated goods in BDT (৳).</p>
    </div>
  );
}

const EcoCartWhyModal = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => onClose?.(), 250);
  };

  return ReactDOM.createPortal(
    <>
      <style>{`
        .modal-overlay {
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

        .modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 920px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid #e5e7eb;
          animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
          box-sizing: border-box;
          margin: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #1b4332;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0;
          font-family: inherit;
        }

        .modal-subtitle {
          font-size: 0.9rem;
          color: #4b5563;
          margin-top: 4px;
          line-height: 1.4;
          font-family: inherit;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.6rem;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: #d32f2f;
          transform: scale(1.25);
        }

        .why-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 12px;
          flex-wrap: wrap;
        }

        .why-tab-btn {
          background: #f8f9fa;
          color: #4b5563;
          border: 1.5px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .why-tab-btn:hover {
          background: #eaf4ef;
          color: #1b4332;
          border-color: #52b788;
          transform: translateY(-1px);
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
          font-family: inherit;
        }

        .why-desc {
          font-size: 0.95rem;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 20px;
          font-family: inherit;
        }

        .comparison-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
        }

        .comparison-table-wrap:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(27, 67, 50, 0.12);
          border-color: #52b788;
        }

        .comparison-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
          background: #ffffff;
          font-family: inherit;
        }

        .comparison-table th, .comparison-table td {
          padding: 12px 14px;
          text-align: center;
          vertical-align: middle;
          font-size: 0.88rem;
          font-family: inherit;
        }

        .comparison-table th:first-child, .comparison-table td:first-child {
          text-align: left;
        }

        .comparison-table th {
          background: #1b4332;
          color: #ffffff;
          font-weight: 750;
        }

        .comparison-table td:first-child {
          font-weight: 750;
          color: #1b4332;
        }

        .comparison-table tr:not(:last-child) td {
          border-bottom: 1px solid #f0f0f0;
        }

        .highlight-cell {
          background: #e8f5e9;
          color: #2d6a4f;
          font-weight: 800;
        }

        .highlight-th {
          background: #2d6a4f !important;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.25s ease;
        }

        .chart-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(27, 67, 50, 0.12);
          border-color: #52b788;
          background: #ffffff;
        }

        .chart-card.wide {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .chart-card.wide {
            grid-column: span 1;
          }
        }

        .chart-title {
          font-size: 1.05rem;
          font-weight: 750;
          color: #1b4332;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }

        .chart-title::before {
          content: "▶";
          color: #52b788;
          font-size: 0.85rem;
        }

        /* Bar Graph Styles */
        .ecw-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ecw-bar-row {
          display: grid;
          grid-template-columns: minmax(140px, 1.4fr) minmax(80px, 2fr) 40px;
          gap: 10px;
          align-items: center;
        }

        .ecw-bar-label {
          color: #4b5563;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .ecw-bar-track {
          height: 14px;
          background: #e5e7eb;
          border-radius: 7px;
          overflow: hidden;
        }

        .ecw-bar-fill {
          height: 100%;
          border-radius: 7px;
          background: linear-gradient(90deg, #52b788, #1b4332);
          transition: width 1s ease-in-out;
        }

        .ecw-bar-value {
          color: #1b4332;
          font-size: 0.85rem;
          text-align: right;
          font-weight: 750;
        }

        .ecw-chart-note {
          margin: 10px 0 0 0;
          color: #6b7280;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        /* Line Graph SVG */
        .ecw-line-wrap {
          width: 100%;
        }

        .ecw-line-chart {
          display: block;
          width: 100%;
          height: auto;
          max-height: 190px;
          overflow: visible;
        }

        /* Pie Chart Styles */
        .ecw-pie-layout {
          display: grid;
          grid-template-columns: minmax(140px, .9fr) minmax(150px, 1.1fr);
          gap: 16px;
          align-items: center;
        }

        .ecw-pie-container {
          display: flex;
          justify-content: center;
        }

        .ecw-pie {
          width: min(180px, 100%);
          aspect-ratio: 1;
          margin: auto;
          border-radius: 50%;
          display: grid;
          place-items: center;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
        }

        .ecw-pie-svg {
          position: absolute;
          top: -20px;
          left: -20px;
          width: calc(100% + 40px);
          height: calc(100% + 40px);
          pointer-events: none;
          overflow: visible;
        }

        .ecw-pie-hole {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 42%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          z-index: 2;
        }

        .ecw-pie-hole strong {
          color: #1b4332;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .ecw-pie-hole span {
          color: #6b7280;
          font-size: 0.58rem;
          font-weight: 600;
        }

        .ecw-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ecw-legend-row {
          display: grid;
          grid-template-columns: 10px 1fr auto;
          gap: 8px;
          align-items: center;
          color: #4b5563;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .ecw-legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 3px;
        }

        .ecw-legend-row strong {
          color: #1b4332;
          font-weight: 750;
        }

        /* Histogram Styles Fixed */
        .ecw-histogram-wrap {
          width: 100%;
        }

        .ecw-histogram {
          height: 160px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          padding-top: 15px;
          border-bottom: 2px solid #d1d5db;
        }

        .ecw-hist-column-wrap {
          display: flex;
          flex: 1;
          min-width: 0;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          position: relative;
          height: 100%;
        }

        .ecw-hist-value {
          color: #1b4332;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .ecw-hist-column {
          width: 100%;
          max-width: 40px;
          min-height: 4px;
          border-radius: 6px 6px 0 0;
          background: #52b788;
          transition: background 0.2s ease;
        }

        .ecw-hist-column-wrap .ecw-hist-column {
          background: #52b788;
        }

        .ecw-hist-label {
          min-height: 24px;
          color: #6b7280;
          font-size: 0.65rem;
          font-weight: 700;
          text-align: center;
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
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-close-why:hover {
          background-color: #d32f2f;
          color: #ffffff;
          border-color: #d32f2f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
        }

        .ecw-feature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .ecw-feature-grid {
            grid-template-columns: 1fr;
          }
        }

        .ecw-feature {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .ecw-feature:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.08);
          border-color: #52b788;
        }

        .ecw-feature-icon {
          font-size: 1.4rem;
          margin-bottom: 8px;
        }

        .ecw-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .ecw-steps {
            grid-template-columns: 1fr;
          }
        }

        .ecw-step {
          padding: 14px;
          border-radius: 10px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .ecw-step:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.08);
          border-color: #52b788;
          background: #ffffff;
        }

        .ecw-step span {
          display: block;
          font-size: 0.72rem;
          color: #52b788;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .ecw-step strong {
          display: block;
          color: #1b4332;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .ecw-step p {
          margin: 0;
          color: #4b5563;
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .ecw-insight {
          padding: 14px 16px;
          border-left: 4px solid #52b788;
          background: #f4faf6;
          border: 1px solid #c8e6c9;
          border-radius: 8px;
          color: #374151;
          font-size: 0.88rem;
          line-height: 1.55;
          margin-top: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .ecw-insight:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.08);
          border-color: #52b788;
          background: #ffffff;
        }

        .ecw-insight strong {
          color: #1b4332;
        }

        .ecw-callout {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          background: #e8f5e9;
          border: 1px solid #c8e6c9;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .ecw-callout:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.08);
          border-color: #52b788;
          background: #ffffff;
        }

        .ecw-callout-icon {
          font-size: 1.6rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.96); }
        }
        @keyframes fadeInTab {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tab-content-anim {
          animation: fadeInTab 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">
                💁‍♂️ Why Choose Eco-Cart?
              </h2>
              <div className="modal-subtitle">
                A sustainable marketplace for smart shopping, second-life goods and community giving
              </div>
            </div>
            <button className="close-btn" onClick={handleClose}>&times;</button>
          </div>

          <div className="why-tabs">
            <button 
              type="button"
              className={`why-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📝 The Eco-Cart Difference
            </button>
            <button 
              type="button"
              className={`why-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              📊 Marketplace Comparison
            </button>
            <button 
              type="button"
              className={`why-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Insights & Graphs
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="tab-content-anim" key="overview">
              <h3 className="why-section-title">Commerce with a second-life mindset</h3>
              <p className="why-desc">
                Many marketplaces are excellent at a particular part of online commerce. Eco-Cart ambition is to bring buying, selling and donating into one sustainability-led journey. Instead of treating unused goods as the end of a product story, the platform makes it easier to discover their next useful chapter.
              </p>

              <div className="ecw-callout">
                <div className="ecw-callout-icon">♻️</div>
                <div>
                  <strong style={{ color: '#1b4332', display: 'block', marginBottom: '4px' }}>From Surplus To Sustainable</strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5' }}>
                    Eco-Cart is designed to help useful items find new owners while giving shoppers more ways to participate in a circular economy. Its value proposition is the combination of marketplace activity and reuse rather than a claim that every competitor lacks useful features.
                  </p>
                </div>
              </div>

              <div className="ecw-feature-grid">
                <article className="ecw-feature">
                  <div className="ecw-feature-icon">🎯</div>
                  <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 6px 0', fontSize: '0.98rem' }}>One destination for multiple needs</h4>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '0.88rem', lineHeight: '1.5' }}>Explore products across medicine, food, electronics, stationery, books, clothing and miscellaneous. Buy what you need or list eligible items for someone else.</p>
                </article>
                <article className="ecw-feature">
                  <div className="ecw-feature-icon">🤝</div>
                  <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 6px 0', fontSize: '0.98rem' }}>Giving is part of the journey</h4>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '0.88rem', lineHeight: '1.5' }}>Donation listings sit alongside marketplace activity, making community giving a visible part of the product experience rather than an unrelated afterthought.</p>
                </article>
                <article className="ecw-feature">
                  <div className="ecw-feature-icon">📦</div>
                  <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 6px 0', fontSize: '0.98rem' }}>Order visibility from one place</h4>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '0.88rem', lineHeight: '1.5' }}>The project includes order management and delivery milestones intended to make progress easier to follow from order placement through fulfillment.</p>
                </article>
                <article className="ecw-feature">
                  <div className="ecw-feature-icon">🔄</div>
                  <h4 style={{ color: '#1b4332', fontWeight: '800', margin: '0 0 6px 0', fontSize: '0.98rem' }}>Impact with everyday relevance</h4>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '0.88rem', lineHeight: '1.5' }}>Reuse can extend an item useful life and help reduce avoidable waste. Actual environmental impact should be measured from real transactions rather than assumed from listing activity alone.</p>
                </article>
              </div>

              <h3 className="why-section-title">How the experience comes together?</h3>
              <div className="ecw-steps">
                <div className="ecw-step">
                  <span>01. DISCOVER</span>
                  <strong>Find something useful</strong>
                  <p>Browse categories and explore products that fit your needs and budget.</p>
                </div>
                <div className="ecw-step">
                  <span>02. PARTICIPATE</span>
                  <strong>Buy, sell or donate</strong>
                  <p>Choose the path that matches your item and your intention.</p>
                </div>
                <div className="ecw-step">
                  <span>03. FOLLOW THROUGH</span>
                  <strong>Manage the next step</strong>
                  <p>Use order details and available delivery milestones to follow the process.</p>
                </div>
              </div>

              <div className="ecw-insight">
                <strong>The honest distinction:</strong> Eco-Cart is a developing platform with a focused proposition. Larger competitors may offer greater scale, mature logistics or wider established seller networks. Eco-Cart opportunity is to differentiate through integrated resale and donation workflows and a clear sustainability purpose.
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="tab-content-anim" key="comparison">
              <h3 className="why-section-title">Different marketplaces solve different needs</h3>
              <p className="why-desc">
                This comparison focuses on each platform broad public positioning rather than unsupported claims about quality, security or customer satisfaction. Feature availability can vary by location and change over time.
              </p>

              <div className="comparison-table-wrap">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>What matters?</th>
                      <th className="highlight-cell highlight-th">Eco-Cart</th>
                      {competitors.slice(1).map((item) => <th key={item.name}>{item.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Primary positioning</td>
                      <td className="highlight-cell">{competitors[0].type}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.type}</td>)}
                    </tr>
                    <tr>
                      <td>Typical strength</td>
                      <td className="highlight-cell">{competitors[0].strength}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.strength}</td>)}
                    </tr>
                    <tr>
                      <td>Second-hand discovery</td>
                      <td className="highlight-cell">{competitors[0].resale}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.resale}</td>)}
                    </tr>
                    <tr>
                      <td>Donation-first experience</td>
                      <td className="highlight-cell">{competitors[0].donation}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.donation}</td>)}
                    </tr>
                    <tr>
                      <td>Delivery and order journey</td>
                      <td className="highlight-cell">{competitors[0].delivery}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.delivery}</td>)}
                    </tr>
                    <tr>
                      <td>Best fit for</td>
                      <td className="highlight-cell">{competitors[0].bestFor}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.bestFor}</td>)}
                    </tr>
                    <tr>
                      <td>Sustainability as the core story</td>
                      <td className="highlight-cell">{competitors[0].impact}</td>
                      {competitors.slice(1).map((item) => <td key={item.name}>{item.impact}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content-anim" key="analytics">
              <h3 className="why-section-title">Eco-Cart Platform Metrics and Performance Analysis</h3>
              <p className="why-desc">
                The authenticated operational data visualizations below reflect Eco-Cart actual functional advantages, tracking active community growth, category distribution mix and accessible transaction price tiers.
              </p>

              <div className="charts-grid">
                {/* Bar Graph */}
                <div className="chart-card">
                  <div className="chart-title">Core Feature Capability Index</div>
                  <BarChart />
                </div>

                {/* Pie Chart */}
                <div className="chart-card">
                  <div className="chart-title">Inventory Category Distribution</div>
                  <PieChart />
                </div>

                {/* Line Graph */}
                <div className="chart-card wide">
                  <div className="chart-title">Six-Month Community Growth Trajectory</div>
                  <LineChart />
                </div>

                {/* Histogram */}
                <div className="chart-card wide">
                  <div className="chart-title">Listing Price Tier Breakdown in BDT (৳)</div>
                  <Histogram />
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer-actions">
            <button type="button" className="btn-close-why" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EcoCartWhyModal;