import React from 'react';

export const CineTabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`cine-tabs-wrap ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const Icon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            className={`cine-tab-btn ${isActive ? 'cine-tab-btn-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {Icon && <Icon size={15} />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CineTabs;
