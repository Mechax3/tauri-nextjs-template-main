import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Venta {
  id_venta: number;
  monto_pago: number;
  fecha_pago: string;
}

const HistorialView: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await fetch('http://localhost:8080/historial');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setVentas(data);
      } catch (error) {
        console.error('Error fetching ventas:', error);
      }
    };

    fetchVentas();
  }, []);

  const filteredVentas = ventas.filter((venta) => {
    const fecha = new Date(venta.fecha_pago);
    return (
      (!startDate || fecha >= startDate) &&
      (!endDate || fecha <= endDate)
    );
  });

  const sortedVentas = filteredVentas.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.monto_pago - b.monto_pago;
    } else {
      return b.monto_pago - a.monto_pago;
    }
  });

  const totalVentas = sortedVentas.reduce((total, venta) => total + venta.monto_pago, 0);

  return (
    <div className="flex h-screen">
      <aside className="h-full w-64 bg-black text-white fixed">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Historial de Ventas</h1>
        <div className="mb-4 flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Ordenar por Monto ({sortOrder === 'asc' ? 'Ascendente' : 'Descendente'})
            </button>
          </div>
        </div>
        <div className="overflow-hidden border rounded-md">
          <table className="w-full text-left">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Monto</th>
              </tr>
            </thead>
            <tbody>
              {sortedVentas.map((venta) => (
                <tr key={venta.id_venta} className="border-b">
                  <td className="p-4">{venta.fecha_pago}</td>
                  <td className="p-4">{venta.monto_pago}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="p-4">Total</td>
                <td className="p-4">{isNaN(totalVentas) ? '0' : totalVentas.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default HistorialView;