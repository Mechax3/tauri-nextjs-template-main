use tauri::command;
use mysql::*;
use mysql::prelude::*;
use serde::{Deserialize, Serialize};
use bcrypt::verify;
use actix_web::{post, web, Responder};

#[derive(Deserialize)]
pub struct LoginPayload {
  pub email: String,
  pub password: String,
}

#[derive(Serialize)]
pub struct UserSession {
  pub email: String,
  pub role: String,
}

// Función para Tauri
#[command]
pub async fn login_user(payload: LoginPayload) -> Result<String, String> {
  match login_user_impl(payload).await {
    Ok(session) => serde_json::to_string(&session).map_err(|e| e.to_string()),
    Err(error) => Err(error),
  }
}

// Función para Actix-web
#[post("/login")]
async fn login_user_actix(payload: web::Json<LoginPayload>) -> impl Responder {
  match login_user_impl(payload.into_inner()).await {
    Ok(session) => web::Json(session),
    Err(error) => web::Json(UserSession {
      email: "".to_string(),
      role: error,
    }),
  }
}

// Lógica compartida
async fn login_user_impl(payload: LoginPayload) -> Result<UserSession, String> {
  let url = "mysql://root@localhost:3306/ferreteria";
  let pool = Pool::new(url).map_err(|e| e.to_string())?;
  let mut conn = pool.get_conn().map_err(|e| e.to_string())?;

  // Verificar si el usuario existe y obtener la contraseña encriptada y el rol
  let result: Option<(String, String)> = conn.exec_first(
    "SELECT contrasena, nombre_rol FROM Usuarios JOIN Roles ON Usuarios.id_rol = Roles.id_rol WHERE correo = :correo",
    params! {
      "correo" => &payload.email,
    },
  ).map_err(|e| e.to_string())?;

  if let Some((hashed_password, role)) = result {
    // Verificar la contraseña
    if verify(&payload.password, &hashed_password).map_err(|e| e.to_string())? {
      return Ok(UserSession { email: payload.email, role });
    } else {
      return Err("Contraseña incorrecta".into());
    }
  } else {
    return Err("Correo electrónico no encontrado".into());
  }
}