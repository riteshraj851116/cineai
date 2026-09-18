import React from 'react';

export const PriceSummary = ({
  ticketsTotal,
  convenienceFee,
  discount,
  total,
}) => {
  return (
    <div className="cinema-price-breakdown">
      <div className="price-row">
        <span>TICKETS</span>
        <span>₹{ticketsTotal.toLocaleString()}</span>
      </div>

      <div className="price-row">
        <span>CONVENIENCE FEE</span>
        <span>₹{convenienceFee.toLocaleString()}</span>
      </div>

      {discount > 0 && (
        <div className="price-row discount">
          <span>DISCOUNT</span>
          <span>-₹{discount.toLocaleString()}</span>
        </div>
      )}

      <div className="price-divider" />

      <div className="price-total-row">
        <span className="price-total-label">TOTAL</span>
        <span className="price-total-val">₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
};
