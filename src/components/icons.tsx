/**
 * SVG Icons for competitors and currencies
 */

import React from 'react';

export const BankIcon: React.FC = () => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_24_7655)">
      <path 
        d="M2.5874 9.66222C2.5874 9.66222 2.5874 9.66222 2.58897 9.65637C4.0175 4.32502 9.50114 1.15882 14.8328 2.58742C20.17 4.01754 23.336 9.5014 21.9075 14.8328C21.9059 14.8386 21.9059 14.8386 21.9059 14.8386C20.4773 20.1702 14.9936 23.3361 9.65635 21.906C4.32474 20.4774 1.1588 14.9938 2.5874 9.66222Z" 
        fill="url(#paint0_radial_24_7655)"
      />
    </g>
    <defs>
      <radialGradient 
        id="paint0_radial_24_7655" 
        cx="0" 
        cy="0" 
        r="1" 
        gradientUnits="userSpaceOnUse" 
        gradientTransform="translate(16.5059 19.7451) rotate(-117.444) scale(18.5589 18.5589)"
      >
        <stop stopColor="#F59314"/>
        <stop offset="0.557323" stopColor="#E54C1D"/>
        <stop offset="0.796911" stopColor="#CF3921"/>
        <stop offset="1" stopColor="#85271B"/>
      </radialGradient>
      <clipPath id="clip0_24_7655">
        <rect width="20" height="20" fill="white" transform="translate(5.17638) rotate(15)"/>
      </clipPath>
    </defs>
  </svg>
);

export const PayPalIcon: React.FC = () => (
  <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20.2574 6.70833C20.2574 10.3208 16.9833 14.5833 11.9687 14.5833H7.21458L6.98333 16.0896L5.875 23.3333H0L3.53125 0H13.0625C16.2708 0 18.7917 1.83333 19.7292 4.38542C20.0035 5.12604 20.1345 5.91458 20.2574 6.70833Z" 
      fill="#002991"
    />
    <path 
      d="M23.5 13.4167C23.1875 15.375 22.1875 17.1562 20.7292 18.4375C19.2708 19.7187 17.375 20.4167 15.4375 20.4167H12.1458L10.7917 29.1667H4.9375L5.875 23.3333L6.98333 16.0896L7.21458 14.5833H11.9687C16.9792 14.5833 20.2574 10.3208 20.2574 6.70833C22.5625 7.98958 23.9375 10.5833 23.5 13.4167Z" 
      fill="#008CFF"
    />
  </svg>
);

// Alternative simplified icons in case the above don't work
export const SimpleBankIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

export const SimplePayPalIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

// US Flag Icon
export const USFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12" width="36" height="24" className="rounded-sm">
    <path fill="#B22234" d="M0 0h20v12H0z"/>
    <path fill="#fff" d="M0 1h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0zm0 2h20v1H0z"/>
    <path fill="#3C3B6E" d="M0 0h10v6H0z"/>
    <path fill="#fff" d="M.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 4.5l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 3.3l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM3.6 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM5.2 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6.8 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM8.4 2.1l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM1.2 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM2.8 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM4.4 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4zM7.6 0.9l.5-.3.5.3-.2-.6.5-.4-.6-.1-.2-.6-.2.6-.6.1.5.4z"/>
  </svg>
);
