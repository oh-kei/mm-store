import React, { useState } from 'react';

interface FilterDropdownProps {
  title: string;
  options: string[];
  current: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ title, options, current, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 group"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-maritime-navy transition-colors">{title}:</span>
        <span className="text-sm font-black text-maritime-navy flex items-center gap-1">
          {current}
          <svg className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div 
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl z-50 py-2 transition-all duration-300 transform ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => {
              onChange(opt);
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
              current.toLowerCase() === opt.toLowerCase().replace(' ', '-') || 
              (current === 'All' && opt === 'All') ||
              (current === opt)
                ? 'text-maritime-navy font-black bg-gray-50' 
                : 'text-gray-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
