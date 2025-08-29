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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className: error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
            }}
            containerClass="w-full"
            inputClass={`w-full h-12 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
            buttonClass={`${error ? 'border-red-500' : 'border-gray-300'} bg-gray-50 hover:bg-gray-100`}
            dropdownClass="rounded-lg border-gray-300 shadow-lg"
            placeholder={placeholder}
            enableSearch={true}
            disableSearchIcon={true}
            preferredCountries={['in', 'us', 'gb']}
            specialLabel=""
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

      </div>
    );
};

export default PhoneInput;
