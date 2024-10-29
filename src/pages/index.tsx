import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from 'next/router';
import { invoke } from '@tauri-apps/api/tauri';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await invoke('login_user', { payload: formData });
      alert(response);
      router.push('/ventas'); // Redirigir a la página principal
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-200 to-gray-400">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="bg-white p-4 flex items-center justify-center rounded-t-lg shadow-md">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
        </div>
        
        {/* Form */}
        <div className="p-8">
          <h2 className="text-center text-xl font-semibold mb-4">Iniciar Sesión</h2>
          <hr className="mb-6" />
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input 
                type="text" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo Electrónico" 
                className="w-full p-3 border rounded-full placeholder-gray-500 text-gray-700 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="mb-4">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña" 
                className="w-full p-3 border rounded-full placeholder-gray-500 text-gray-700 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex justify-between items-center mt-6">
              {/* Link to Register */}
              <Link href="/register" className="text-sm text-gray-700 underline">Registrarse
              </Link>
              <button 
                type="submit" 
                className="px-6 py-2 text-white bg-gray-700 rounded-full hover:bg-gray-800"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;