import React from 'react';

export const BookingProgress = ({ step, onStepChange }) => {
  return (
    <div className="cinema-progress-bar">
      {/* Step 01 */}
      <div
        className={`cinema-progress-step ${step === 'seats' || step === 'food' ? 'active' : ''}`}
        onClick={() => onStepChange && onStepChange('seats')}
      >
        <span className="step-num">01</span>
        <span className="step-label">CHOOSE YOUR SEATS</span>
      </div>

      {/* Step 02 */}
      <div
        className={`cinema-progress-step ${step === 'payment' ? 'active' : ''}`}
        onClick={() => onStepChange && onStepChange('payment')}
      >
        <span className="step-num">02</span>
        <span className="step-label">PAYMENT</span>
      </div>

      {/* Step 03 */}
      <div
        className={`cinema-progress-step ${step === 'ticket' ? 'active' : ''}`}
      >
        <span className="step-num">03</span>
        <span className="step-label">TICKET</span>
      </div>
    </div>
  );
};
