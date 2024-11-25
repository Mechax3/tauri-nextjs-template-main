import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
}

const AdminView: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/usuarios/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }
      setUsuarios(usuarios.filter(usuario => usuario.id_usuario !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="h-full w-64 bg-black text-white fixed">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Administración de Usuarios</h1>
        <div className="overflow-hidden border rounded-md">
          <table className="w-full text-left">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario} className="border-b">
                  <td className="p-4">{usuario.nombre}</td>
                  <td className="p-4">{usuario.correo}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(usuario.id_usuario)}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminView;