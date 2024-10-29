import React from 'react';
import Sidebar from '../components/Sidebar';

const Almacen: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4">Almacén</h1>
        <input
          type="text"
          placeholder="Buscar"
          className="border px-4 py-2 mb-4 block w-full"
        />
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
              <tr className="border-b">
                <td className="p-4">6</td>
                <td className="p-4">Venta</td>
                <td className="p-4">2024-10-01 17:10:51</td>
                <td className="p-4">Destornillador Estrella</td>
                <td className="p-4">1</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">7</td>
                <td className="p-4">Compra</td>
                <td className="p-4">2024-10-02 09:15:30</td>
                <td className="p-4">Martillo</td>
                <td className="p-4">5</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">8</td>
                <td className="p-4">Venta</td>
                <td className="p-4">2024-10-03 14:20:45</td>
                <td className="p-4">Taladro Inalámbrico</td>
                <td className="p-4">2</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">9</td>
                <td className="p-4">Compra</td>
                <td className="p-4">2024-10-04 11:30:00</td>
                <td className="p-4">Llave Inglesa</td>
                <td className="p-4">10</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">10</td>
                <td className="p-4">Venta</td>
                <td className="p-4">2024-10-05 16:45:12</td>
                <td className="p-4">Sierra Circular</td>
                <td className="p-4">3</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">11</td>
                <td className="p-4">Compra</td>
                <td className="p-4">2024-10-06 10:20:03</td>
                <td className="p-4">Cinta Métrica</td>
                <td className="p-4">15</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">12</td>
                <td className="p-4">Venta</td>
                <td className="p-4">2024-10-07 09:15:45</td>
                <td className="p-4">Nivel Láser</td>
                <td className="p-4">4</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">13</td>
                <td className="p-4">Compra</td>
                <td className="p-4">2024-10-08 14:30:00</td>
                <td className="p-4">Juego de Destornilladores</td>
                <td className="p-4">20</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">14</td>
                <td className="p-4">Venta</td>
                <td className="p-4">2024-10-09 11:45:12</td>
                <td className="p-4">Pintura</td>
                <td className="p-4">8</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">15</td>
                <td className="p-4">Compra</td>
                <td className="p-4">2024-10-10 16:20:30</td>
                <td className="p-4">Brochas</td>
                <td className="p-4">25</td>
              </tr>
              {/* Agrega más filas según sea necesario */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Almacen;