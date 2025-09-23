import React from "react";
import PhoneInputComponent from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  label,
  placeholder = "Enter phone number",
}) => {
  // Prevent deleting the dial code
  const handleInputChange = (val: string, country: any) => {
    const dialCode = country.dialCode; // e.g. "91"
    if (!val.startsWith(dialCode)) {
      // If user tries to delete the code, force it back
      onChange(dialCode);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <PhoneInputComponent
          country={"in"}
          value={value}
          onChange={handleInputChange}
          inputProps={{
            name: "phone",
            required: true,
            autoFocus: false,
          }}
          containerClass="w-full"
          placeholder={placeholder}
          enableSearch={true}
          disableSearchIcon={true}
          preferredCountries={["in", "us", "gb"]}
          specialLabel=""
          inputStyle={{
            width: "100%",
            height: "3rem",
            fontSize: "1rem",
            border: `1px solid ${error ? "#ef4444" : "white"}`,
            borderRadius: "0.5rem",
            paddingLeft: "4rem", // leave space for flag button
            outline: "none",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            backgroundColor: "#1D1F27",
            color: "white",
          }}
          buttonStyle={{
            border: "none",
            backgroundColor: "transparent",
            borderRadius: "0.5rem 0 0 0.5rem",
            height: "3rem",
            width: "3.5rem",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dropdownStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #374151",
            backgroundColor: "#2A2D36",
            zIndex: 1000,
          }}
        />

      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
