// src/models.rs

use diesel::prelude::*;
use diesel::sql_types::Integer;

#[derive(Queryable)]
pub struct Usuario {
    pub id_usuario: i32,
    pub nombre: String,
    pub contrasena: String,
    pub id_rol: i32,
}

#[derive(Queryable)]
pub struct Rol {
    pub id_rol: i32,
    pub nombre_rol: String,
}