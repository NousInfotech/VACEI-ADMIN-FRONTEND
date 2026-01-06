import React from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  className?: string;  // will apply only to input now
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = "",
  type = "text",
  className = "",
}) => {
  return (
    <div>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border p-2 text-sm focus:outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
