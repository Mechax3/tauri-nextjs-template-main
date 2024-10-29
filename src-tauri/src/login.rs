use tauri::command;
use mysql::*;
use mysql::prelude::*;
use serde::Deserialize;
use bcrypt::verify;

#[derive(Deserialize)]
pub struct LoginPayload {
  pub email: String,
  pub password: String,
}

#[command]
pub async fn login_user(payload: LoginPayload) -> Result<String, String> {
  let url = "mysql://root@localhost:3306/ferreteria";
  let pool = Pool::new(url).map_err(|e| e.to_string())?;
  let mut conn = pool.get_conn().map_err(|e| e.to_string())?;

  // Verificar si el usuario existe y obtener la contraseña encriptada
  let result: Option<(String,)> = conn.exec_first(
    "SELECT contrasena FROM Usuarios WHERE correo = :correo",
    params! {
      "correo" => &payload.email,
    },
  ).map_err(|e| e.to_string())?;

  if let Some((hashed_password,)) = result {
    // Verificar la contraseña
    if verify(&payload.password, &hashed_password).map_err(|e| e.to_string())? {
      return Ok("Inicio de sesión exitoso".into());
    } else {
      return Err("Contraseña incorrecta".into());
    }
  } else {
    return Err("Correo electrónico no encontrado".into());
  }
}