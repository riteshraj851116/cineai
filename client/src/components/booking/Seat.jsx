import React, { useRef } from 'react';
import gsap from 'gsap';

export const Seat = ({
  seat,
  price,
  isOccupied,
  isLocked,
  isSelected,
  isRecommended,
  onClick,
}) => {
  const seatRef = useRef(null);

  const handleClick = () => {
    if (isOccupied || isLocked) return;

    if (seatRef.current && !isSelected) {
      gsap.fromTo(
        seatRef.current,
        { scale: 1 },
        {
          scale: 1.18,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'power1.out',
        }
      );
    }
    onClick(seat);
  };

  let stateClass = '';
  if (isSelected) stateClass = 'selected';
  else if (isOccupied) stateClass = 'occupied';
  else if (isLocked) stateClass = 'locked';
  else if (isRecommended) stateClass = 'ai-recommended';

  const statusText = isOccupied
    ? 'Occupied'
    : isLocked
    ? 'Temporarily Held'
    : isSelected
    ? 'Selected'
    : 'Available';

  const ariaLabel = `Row ${seat.row} Seat ${seat.number}, ${seat.category || 'Standard'}, ₹${price || 250}, ${statusText}`;

  return (
    <div
      ref={seatRef}
      onClick={handleClick}
      className={`cinema-seat-node ${stateClass}`}
      title={`${seat.seatId} (${seat.category} - ₹${price}) • ${statusText}`}
      aria-label={ariaLabel}
      role="button"
      tabIndex={isOccupied || isLocked ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isRecommended && !isSelected && (
        <span className="ai-pick-tag">AI PICK</span>
      )}
    </div>
  );
};
