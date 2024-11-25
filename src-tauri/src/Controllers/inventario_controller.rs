use actix_web::{get, HttpResponse, Responder};
use mysql::*;
use mysql::prelude::*;
use serde::Serialize;

#[derive(Serialize)]
struct MovimientoInventario {
    id_movimiento: i32,
    id_producto: i32,
    tipo_movimiento: String,
    cantidad: f64,
    fecha_movimiento: String,
    nombre_producto: String,
}

#[get("/movimientos_inventario")]
async fn get_movimientos_inventario() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let movimientos: Vec<MovimientoInventario> = conn
        .query_map(
            r#"
            SELECT mi.id_movimiento, mi.id_producto, mi.tipo_movimiento, mi.cantidad, 
                   DATE_FORMAT(mi.fecha_movimiento, '%Y-%m-%d %H:%i:%s') AS fecha_movimiento,
                   a.nombre_producto
            FROM Movimientos_Inventario mi
            JOIN Articulos a ON mi.id_producto = a.id_producto
            "#,
            |(id_movimiento, id_producto, tipo_movimiento, cantidad, fecha_movimiento, nombre_producto)| MovimientoInventario {
                id_movimiento,
                id_producto,
                tipo_movimiento,
                cantidad,
                fecha_movimiento,
                nombre_producto,
            },
        )
        .expect("Error fetching movimientos");

    HttpResponse::Ok().json(movimientos)
}