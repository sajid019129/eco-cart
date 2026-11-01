import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OfferPopup = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);

      // Automatically close the popup after 3.1 seconds with smooth exit animation
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 3100);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleImageClick = () => {
    handleClose();
    navigate('/products');
  };

  return (
    <>
      <style>{`
        .offer-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 5000;
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
        }

        .offer-modal-overlay.visible {
          opacity: 1;
        }

        @keyframes snappyPulse {
          0% {
            transform: scale(1) translateY(0);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
          }
          50% {
            transform: scale(1.05) translateY(-10px);
            box-shadow: 0 55px 110px rgba(0, 0, 0, 0.8), 0 0 50px rgba(82, 183, 136, 0.9);
          }
          100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
          }
        }

        .offer-modal-card {
          background: #ffffff;
          width: 92%;
          max-width: 900px;
          position: relative;
          transform: scale(0.9) translateY(10px);
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 18px;

          /* Sharp sawtooth / zigzag coupon border along all 4 sides */
          clip-path: polygon(
            /* Top Edge Sawteeth */
            0px 0px, 15px 10px, 30px 0px, 45px 10px, 60px 0px, 75px 10px, 90px 0px, 105px 10px, 120px 0px, 135px 10px, 150px 0px, 165px 10px, 180px 0px, 195px 10px, 210px 0px, 225px 10px, 240px 0px, 255px 10px, 270px 0px, 285px 10px, 300px 0px, 315px 10px, 330px 0px, 345px 10px, 360px 0px, 375px 10px, 390px 0px, 405px 10px, 420px 0px, 435px 10px, 450px 0px, 465px 10px, 480px 0px, 495px 10px, 510px 0px, 525px 10px, 540px 0px, 555px 10px, 570px 0px, 585px 10px, 600px 0px, 615px 10px, 630px 0px, 645px 10px, 660px 0px, 675px 10px, 690px 0px, 705px 10px, 720px 0px, 735px 10px, 750px 0px, 765px 10px, 780px 0px, 795px 10px, 810px 0px, 825px 10px, 840px 0px, 855px 10px, 870px 0px, 885px 10px, 100% 0px,
            
            /* Right Edge Sawteeth */
            calc(100% - 10px) 15px, 100% 30px, calc(100% - 10px) 45px, 100% 60px, calc(100% - 10px) 75px, 100% 90px, calc(100% - 10px) 105px, 100% 120px, calc(100% - 10px) 135px, 100% 150px, calc(100% - 10px) 165px, 100% 180px, calc(100% - 10px) 195px, 100% 210px, calc(100% - 10px) 225px, 100% 240px, calc(100% - 10px) 255px, 100% 270px, calc(100% - 10px) 285px, 100% 300px, calc(100% - 10px) 315px, 100% 330px, calc(100% - 10px) 345px, 100% 360px, calc(100% - 10px) 375px, 100% 390px, calc(100% - 10px) 405px, 100% 420px, calc(100% - 10px) 435px, 100% 450px, calc(100% - 10px) 465px, 100% 480px, calc(100% - 10px) 495px, 100% 510px, 100% 100%,
            
            /* Bottom Edge Sawteeth */
            calc(100% - 15px) calc(100% - 10px), calc(100% - 30px) 100%, calc(100% - 45px) calc(100% - 10px), calc(100% - 60px) 100%, calc(100% - 75px) calc(100% - 10px), calc(100% - 90px) 100%, calc(100% - 105px) calc(100% - 10px), calc(100% - 120px) 100%, calc(100% - 135px) calc(100% - 10px), calc(100% - 150px) 100%, calc(100% - 165px) calc(100% - 10px), calc(100% - 180px) 100%, calc(100% - 195px) calc(100% - 10px), calc(100% - 210px) 100%, calc(100% - 225px) calc(100% - 10px), calc(100% - 240px) 100%, calc(100% - 255px) calc(100% - 10px), calc(100% - 270px) 100%, calc(100% - 285px) calc(100% - 10px), calc(100% - 300px) 100%, calc(100% - 315px) calc(100% - 10px), calc(100% - 330px) 100%, calc(100% - 345px) calc(100% - 10px), calc(100% - 360px) 100%, calc(100% - 375px) calc(100% - 10px), calc(100% - 390px) 100%, calc(100% - 405px) calc(100% - 10px), calc(100% - 420px) 100%, calc(100% - 435px) calc(100% - 10px), calc(100% - 450px) 100%, calc(100% - 465px) calc(100% - 10px), calc(100% - 480px) 100%, calc(100% - 495px) calc(100% - 10px), calc(100% - 510px) 100%, calc(100% - 525px) calc(100% - 10px), calc(100% - 540px) 100%, calc(100% - 555px) calc(100% - 10px), calc(100% - 570px) 100%, calc(100% - 585px) calc(100% - 10px), calc(100% - 600px) 100%, calc(100% - 615px) calc(100% - 10px), calc(100% - 630px) 100%, calc(100% - 645px) calc(100% - 10px), calc(100% - 660px) 100%, calc(100% - 675px) calc(100% - 10px), calc(100% - 690px) 100%, calc(100% - 705px) calc(100% - 10px), calc(100% - 720px) 100%, calc(100% - 735px) calc(100% - 10px), calc(100% - 750px) 100%, calc(100% - 765px) calc(100% - 10px), calc(100% - 780px) 100%, calc(100% - 795px) calc(100% - 10px), calc(100% - 810px) 100%, calc(100% - 825px) calc(100% - 10px), calc(100% - 840px) 100%, calc(100% - 855px) calc(100% - 10px), calc(100% - 870px) 100%, calc(100% - 885px) calc(100% - 10px), 0px 100%,
            
            /* Left Edge Sawteeth */
            10px calc(100% - 15px), 0px calc(100% - 30px), 10px calc(100% - 45px), 0px calc(100% - 60px), 10px calc(100% - 75px), 0px calc(100% - 90px), 10px calc(100% - 105px), 0px calc(100% - 120px), 10px calc(100% - 135px), 0px calc(100% - 150px), 10px calc(100% - 165px), 0px calc(100% - 180px), 10px calc(100% - 195px), 0px calc(100% - 210px), 10px calc(100% - 225px), 0px calc(100% - 240px), 10px calc(100% - 255px), 0px calc(100% - 270px), 10px calc(100% - 285px), 0px calc(100% - 300px), 10px calc(100% - 315px), 0px calc(100% - 330px), 10px calc(100% - 345px), 0px calc(100% - 360px), 10px calc(100% - 375px), 0px calc(100% - 390px), 10px calc(100% - 405px), 0px calc(100% - 420px), 10px calc(100% - 435px), 0px calc(100% - 450px), 10px calc(100% - 465px), 0px calc(100% - 480px), 10px calc(100% - 495px), 0px calc(100% - 510px)
          );
        }

        .offer-modal-overlay.visible .offer-modal-card {
          transform: scale(1) translateY(0);
          animation: snappyPulse 0.7s ease-in-out infinite;
        }

        .offer-banner-img {
          width: 100%;
          height: auto;
          display: block;
          max-height: 520px;
          object-oid: contain;
          background: #ffffff;
        }
      `}</style>

      <div className={`offer-modal-overlay ${isAnimating ? 'visible' : ''}`} onClick={handleClose}>
        <div className="offer-modal-card" onClick={handleImageClick}>
          <img 
            src="/Eco-Cart Offer.png" 
            alt="Eco-Cart Special Offer Up to 50% Off" 
            className="offer-banner-img" 
          />
        </div>
      </div>
    </>
  );
};

export default OfferPopup;