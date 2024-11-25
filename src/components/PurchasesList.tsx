import React, { useState } from 'react';

interface ProductoResumen {
  nombre: string;
  precio: number;
}

interface CompraResumen {
  id: number;
  proveedor: string;
  fecha: string;
  productos: ProductoResumen[];
  total: number;
  observacion?: string;
}

interface PurchasesListProps {
  compras: CompraResumen[];
  loading: boolean;
  fetchCompraDetalle: (id: number) => void;
}

const PurchasesList: React.FC<PurchasesListProps> = ({ compras, loading, fetchCompraDetalle }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 6;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = compras.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < Math.ceil(compras.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (compras.length === 0) {
    return <p>No hay compras registradas.</p>;
  }

  return (
    <div>
      <div className="overflow-hidden border rounded-md">
        <table className="w-full text-left">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Proveedor</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Productos</th>
              <th className="p-4">Total</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((compra) => (
              <tr key={compra.id} className="border-b">
                <td className="p-4">{compra.id}</td>
                <td className="p-4">{compra.proveedor}</td>
                <td className="p-4">{compra.fecha}</td>
                <td className="p-4">
                  {(compra.productos || []).map((producto, index) => (
                    <div key={index}>
                      {producto.nombre} - ${producto.precio.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td className="p-4">${(compra.total || 0).toFixed(2)}</td>
                <td className="p-4">
                  <button
                    onClick={() => fetchCompraDetalle(compra.id)}
                    className="text-blue-500 hover:underline"
                  >
                    Ver Detalles
                  </button>
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
          disabled={currentPage >= Math.ceil(compras.length / itemsPerPage)}
          className={`px-4 py-2 ${currentPage >= Math.ceil(compras.length / itemsPerPage) ? 'text-gray-400' : 'text-black'} bg-gray-200 rounded-md`}
        >
          Siguiente &gt;
        </button>
      </div>
    </div>
  );
};

export default PurchasesList;