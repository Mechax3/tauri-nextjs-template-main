import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchSelect from '../components/SearchSelect';
import SalesList from '../components/SalesList';

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

interface ProductoDetalle {
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface VentaDetalle {
  cliente: String;
  fecha: String;
  productos: ProductoDetalle[];
  total: number;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  cantidad: number; // Añadido para la cantidad disponible
}

const Ventas: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<VentaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [ventaDetalle, setVentaDetalle] = useState<VentaDetalle | null>(null);
  const [newVenta, setNewVenta] = useState({
    cliente: '',
    productos: [{ id_producto: 0, nombre_producto: '', precio_unitario: 0, cantidad: 0, cantidad_disponible: 0 }],
    descuento: 0,
    total: 0,
  });
  const [filter, setFilter] = useState({ type: '', order: '' });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const fetchVentaDetalle = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/ventas/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la venta");
      }
      const data: VentaDetalle = await response.json();
      setVentaDetalle(data);
      openModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const productos = [...newVenta.productos];
    const parsedValue = parseFloat(value);
    if (name === 'cantidad') {
      if (parsedValue < 0 || parsedValue > productos[index].cantidad_disponible) {
        return;
      }
    }
    productos[index] = { ...productos[index], [name]: parsedValue };
    setNewVenta({ ...newVenta, productos });
    calculateTotal(productos, newVenta.descuento);
  };

  const handleProductoSelect = (producto: Producto, index: number) => {
    const productos = [...newVenta.productos];
    productos[index] = { 
      ...productos[index], 
      id_producto: producto.id_producto, 
      nombre_producto: producto.nombre_producto, 
      precio_unitario: producto.precio,
      cantidad_disponible: producto.cantidad // Guardar la cantidad disponible
    };
    setNewVenta({ ...newVenta, productos });
    calculateTotal(productos, newVenta.descuento);
  };

  const handleAddProducto = () => {
    setNewVenta({
      ...newVenta,
      productos: [...newVenta.productos, { id_producto: 0, nombre_producto: '', precio_unitario: 0, cantidad: 0, cantidad_disponible: 0 }],
    });
  };

  const handleRemoveProducto = (index: number) => {
    const productos = [...newVenta.productos];
    productos.splice(index, 1);
    setNewVenta({ ...newVenta, productos });
    calculateTotal(productos, newVenta.descuento);
  };

  const handleDescuentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let descuento = parseFloat(e.target.value);
    if (descuento < 0) {
      descuento = 0;
    } else if (descuento > 50) {
      descuento = 50;
    }
    setNewVenta({ ...newVenta, descuento });
    calculateTotal(newVenta.productos, descuento);
  };

  const calculateTotal = (productos: typeof newVenta.productos, descuento: number) => {
    const subtotal = productos.reduce((acc, producto) => acc + producto.precio_unitario * producto.cantidad, 0);
    const total = subtotal - (subtotal * (descuento / 100));
    setNewVenta(prevState => ({ ...prevState, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVenta),
      });
      if (!response.ok) {
        throw new Error('Error al crear la venta');
      }
      const data = await response.json();
      setVentas([...ventas, data]); // Añadir la nueva venta a la lista de ventas
      closeCreateModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const applyFilters = () => {
    let filtered = [...ventas];
    if (filter.type === 'fecha') {
      filtered.sort((a, b) => filter.order === 'asc' ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime() : new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else if (filter.type === 'precio') {
      filtered.sort((a, b) => filter.order === 'asc' ? a.total - b.total : b.total - a.total);
    }
    setFilteredVentas(filtered);
  };

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await fetch("http://localhost:8080/ventas");
        if (!response.ok) {
          throw new Error("Error al obtener las ventas");
        }
        const data: VentaResumen[] = await response.json();
        setVentas(data);
        setFilteredVentas(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, ventas]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4">Historial de Ventas</h1>
        <button onClick={openCreateModal} className="bg-black text-white px-4 py-2 mb-4">
          Nueva Venta
        </button>
        <div className="flex mb-4">
          <select name="type" value={filter.type} onChange={handleFilterChange} className="border px-4 py-2 mr-2">
            <option value="">Filtrar por</option>
            <option value="fecha">Fecha</option>
            <option value="precio">Precio</option>
          </select>
          <select name="order" value={filter.order} onChange={handleFilterChange} className="border px-4 py-2">
            <option value="">Orden</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <SalesList ventas={filteredVentas} loading={loading} fetchVentaDetalle={fetchVentaDetalle} />
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Nueva Venta</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Cliente</label>
                  <input
                    type="text"
                    value={newVenta.cliente}
                    onChange={(e) => setNewVenta({ ...newVenta, cliente: e.target.value })}
                    className="border px-4 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Productos</label>
                  {newVenta.productos.map((producto, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <SearchSelect onSelect={(producto) => handleProductoSelect(producto, index)} />
                      <input
                        type="number"
                        name="cantidad"
                        placeholder="Cantidad"
                        value={producto.cantidad}
                        onChange={(e) => handleInputChange(e, index)}
                        className="border px-4 py-2 w-24 ml-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProducto(index)}
                        className="text-red-500 ml-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddProducto}
                    className="bg-black text-white px-4 py-2 mt-2"
                  >
                    Añadir producto
                  </button>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium">Descuento (%)</label>
                  <input
                    type="number"
                    value={newVenta.descuento}
                    onChange={handleDescuentoChange}
                    className="border px-4 py-2 w-full"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold">Total: ${newVenta.total.toFixed(2)}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={closeCreateModal} className="text-gray-500 px-4 py-2">Cancelar</button>
                  <button type="submit" className="bg-black text-white px-4 py-2 ml-2">Guardar Venta</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isModalOpen && ventaDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Detalles de Venta</h2>
              <p><strong>Cliente:</strong> {ventaDetalle.cliente}</p>
              <p><strong>Fecha:</strong> {ventaDetalle.fecha}</p>
              <p><strong>Productos:</strong></p>
              <ul className="list-disc list-inside">
                {ventaDetalle.productos.map((producto, index) => (
                  <li key={index}>{producto.nombre} - {producto.cantidad} x ${producto.precio_unitario}</li>
                ))}
              </ul>
              <p className="mt-2"><strong>Total:</strong> ${ventaDetalle.total.toFixed(2)}</p>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={closeModal} className="text-gray-500 px-4 py-2">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ventas;