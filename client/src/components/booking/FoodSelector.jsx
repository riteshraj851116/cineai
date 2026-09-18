import React from 'react';
import { Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';

export const FoodSelector = ({
  foodItems,
  cartFood,
  onUpdateQty,
  onBack,
  onProceed,
  foodTotal,
}) => {
  return (
    <div className="cinema-food-viewport">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cinema-accent)', fontWeight: 800, marginBottom: '6px' }}>
            CONCESSIONS & IN-SEAT DINING
          </div>
          <h2 className="cinema-food-heading">
            ADD SOMETHING TO THE EXPERIENCE.
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cinema-text-secondary)' }}>
            Fresh gourmet cinema treats prepared hot and served directly to your reserved seats.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onBack}
            className="btn-cinema-cancel"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>BACK TO SEATS</span>
          </button>

          <button
            onClick={onProceed}
            className="btn-cinema-continue"
          >
            <span>PROCEED TO PAYMENT</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="cinema-food-grid">
        {foodItems.map((food) => {
          const qty = cartFood[food._id]?.quantity || 0;
          return (
            <div key={food._id} className="cinema-food-card">
              <img
                src={food.image || 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=400&q=80'}
                alt={food.name}
                className="food-card-img"
                loading="lazy"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span className="food-card-title">{food.name}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cinema-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '3px' }}>
                  {food.category}
                </span>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--cinema-text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                {food.description}
              </p>

              <div className="food-card-price">
                <span>₹{food.price}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--cinema-border)', borderRadius: '4px', padding: '2px 6px' }}>
                  <button
                    onClick={() => onUpdateQty(food, -1)}
                    style={{ color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: '16px', textAlign: 'center', fontSize: '0.82rem' }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => onUpdateQty(food, 1)}
                    style={{ color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
