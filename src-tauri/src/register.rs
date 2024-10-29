use tauri::command;
use mysql::*;
use mysql::prelude::*;
use serde::Deserialize;
use bcrypt::{hash, DEFAULT_COST};
use regex::Regex;

#[derive(Deserialize)]
pub struct RegisterPayload {
  pub cargo: String,
  pub nombre: String,
  pub email: String,
  pub password: String,
}

#[command]
pub async fn register_user(payload: RegisterPayload) -> Result<String, String> {
  // Validar el formato del correo electrónico
  let email_regex = Regex::new(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").unwrap();
  if !email_regex.is_match(&payload.email) {
    return Err("Correo electrónico no válido".into());
  }

  // Validar que la contraseña tenga al menos ocho caracteres
  if payload.password.len() < 8 {
    return Err("La contraseña debe tener al menos ocho caracteres".into());
  }

  // Validar que el nombre tenga al menos cinco caracteres
  if payload.nombre.len() < 5 {
    return Err("El nombre debe tener al menos cinco caracteres".into());
  }

  let url = "mysql://root@localhost:3306/ferreteria";
  let pool = Pool::new(url).map_err(|e| e.to_string())?;
  let mut conn = pool.get_conn().map_err(|e| e.to_string())?;

  // Verificar que no exista un usuario con el mismo correo
  let existing_user: Option<String> = conn.exec_first(
    "SELECT correo FROM Usuarios WHERE correo = :correo",
    params! {
      "correo" => &payload.email,
    },
  ).map_err(|e| e.to_string())?;
  
  if existing_user.is_some() {
    return Err("Ya existe un usuario con este correo electrónico".into());
  }

  // Encriptar la contraseña
  let hashed_password = hash(&payload.password, DEFAULT_COST).map_err(|e| e.to_string())?;

  // Obtener el id_rol basado en el nombre del rol
  let id_rol: i32 = match payload.cargo.as_str() {
    "administrador" => {
      let result: Option<i32> = conn.exec_first("SELECT id_rol FROM Roles WHERE nombre_rol = 'administrador'", ()).map_err(|e| e.to_string())?;
      result.ok_or("Rol 'administrador' no encontrado".to_string())?
    },
    "empleado" => {
      let result: Option<i32> = conn.exec_first("SELECT id_rol FROM Roles WHERE nombre_rol = 'empleado'", ()).map_err(|e| e.to_string())?;
      result.ok_or("Rol 'empleado' no encontrado".to_string())?
    },
    _ => return Err("Cargo no válido".into()),
  };

  conn.exec_drop(
    r"INSERT INTO Usuarios (id_rol, nombre, contrasena, correo) VALUES (:id_rol, :nombre, :contrasena, :correo)",
    params! {
      "id_rol" => id_rol,
      "nombre" => payload.nombre,
      "contrasena" => hashed_password,
      "correo" => payload.email,
    },
  ).map_err(|e| e.to_string())?;

  Ok("Usuario registrado con éxito".into())
}