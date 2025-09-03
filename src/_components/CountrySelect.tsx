/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Image from "next/image";
import Select, { SingleValue } from "react-select";

interface CountryOption {
  value: string;
  label: string;
}

interface CountrySelectProps {
  value?: string; // agora opcional
  onChange: (value: string) => void;
  options?: CountryOption[]; // agora opcional
  error?: string;
  placeholder?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange: handleChange,
  options = [], // default para array vazio
  error,
  placeholder = "Select country",
}) => {
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: error ? "red" : state.isFocused ? "#18181b" : "#ccc",
      borderRadius: "0.25rem",
      boxShadow: "none",
      minHeight: "38px",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: error ? "red" : "#18181b",
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#18181b"
        : state.isFocused
        ? "#f4f4f5"
        : "white",
      color: state.isSelected ? "white" : "#18181b",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#18181b",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      fontSize: "0.875rem",
      color: "#000000",
      marginLeft: "-1px",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#71717a",
      "&:hover": { color: "#18181b" },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const formatOptionLabel = (option: CountryOption) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {option.value && (
        <Image
          src={`https://flagcdn.com/24x18/${option.value.toLowerCase()}.png`}
          alt={option.label}
          width={24}
          height={18}
          style={{ borderRadius: "2px" }}
        />
      )}
      <span>{option.label}</span>
    </div>
  );

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div>
      <Select
        value={selectedOption}
        onChange={(selectedOption: SingleValue<CountryOption>) => {
          handleChange(selectedOption?.value || "");
        }}
        options={options}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isClearable
      />
      {error && (
        <span style={{ color: "red", fontSize: "0.75rem" }}>{error}</span>
      )}
    </div>
  );
};

export default CountrySelect;
