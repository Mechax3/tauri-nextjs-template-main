import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

interface MovimientoInventario {
  id_movimiento: number;
  tipo_movimiento: string;
  cantidad: number;
  fecha_movimiento: string;
  nombre_producto: string;
}

const AlmacenView: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 8;
  const [filter, setFilter] = useState({ type: '', order: '' });

  useEffect(() => {
    fetch('http://localhost:8080/movimientos_inventario')
      .then(response => response.json())
      .then(data => setMovimientos(data))
      .catch(error => console.error('Error fetching movimientos:', error));
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const filteredMovimientos = movimientos
    .sort((a, b) => {
      if (filter.type === 'fecha') {
        return filter.order === 'asc'
          ? new Date(a.fecha_movimiento).getTime() - new Date(b.fecha_movimiento).getTime()
          : new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime();
      } else if (filter.type === 'tipo') {
        return filter.order === 'asc'
          ? a.tipo_movimiento.localeCompare(b.tipo_movimiento)
          : b.tipo_movimiento.localeCompare(a.tipo_movimiento);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMovimientos.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredMovimientos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4">Almacén</h1>
        <div className="flex mb-4">
          <select name="type" value={filter.type} onChange={handleFilterChange} className="border px-4 py-2 mr-2">
            <option value="">Filtrar por</option>
            <option value="fecha">Fecha</option>
            <option value="tipo">Tipo de Movimiento</option>
          </select>
          <select name="order" value={filter.order} onChange={handleFilterChange} className="border px-4 py-2">
            <option value="">Orden</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="p-4 text-left">Movimiento</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Productos</th>
                <th className="p-4 text-left">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(movimiento => (
                <tr key={movimiento.id_movimiento} className="border-b">
                  <td className="p-4">{movimiento.id_movimiento}</td>
                  <td className="p-4">{movimiento.tipo_movimiento}</td>
                  <td className="p-4">{movimiento.fecha_movimiento}</td>
                  <td className="p-4">{movimiento.nombre_producto}</td>
                  <td className="p-4">{movimiento.cantidad}</td>
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
            disabled={currentPage >= Math.ceil(filteredMovimientos.length / itemsPerPage)}
            className={`px-4 py-2 ${currentPage >= Math.ceil(filteredMovimientos.length / itemsPerPage) ? 'text-gray-400' : 'text-black'} bg-gray-200 rounded-md`}
          >
            Siguiente &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlmacenView;