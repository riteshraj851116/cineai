import React from 'react';
import { ArrowRight } from 'lucide-react';

export const BookingActions = ({
  onCancel,
  onContinue,
  continueDisabled,
  continueLabel = 'CONTINUE',
}) => {
  return (
    <div className="cinema-action-buttons">
      <button onClick={onCancel} type="button" className="btn-cinema-cancel">
        CANCEL
      </button>

      <button
        onClick={onContinue}
        disabled={continueDisabled}
        type="button"
        className="btn-cinema-continue"
      >
        <span>{continueLabel}</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
};
