import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/router';
import { FaShoppingCart, FaStore, FaWarehouse, FaBox, FaHistory, FaUserShield } from 'react-icons/fa';
import Image from 'next/image';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const user = JSON.parse(session);
      setUserRole(user.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    window.location.href = '/';
  };

  return (
    <div className="w-64 bg-black text-white h-screen">
      <div className="flex items-center justify-center h-16 bg-orange-600 text-2xl font-bold">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto object-contain" />
      </div>
      <nav className="mt-10 flex flex-col items-center">
        <ul className="w-full">
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaShoppingCart className="mr-2" />
            <Link href="/VentaView">Ventas</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaStore className="mr-2" />
            <Link href="/CompraView">Compras</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaWarehouse className="mr-2" />
            <Link href="/AlmacenView">Almacén</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaBox className="mr-2" />
            <Link href="/ProductoView">Productos</Link>
          </li>
          <li className="p-4 hover:bg-orange-600 flex items-center">
            <FaHistory className="mr-2" />
            <Link href="/HistorialView">Historial de Pagos</Link>
          </li>
          {userRole === 'Administrador' && (
            <li className="p-4 hover:bg-orange-600 flex items-center">
              <FaUserShield className="mr-2" />
              <Link href="/AdminView">Admin</Link>
            </li>
          )}
        </ul>
        <div className="w-full p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;