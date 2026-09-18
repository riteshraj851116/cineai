import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext();

export const CITIES_LIST = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Noida',
  'Gurugram',
  'Patna',
];

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('cineai_city') || 'Mumbai';
  });

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cineai_city', selectedCity);
  }, [selectedCity]);

  const changeCity = (city) => {
    setSelectedCity(city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        changeCity,
        isCityModalOpen,
        setIsCityModalOpen,
        citiesList: CITIES_LIST,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
