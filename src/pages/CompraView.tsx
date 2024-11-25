import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchSelect from '../components/SearchSelect';
import PurchasesList from '../components/PurchasesList';

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

interface ProductoDetalle {
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CompraDetalle {
  proveedor: string;
  fecha: string;
  productos: ProductoDetalle[];
  total: number;
  observacion?: string;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  cantidad: number;
}

const Compras: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [filteredCompras, setFilteredCompras] = useState<CompraResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [compraDetalle, setCompraDetalle] = useState<CompraDetalle | null>(null);
  const [newCompra, setNewCompra] = useState({
    proveedor: '',
    productos: [{ id_producto: 0, nombre_producto: '', precio_unitario: 0, cantidad: 0, cantidad_disponible: 0 }],
    total: 0,
    observacion: '',
  });
  const [filter, setFilter] = useState({ type: '', order: '' });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      setUserRole(user.role);
    }
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const fetchCompraDetalle = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/compras/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la compra");
      }
      const data: CompraDetalle = await response.json();
      setCompraDetalle(data);
      openModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const productos = [...newCompra.productos];
    const parsedValue = parseFloat(value);
    productos[index] = { ...productos[index], [name]: parsedValue };
    setNewCompra({ ...newCompra, productos });
    calculateTotal(productos);
  };

  const handleProductoSelect = (producto: Producto, index: number) => {
    const productos = [...newCompra.productos];
    productos[index] = { 
      ...productos[index], 
      id_producto: producto.id_producto, 
      nombre_producto: producto.nombre_producto, 
      precio_unitario: producto.precio,
      cantidad_disponible: producto.cantidad
    };
    setNewCompra({ ...newCompra, productos });
    calculateTotal(productos);
  };

  const handleAddProducto = () => {
    setNewCompra({
      ...newCompra,
      productos: [...newCompra.productos, { id_producto: 0, nombre_producto: '', precio_unitario: 0, cantidad: 0, cantidad_disponible: 0 }],
    });
  };

  const handleRemoveProducto = (index: number) => {
    const productos = [...newCompra.productos];
    productos.splice(index, 1);
    setNewCompra({ ...newCompra, productos });
    calculateTotal(productos);
  };

  const calculateTotal = (productos: typeof newCompra.productos) => {
    const total = productos.reduce((acc, producto) => acc + producto.precio_unitario * producto.cantidad, 0);
    setNewCompra(prevState => ({ ...prevState, total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompra),
      });
      if (!response.ok) {
        throw new Error('Error al crear la compra');
      }
      const data = await response.json();
      setCompras([...compras, data]);
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
    let filtered = [...compras];
    if (filter.type === 'fecha') {
      filtered.sort((a, b) => filter.order === 'asc' ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime() : new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } else if (filter.type === 'precio') {
      filtered.sort((a, b) => filter.order === 'asc' ? a.total - b.total : b.total - a.total);
    }
    setFilteredCompras(filtered);
  };

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await fetch("http://localhost:8080/compras");
        if (!response.ok) {
          throw new Error("Error al obtener las compras");
        }
        const data: CompraResumen[] = await response.json();
        setCompras(data);
        setFilteredCompras(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, compras]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-8 flex-1">
        <h1 className="text-3xl font-bold mb-4 text-black -600">Historial de Compras</h1>
        {userRole === 'Administrador' && (
          <button onClick={openCreateModal} className="bg-black text-white px-4 py-2 mb-4 hover:bg-orange-700 transition-colors">
            Nueva Compra
          </button>
        )}
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
        <PurchasesList compras={filteredCompras} loading={loading} fetchCompraDetalle={fetchCompraDetalle} />
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Nueva Compra</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Proveedor</label>
                  <input
                    type="text"
                    value={newCompra.proveedor}
                    onChange={(e) => setNewCompra({ ...newCompra, proveedor: e.target.value })}
                    className="border px-4 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Productos</label>
                  {newCompra.productos.map((producto, index) => (
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
                    className="bg-black text-white px-4 py-2 mb-4 hover:bg-orange-700"
                  >
                    Agregar Producto
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Observación</label>
                  <textarea
                    value={newCompra.observacion}
                    onChange={(e) => setNewCompra({ ...newCompra, observacion: e.target.value })}
                    className="border px-4 py-2 w-full"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="text-gray-500 px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2"
                  >
                    Guardar Compra
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isModalOpen && compraDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-orange-600">Detalles de la Compra</h2>
              <div className="mb-4">
                <p><strong>Proveedor:</strong> {compraDetalle.proveedor}</p>
                <p><strong>Fecha:</strong> {compraDetalle.fecha}</p>
                <p><strong>Observación:</strong> {compraDetalle.observacion}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-orange-600">Productos:</h3>
                <ul>
                  {compraDetalle.productos.map((producto, index) => (
                    <li key={index}>{producto.nombre} - {producto.cantidad} x ${producto.precio_unitario.toFixed(2)}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-lg text-orange-600"><strong>Total:</strong> ${compraDetalle.total.toFixed(2)}</p>
              <div className="text-right mt-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compras;