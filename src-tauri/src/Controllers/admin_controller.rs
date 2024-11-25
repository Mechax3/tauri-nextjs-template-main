use actix_web::{get, delete, web, Responder, HttpResponse};
use mysql::*;
use mysql::prelude::*;
use serde::{Serialize, Deserialize};
use actix_web::web::Path; // Importar Path directamente

#[derive(Serialize, Deserialize)]
struct Usuario {
    id_usuario: i32,
    nombre: String,
    correo: String,
}

#[get("/usuarios")]
async fn get_usuarios() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let usuarios: Vec<Usuario> = conn
        .query_map(
            "SELECT id_usuario, nombre, correo FROM Usuarios JOIN Roles ON Usuarios.id_rol = Roles.id_rol WHERE Roles.nombre_rol = 'Empleado'",
            |(id_usuario, nombre, correo)| Usuario {
                id_usuario,
                nombre,
                correo,
            },
        )
        .expect("Failed to fetch users");

    HttpResponse::Ok().json(usuarios)
}

#[delete("/usuarios/{id_usuario}")]
async fn delete_usuario(id_usuario: Path<i32>) -> impl Responder {
    let mut conn = crate::config::get_connection();
    let id_usuario = id_usuario.into_inner(); // Extraer el valor de id_usuario una vez

    // Eliminar los registros relacionados en la tabla ventas
    conn.exec_drop(
        "DELETE FROM ventas WHERE id_usuario = :id_usuario",
        params! {
            "id_usuario" => id_usuario,
        },
    ).expect("Failed to delete related sales");

    // Eliminar el usuario
    conn.exec_drop(
        "DELETE FROM Usuarios WHERE id_usuario = :id_usuario",
        params! {
            "id_usuario" => id_usuario,
        },
    ).expect("Failed to delete user");

    HttpResponse::Ok().body("Usuario eliminado")
}