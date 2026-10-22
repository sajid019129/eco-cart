import React, { useState } from 'react';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232d6a4f'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20,88 C20,68 32,58 50,58 C68,58 80,68 80,88 Z' fill='%23ffffff'/></svg>";

const AccountInfoModal = ({ user, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!user) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const userFullName = user.name || user.username || 'Valued User';

  // Strict check to determine if the user is truly registered as a seller
  const hasActiveSellerAccounts = user.sellerAccounts && Object.values(user.sellerAccounts).some(val => {
    if (!val) return false;
    if (typeof val === 'object') {
      return Object.values(val).some(subVal => Boolean(subVal && String(subVal).trim() !== ''));
    }
    return String(val).trim() !== '';
  });

  const isSellerUser = Boolean(user.isSeller && hasActiveSellerAccounts);

  const getFormattedDob = () => {
    if (user.dob) return user.dob;
    if (user.dateOfBirth) return user.dateOfBirth;
    if (user.birthDate) return user.birthDate;
    if (user.dobDay && user.dobMonth && user.dobYear) {
      return `${user.dobDay}/${user.dobMonth}/${user.dobYear}`;
    }
    return 'N/A';
  };

  return (
    <>
      <style>{`
        .account-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
          animation: ${isClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.25s ease-out'};
        }

        .account-card {
          background: #ffffff;
          width: 90%;
          max-width: 580px;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.15);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid #e5e7eb;
          animation: ${isClosing ? 'slideOut 0.25s ease-out forwards' : 'slideIn 0.25s ease-out'};
          box-sizing: border-box;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #1b4332;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0;
          font-family: inherit;
        }

        .account-subtitle {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 2px;
          font-weight: 600;
        }

        .account-close-x {
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

        .account-close-x:hover {
          background: transparent;
          color: #dc2626;
          transform: scale(1.25);
        }

        .account-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          text-align: center;
        }

        .account-avatar-img {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #52b788;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.3);
          margin-bottom: 10px;
        }

        .account-avatar-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1b4332;
          margin: 0;
        }

        .account-avatar-sub {
          font-size: 0.98rem;
          font-weight: 650;
          color: #2d6a4f;
          margin-top: 4px;
        }

        .eligibility-badge {
          background: #e8f5e9;
          color: #1b4332;
          border: 1.5px solid #a3b899;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 750;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 0 2px 6px rgba(45, 106, 79, 0.05);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .account-field-box {
          position: relative;
          background: #f9fafb;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          padding: 12px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .account-field-box:hover {
          border-color: #2d6a4f;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.12);
        }

        .account-field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .account-field-value {
          font-size: 0.98rem;
          font-weight: 700;
          color: #1b4332;
          text-align: right;
        }

        .payout-section-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1b4332;
          margin: 22px 0 12px 0;
          text-align: center;
          width: 100%;
          letter-spacing: 0.3px;
        }

        .provider-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #d1d5db;
          padding: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }

        .account-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .btn-close-acc {
          width: 100%;
          background: transparent;
          color: #d32f2f;
          border: 1.5px solid #fca5a5;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }

        .btn-close-acc:hover {
          background-color: #d32f2f;
          color: #ffffff;
          border-color: #d32f2f;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(211, 47, 47, 0.25);
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
      `}</style>

      <div className="account-overlay" onClick={handleClose}>
        <div className="account-card" onClick={(e) => e.stopPropagation()}>
          <div className="account-header">
            <div>
              <h2 className="brand-title">Eco-Cart 🛍️</h2>
              <div className="account-subtitle">Registered Account Information</div>
            </div>
            <button 
              type="button" 
              className="account-close-x" 
              onClick={handleClose}
              title="Close"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="account-avatar-section">
            <img 
              src={user.avatar || DEFAULT_AVATAR} 
              alt="Profile Avatar" 
              className="account-avatar-img" 
            />
            <h3 className="account-avatar-name">{userFullName}</h3>
            <div className="account-avatar-sub">{user.email || 'No email provided'}</div>
          </div>

          <div className="eligibility-badge">
            {isSellerUser 
              ? '✨ Eligible for both buying and selling products ✨' 
              : '✨ Eligible for only buying products ✨'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="account-field-box">
              <span className="account-field-label">👤 Full Name</span>
              <span className="account-field-value">{userFullName}</span>
            </div>

            <div className="account-field-box">
              <span className="account-field-label">✉️ Email Address</span>
              <span className="account-field-value">{user.email || 'N/A'}</span>
            </div>

            <div className="account-field-box">
              <span className="account-field-label">📞 Phone Number</span>
              <span className="account-field-value">{user.phone || 'N/A'}</span>
            </div>

            <div className="account-field-box">
              <span className="account-field-label">📅 Date of Birth</span>
              <span className="account-field-value">{getFormattedDob()}</span>
            </div>

            <div className="account-field-box">
              <span className="account-field-label">🎂 Age</span>
              <span className="account-field-value">{user.age ? `${user.age} years` : 'N/A'}</span>
            </div>

            <div className="account-field-box">
              <span className="account-field-label">🛡️ Account Role</span>
              <span className="account-field-value">{isSellerUser ? 'Buyer & Seller' : 'Buyer'}</span>
            </div>
          </div>

          {/* Seller Payout Accounts Displayed ONLY if user is a registered seller with active accounts */}
          {isSellerUser && user.sellerAccounts && (
            <>
              <div className="payout-section-title">
                💸 Payout & Cash-Out Accounts 💸
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {user.sellerAccounts.bKash && String(user.sellerAccounts.bKash).trim() !== '' && (
                  <div className="account-field-box">
                    <span className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/bKash.jpg" alt="bKash" className="provider-logo-img" /> bKash Account
                    </span>
                    <span className="account-field-value">{user.sellerAccounts.bKash}</span>
                  </div>
                )}
                {user.sellerAccounts.nagad && String(user.sellerAccounts.nagad).trim() !== '' && (
                  <div className="account-field-box">
                    <span className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/Nagad.jpg" alt="Nagad" className="provider-logo-img" /> Nagad Account
                    </span>
                    <span className="account-field-value">{user.sellerAccounts.nagad}</span>
                  </div>
                )}
                {user.sellerAccounts.upay && String(user.sellerAccounts.upay).trim() !== '' && (
                  <div className="account-field-box">
                    <span className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/Upay.jpg" alt="Upay" className="provider-logo-img" /> Upay Account
                    </span>
                    <span className="account-field-value">{user.sellerAccounts.upay}</span>
                  </div>
                )}
                {user.sellerAccounts.masterCard && String(user.sellerAccounts.masterCard).trim() !== '' && (
                  <div className="account-field-box">
                    <span className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/MasterCard.png" alt="MasterCard" className="provider-logo-img" /> MasterCard
                    </span>
                    <span className="account-field-value">{user.sellerAccounts.masterCard}</span>
                  </div>
                )}
                {user.sellerAccounts.bank && (user.sellerAccounts.bank.bankName || user.sellerAccounts.bank.accountNumber) && (
                  <div className="account-field-box">
                    <span className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src="/Bank.png" alt="Bank" className="provider-logo-img" /> {user.sellerAccounts.bank.bankName || 'Bank'}
                    </span>
                    <span className="account-field-value">{user.sellerAccounts.bank.accountNumber || 'N/A'}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="account-actions">
            <button type="button" className="btn-close-acc" onClick={handleClose}>
              Close Account Information
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountInfoModal;