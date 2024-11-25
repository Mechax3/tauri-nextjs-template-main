import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio: number;
  cantidad: number;
  unidad: string;
  descripcion: string;
}

interface Filter {
  type: string;
  order: string;
}

const Productos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<Filter>({ type: '', order: '' });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Estados para los campos del formulario del modal
  const [nombreProducto, setNombreProducto] = useState<string>('');
  const [precio, setPrecio] = useState<number>(0);
  const [descripcion, setDescripcion] = useState<string>('');
  const [unidad, setUnidad] = useState<string>('u');
  const [cantidad, setCantidad] = useState<number>(0);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      setUserRole(user.role);
    }
  }, []);

  const fetchProductos = () => {
    fetch('http://localhost:8080/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(error => console.error('Error fetching products:', error));
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNombreProducto('');
    setPrecio(0);
    setDescripcion('');
    setUnidad('u');
    setCantidad(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleAddProduct = () => {
    const newProduct = {
      nombre_producto: nombreProducto,
      precio,
      cantidad,
      unidad,
      descripcion,
    };

    fetch('http://localhost:8080/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al agregar el producto');
        }
        return response.json();
      })
      .then((productoActualizado) => {
        setProductos([...productos, productoActualizado]);
        closeModal(); // Cerrar el modal
      })
      .catch(error => console.error('Error adding product:', error));
  };

  const handleEditProduct = (producto: Producto) => {
    setEditingProduct(producto);
    setNombreProducto(producto.nombre_producto);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion);
    setUnidad(producto.unidad);
    setCantidad(producto.cantidad);
    openModal();
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedProduct = {
      id_producto: editingProduct.id_producto,
      nombre_producto: nombreProducto,
      precio,
      cantidad,
      unidad,
      descripcion,
    };

    fetch(`http://localhost:8080/productos/${editingProduct.id_producto}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al actualizar el producto');
        }
        return response.json();
      })
      .then((productoActualizado) => {
        setProductos(productos.map(p => (p.id_producto === productoActualizado.id_producto ? productoActualizado : p)));
        closeModal(); // Cerrar el modal
      })
      .catch(error => console.error('Error updating product:', error));
  };

  const handleDeleteProduct = (id: number) => {
    fetch(`http://localhost:8080/productos/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al eliminar el producto');
        }
        setProductos(productos.filter(p => p.id_producto !== id));
      })
      .catch(error => console.error('Error deleting product:', error));
  };

  const filteredProductos = productos
    .filter(producto =>
      producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filter.type === 'precio') {
        return filter.order === 'asc' ? a.precio - b.precio : b.precio - a.precio;
      } else if (filter.type === 'cantidad') {
        return filter.order === 'asc' ? a.cantidad - b.cantidad : b.cantidad - a.cantidad;
      }
      return 0;
    });

  return (
    <div className="flex h-screen">
      <aside className="h-full w-64 bg-black text-white fixed">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Productos</h1>
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border px-4 py-2 mr-2 flex-1"
          />
          <select name="type" value={filter.type} onChange={handleFilterChange} className="border px-4 py-2 mr-2">
            <option value="">Filtrar por</option>
            <option value="precio">Precio</option>
            <option value="cantidad">Cantidad</option>
          </select>
          <select name="order" value={filter.order} onChange={handleFilterChange} className="border px-4 py-2">
            <option value="">Orden</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        {userRole === 'Administrador' && (
          <button onClick={openModal} className="bg-black text-white px-4 py-2 mb-4">
            Agregar Producto
          </button>
        )}
        <div className="overflow-hidden border rounded-md">
          <table className="w-full text-left">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Descripción</th>
                {userRole === 'Administrador' && <th className="p-4">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProductos.map((producto) => (
                <tr key={producto.id_producto} className="border-b">
                  <td className="p-4">{producto.nombre_producto}</td>
                  <td className="p-4">{producto.precio}</td>
                  <td className="p-4">
                    {producto.cantidad}
                    {producto.cantidad < 10 && (
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 ml-2" />
                    )}
                  </td>
                  <td className="p-4">{producto.unidad}</td>
                  <td className="p-4">{producto.descripcion}</td>
                  {userRole === 'Administrador' && (
                    <td className="p-4">
                      <button onClick={() => handleEditProduct(producto)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteProduct(producto.id_producto)} className="bg-red-500 text-white px-2 py-1 rounded">
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
              <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    className="border px-2 py-1 flex-1"
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                  />
                </div>
                <label>Precio</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Costo"
                    className="border px-2 py-1 flex-1"
                    value={precio}
                    onChange={(e) => setPrecio(parseFloat(e.target.value))}
                  />
                </div>
                <label>Información</label>
                <div className="mb-2">
                  <textarea
                    placeholder="Descripción"
                    className="border px-2 py-1 w-full mb-2"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-2 mb-4">
                  <select
                    className="border px-2 py-1 flex-1"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                  >
                    <option value="u">Unidad</option>
                    <option value="in">Pulgada</option>
                    <option value="ft">Pie</option>
                    <option value="m">Metro</option>
                    <option value="L">Litro</option>
                    <option value="mL">Mililitro</option>
                    <option value="kg">Kilogramo</option>
                    <option value="g">Gramo</option>
                    <option value="t">Tonelada</option>
                    <option value="pqt">Paquete</option>
                    <option value="caja">Caja</option>
                    <option value="saco">Saco</option>
                    <option value="gal">Galón</option>
                    <option value="m2">Metro cuadrado</option>
                    <option value="rollo">Rollo</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    className="border px-2 py-1 flex-1 w-full"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseFloat(e.target.value))}
                  />
                </div>
                <button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="bg-black text-white px-4 py-2">
                  {editingProduct ? 'Actualizar' : 'Agregar'}
                </button>
                <button onClick={closeModal} className="text-gray-500 px-4 py-2">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Productos;