import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  precio: number;
  unidad: string;
  descripcion: string;
}

interface ListPageProps {
  searchTerm: string;
  filter: { type: string; order: string };
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

const ListPage: React.FC<ListPageProps> = ({ searchTerm, filter, onSearchChange, onEdit, onDelete }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 8;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/productos')
      .then(response => response.json())
      .then((data: Producto[]) => setProductos(data))
      .catch((error: unknown) => console.error('Error fetching products:', error));
  }, []);

  const filteredProductos = productos
    .filter(producto =>
      producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filter.type === 'precio') {
        return filter.order === 'asc' ? a.precio - b.precio : b.precio - a.precio;
      } else if (filter.type === 'cantidad') {
        return filter.order === 'asc' ? a.cantidad - b.cantidad : b.cantidad - a.cantidad;
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredProductos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar"
        value={searchTerm}
        onChange={onSearchChange}
        className="border px-4 py-2 mb-4 block w-full"
      />
      <div className="overflow-hidden border rounded-md">
        <table className="w-full text-left">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((producto, index) => (
              <tr key={producto.id_producto} className="border-b">
                <td
                  className="p-4 relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {producto.nombre_producto}
                  {hoveredIndex === index && (
                    <div
                      className="absolute bg-white border p-2 mt-1 shadow-lg z-10"
                      style={{ top: "100%", left: "0", whiteSpace: "nowrap" }}
                    >
                      <p>Unidad: {producto.unidad}</p>
                      <p>Descripción: {producto.descripcion}</p>
                    </div>
                  )}
                </td>
                <td className={`p-4 ${producto.cantidad < 5 ? 'text-red-500' : ''}`}>
                  {producto.cantidad}
                  {producto.cantidad < 5 && (
                    <FontAwesomeIcon icon={faExclamationTriangle} className="ml-2 text-red-500" />
                  )}
                </td>
                <td className="p-4">${producto.precio.toFixed(2)}</td>
                <td className="p-4">
                  <button className="text-blue-500 hover:underline mr-2" onClick={() => onEdit(producto)}>Editar</button>
                  <button className="text-blue-500 hover:underline" onClick={() => onDelete(producto.id_producto)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 ${currentPage === 1 ? 'text-gray-400' : 'text-black'} bg-gray-200 rounded-md`}
        >
          &lt; Anterior
        </button>
        <span>Página {currentPage}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage >= Math.ceil(filteredProductos.length / itemsPerPage)}
          className={`px-4 py-2 ${currentPage >= Math.ceil(filteredProductos.length / itemsPerPage) ? 'text-gray-400' : 'text-black'} bg-gray-200 rounded-md`}
        >
          Siguiente &gt;
        </button>
      </div>
    </div>
  );
};

export default ListPage;