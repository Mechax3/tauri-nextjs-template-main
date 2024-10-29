import React from 'react';
import Link from "next/link";
import { useRouter } from 'next/router';
import { FaShoppingCart, FaStore, FaWarehouse, FaBox } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Aquí puedes agregar lógica adicional para manejar el cierre de sesión, como limpiar tokens, etc.
    router.push('/');
  };

  return (
    <div className="w-64 bg-black text-white h-screen">
      <div className="flex items-center justify-center h-16 bg-orange-600 text-2xl font-bold">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
      </div>
      <nav className="mt-10 flex flex-col items-center">
        <ul className="w-full">
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaShoppingCart className="mr-2" />
            <Link href="/ventas">Ventas</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaStore className="mr-2" />
            <Link href="/compras">Compras</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaWarehouse className="mr-2" />
            <Link href="/almacen">Almacén</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaBox className="mr-2" />
            <Link href="/productos">Productos</Link>
          </li>
        </ul>
        <div className="w-full p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Salir
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;