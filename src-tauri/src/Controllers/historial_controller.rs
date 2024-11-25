use actix_web::{get, post, web, HttpResponse, Responder};
use mysql::*;
use mysql::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct HistorialPago {
    pub id_pago: i32,
    pub id_venta: i32,
    pub fecha_pago: String,
    pub monto_pago: f64,
    pub usuario: String, // Añadir el nombre del usuario
}

#[get("/historial")]
async fn get_historial() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let historial: Vec<HistorialPago> = conn
        .query_map(
            "SELECT id_pago, id_venta, fecha_pago, monto_pago, usuario FROM Historial_Pagos",
            |(id_pago, id_venta, fecha_pago, monto_pago, usuario)| HistorialPago {
                id_pago,
                id_venta,
                fecha_pago,
                monto_pago,
                usuario,
            },
        )
        .expect("Failed to fetch historial");

    HttpResponse::Ok().json(historial)
}

#[post("/historial")]
async fn agregar_historial(historial: web::Json<HistorialPago>) -> impl Responder {
    let mut conn = crate::config::get_connection();

    // Obtener el nombre del usuario basado en el correo
    let usuario: Option<String> = conn.exec_first(
        "SELECT nombre FROM Usuarios WHERE correo = :correo",
        params! {
            "correo" => &historial.usuario,
        },
    ).map_err(|e| e.to_string()).unwrap_or(None);

    let usuario = match usuario {
        Some(nombre) => nombre,
        None => "Desconocido".to_string(),
    };

    conn.exec_drop(
        "INSERT INTO Historial_Pagos (id_venta, fecha_pago, monto_pago, usuario) VALUES (:id_venta, :fecha_pago, :monto_pago, :usuario)",
        params! {
            "id_venta" => historial.id_venta,
            "fecha_pago" => &historial.fecha_pago,
            "monto_pago" => historial.monto_pago,
            "usuario" => &usuario,
        },
    ).expect("Error inserting historial");

    HttpResponse::Ok().json("Historial agregado")
}

#[get("/historial/total")]
async fn obtener_total_historial() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let total: f64 = conn.query_first(
        "SELECT SUM(monto_pago) FROM Historial_Pagos"
    ).expect("Error fetching total").unwrap_or(0.0);

    HttpResponse::Ok().json(total)
}