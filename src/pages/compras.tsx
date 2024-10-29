import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Compras: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4">Historial de Compras</h1>
        <button onClick={openModal} className="bg-black text-white px-4 py-2 mb-4">
          Nueva Compra
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
                <th className="p-4 text-left">Proveedor</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Productos</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Observación</th>
                <th className="p-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {/* Ejemplo de datos */}
              <tr className="border-b">
                <td className="p-4">Casa Fernandez</td>
                <td className="p-4">2024-12-06 10:20:03</td>
                <td className="p-4">Pija ½” x ¾”, Focos LED 10w</td>
                <td className="p-4">$540.00</td>
                <td className="p-4">No llegaron los candados</td>
                <td className="p-4 text-blue-500">Ver detalles</td>
              </tr>
              {/* Agrega más filas según sea necesario */}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
              <h2 className="text-2xl font-bold mb-4">Nueva Compra</h2>

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
                      <td className="p-2 border">Pija ½” x ¾”</td>
                      <td className="p-2 border">$5.00</td>
                      <td className="p-2 border">0</td>
                      <td className="p-2 border">$5.00</td>
                    </tr>
                    {/* Agrega más filas según sea necesario */}
                  </tbody>
                </table>

                <label>Observación</label>
                <textarea placeholder="Descripción" className="border px-2 py-1 w-full mb-4"></textarea>

                <div className="flex items-center justify-between">
                  <div>Total: $<input type="text" readOnly className="border px-2 py-1 ml-2" /></div>
                </div>

                <button className="bg-green-500 text-white px-4 py-2 mt-4">Guardar</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 ml-2">Cerrar</button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compras;
