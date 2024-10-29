import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Ventas: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4">Historial de Ventas</h1>
        <button onClick={openModal} className="bg-black text-white px-4 py-2 mb-4">
          Nueva Venta
        </button>
        <input
          type="text"
          placeholder="Buscar"
          className="border px-4 py-2 mb-4 block w-full"
        />
        <div className="border rounded-md overflow-hidden">
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
              {/* Ejemplo de datos */}
              <tr className="border-b">
                <td className="p-4">ClienteX</td>
                <td className="p-4">2024-09-26 19:02:28</td>
                <td className="p-4">Destornillador, Sierra Profesional 2040w</td>
                <td className="p-4">$899.00</td>
                <td className="p-4 text-blue-500">Ver detalles</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">ClienteY</td>
                <td className="p-4">2024-09-27 14:15:00</td>
                <td className="p-4">Martillo, Taladro</td>
                <td className="p-4">$450.00</td>
                <td className="p-4 text-blue-500">Ver detalles</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">ClienteZ</td>
                <td className="p-4">2024-09-28 10:30:45</td>
                <td className="p-4">Llave Inglesa, Destornillador</td>
                <td className="p-4">$300.00</td>
                <td className="p-4 text-blue-500">Ver detalles</td>
              </tr>
              {/* Agrega más filas según sea necesario */}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Nueva Venta</h2>
              
              {/* Formulario del modal */}
              <div>
                <label>Producto</label>
                <input type="text" placeholder="Buscar producto" className="border px-2 py-1 w-full mb-2" />
                <label>Cantidad</label>
                <input type="number" defaultValue="0" className="border px-2 py-1 w-full mb-2" />
                <button className="bg-orange-500 text-white px-4 py-2 mb-4">Agregar</button>

                <table className="w-full border mb-4">
                  <thead>
                    <tr>
                      <th className="p-2 border">Producto</th>
                      <th className="p-2 border">Precio</th>
                      <th className="p-2 border">Descuento %</th>
                      <th className="p-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Ejemplo de productos en la lista */}
                    <tr>
                      <td className="p-2 border">Candado</td>
                      <td className="p-2 border">$20</td>
                      <td className="p-2 border">0</td>
                      <td className="p-2 border">$20</td>
                    </tr>
                    {/* Agrega más filas según sea necesario */}
                  </tbody>
                </table>

                <label>Observación</label>
                <textarea placeholder="Descripción" className="border px-2 py-1 w-full mb-4"></textarea>

                <div className="flex items-center justify-between">
                  <div>
                    <label>
                      <input type="radio" name="discount" value="15" /> 15%
                    </label>
                    <label className="ml-2">
                      <input type="radio" name="discount" value="20" /> 20%
                    </label>
                  </div>
                  <div>Total: $<input type="text" readOnly className="border px-2 py-1 ml-2" /></div>
                </div>

                <button className="bg-green-500 text-white px-4 py-2 mt-4">Vender</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 ml-2">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ventas;