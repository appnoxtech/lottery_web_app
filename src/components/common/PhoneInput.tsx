import React from 'react';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, label, placeholder = "Enter phone number" }) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <PhoneInputComponent
            country={'in'}
            value={value}
            onChange={onChange}
            inputProps={{
              name: 'phone',
              required: true,
              autoFocus: false,
              className: error ? 'error' : '',
            }}
            containerClass="w-full"
            placeholder={placeholder}
            enableSearch={true}
            disableSearchIcon={true}
            preferredCountries={['in', 'us', 'gb']}
            specialLabel=""
            inputStyle={{
              width: '100%',
              height: '3rem',
              fontSize: '1rem',
              border: `1px solid ${error ? '#ef4444' : '#374151'}`,
              borderRadius: '0.5rem',
              padding: '0.75rem 0.75rem 0.75rem 3.85rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              backgroundColor: '#1D1F27',
              color: 'white',
            }}
            buttonStyle={{
              border: `1px solid ${error ? '#ef4444' : '#374151'}`,
              backgroundColor: '#2A2D36',
              borderRadius: '0.5rem 0 0 0.5rem',
              borderRight: 'none',
              transition: 'all 0.2s ease-in-out',
              height: '3rem',
              padding: '0 0.5rem',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
            inputClass={error ? 'error' : ''}
            buttonClass={error ? 'error' : ''}
            dropdownStyle={{
              borderRadius: '0.5rem',
              border: '1px solid #374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backgroundColor: '#2A2D36',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
            searchStyle={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #374151',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: '#1D1F27',
              color: 'white',
            }}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
};

export default PhoneInput;
