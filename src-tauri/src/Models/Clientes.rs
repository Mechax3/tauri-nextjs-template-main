// src/models.rs

use diesel::prelude::*;
use diesel::sql_types::Decimal;

#[derive(Queryable)]
pub struct Cliente {
    pub cliente_id: i32,
    pub nombre: String,
    pub telefono: Option<String>,
    pub direccion: Option<String>,
    pub saldo_pendiente: Decimal,
}

#[derive(Queryable)]
pub struct Proveedor {
    pub proveedor_id: i32,
    pub nombre: String,
    pub telefono: Option<String>,
    pub direccion: Option<String>,
    pub email: Option<String>,
    pub saldo_pendiente: Decimal,
}