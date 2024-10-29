import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Productos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Ejemplo de productos
  const productos = [
    { nombre: 'Destornillador', cantidad: 24, precio: 29.00 },
    { nombre: 'Martillo', cantidad: 15, precio: 45.00 },
    { nombre: 'Taladro', cantidad: 10, precio: 120.00 },
    { nombre: 'Llave Inglesa', cantidad: 30, precio: 25.00 },
    { nombre: 'Sierra', cantidad: 4, precio: 150.00 }, // Menos de 5 en stock
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        {/* Encabezado */}
        <h1 className="text-3xl font-bold mb-4">Productos</h1>
        <button onClick={openModal} className="bg-black text-white px-4 py-2 mb-4">
          Agregar Producto
        </button>
        <input
          type="text"
          placeholder="Buscar"
          className="border px-4 py-2 mb-4 block w-full"
        />
        {/* Tabla de Productos */}
        <div className="overflow-hidden border rounded-md">
          <table className="w-full text-left">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{producto.nombre}</td>
                  <td className={`p-4 ${producto.cantidad < 5 ? 'text-red-500' : ''}`}>{producto.cantidad}</td>
                  <td className="p-4">${producto.precio.toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      className={`mr-2 ${producto.cantidad < 5 ? 'text-red-500' : 'text-blue-500'} hover:underline`}
                    >
                      Editar
                    </button>
                    <button
                      className={`${producto.cantidad < 5 ? 'text-red-500' : 'text-blue-500'} hover:underline`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
              <h2 className="text-2xl font-bold mb-4">Nuevo producto</h2>

              {/* Formulario del modal */}
              <div>
                <label>Identificador</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="ID" className="border px-2 py-1 flex-1" />
                  <input type="text" placeholder="Nombre" className="border px-2 py-1 flex-1" />
                </div>

                <label>Precio</label>
                <div className="flex items-center gap-2 mb-2">
                  <input type="number" placeholder="Costo" className="border px-2 py-1 flex-1" />
                  <label>
                    <input type="checkbox" className="mr-1" /> Neto
                  </label>
                  <label>
                    <input type="checkbox" className="mr-1" /> 20%
                  </label>
                  <input type="text" placeholder="Total" className="border px-2 py-1 flex-1" disabled />
                </div>

                <label>Información</label>
                <div className="mb-2">
                  <textarea placeholder="Descripción" className="border px-2 py-1 w-full mb-2"></textarea>
                </div>

                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Unidad" className="border px-2 py-1 flex-1" />
                  <input type="date" placeholder="Fecha agregado" className="border px-2 py-1 flex-1" />
                  <input type="number" placeholder="Cantidad" className="border px-2 py-1 flex-1 w-full" />
                </div>

                <button className="bg-green-500 text-white px-4 py-2 mt-4">Agregar</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 ml-2">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;