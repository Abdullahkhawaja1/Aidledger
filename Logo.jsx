import React from 'react';
import { Shield } from 'lucide-react';

const Logo = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: {
      container: 'w-10 h-10',
      icon: 20,
      text: 'text-lg'
    },
    medium: {
      container: 'w-16 h-16',
      icon: 32,
      text: 'text-2xl'
    },
    large: {
      container: 'w-24 h-24',
      icon: 48,
      text: 'text-4xl'
    },
    xlarge: {
      container: 'w-32 h-32',
      icon: 64,
      text: 'text-6xl'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.container} rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 hover:rotate-3`}>
        <Shield className="text-white" size={currentSize.icon} />
      </div>
      <div className={`${currentSize.text} font-bold`}>
        <span className="text-gray-800">Aid</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Ledger</span>
      </div>
    </div>
  );
};

export default Logo;

