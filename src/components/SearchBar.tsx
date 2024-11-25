// src/components/SearchBar.tsx
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Buscar"
      value={value}
      onChange={onChange}
      className="border px-4 py-2 mb-4 block w-full"
    />
  );
};

export default SearchBar;