import React, { useState } from 'react';

interface ProductoResumen {
  nombre: string;
  precio: number;
}

interface VentaResumen {
  id: number;
  cliente: string;
  fecha: string;
  productos: ProductoResumen[];
  total: number;
}

interface SalesListProps {
  ventas: VentaResumen[];
  loading: boolean;
  fetchVentaDetalle: (id: number) => void;
}

const SalesList: React.FC<SalesListProps> = ({ ventas, loading, fetchVentaDetalle }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 8;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ventas.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(ventas.length / itemsPerPage)) {
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
      <div className="overflow-hidden border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Productos</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Cargando ventas...</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((venta, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{venta.cliente}</td>
                  <td className="p-4">{venta.fecha}</td>
                  <td className="p-4">
                    {venta.productos && venta.productos.slice(0, 2).map((producto, i) => (
                      <span key={i}>{producto.nombre}{i < venta.productos.slice(0, 2).length - 1 ? ', ' : ''}</span>
                    ))}
                    {venta.productos && venta.productos.length > 2 && '...'}
                  </td>
                  <td className="p-4">${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
                  <td className="p-4 text-blue-500 cursor-pointer" onClick={() => fetchVentaDetalle(venta.id)}>Ver detalles</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center">No se encontraron ventas.</td>
              </tr>
            )}
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
          disabled={currentPage >= Math.ceil(ventas.length / itemsPerPage)}
          className={`px-4 py-2 ${currentPage >= Math.ceil(ventas.length / itemsPerPage) ? 'text-gray-400' : 'text-black'} bg-gray-200 rounded-md`}
        >
          Siguiente &gt;
        </button>
      </div>
    </div>
  );
};

export default SalesList;