import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  cantidad: number; // Añadido para la cantidad disponible
}

interface SearchSelectProps {
  onSelect: (producto: Producto) => void;
}

const SearchSelect: React.FC<SearchSelectProps> = ({ onSelect }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:8080/productos');
        if (!response.ok) {
          throw new Error('Error al obtener los productos');
        }
        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Formateo de opciones para el componente Select
  const options = productos.map(producto => ({
    value: producto.id_producto,
    label: producto.nombre_producto,
  }));

  const handleChange = (selectedOption: { value: number; label: string } | null) => {
    setSelectedOption(selectedOption);
    const selectedProducto = productos.find(producto => producto.id_producto === selectedOption?.value);
    if (selectedProducto) {
      onSelect(selectedProducto);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <Select
          options={options}
          value={selectedOption}
          onChange={handleChange}
          placeholder="Buscar producto"
          className="border px-4 py-2 w-full mb-2"
        />
      )}
    </div>
  );
};

export default SearchSelect;