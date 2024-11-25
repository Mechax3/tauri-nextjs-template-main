// src/models.rs

use diesel::prelude::*;
use diesel::sql_types::{Decimal, Datetime};

#[derive(Queryable)]
pub struct Compra {
    pub id_compra: i32,
    pub fecha_compra: Datetime,
    pub total_compra: Decimal,
}

#[derive(Queryable)]
pub struct DetalleCompra {
    pub id_detalle_compra: i32,
    pub id_compra: i32,
    pub id_producto: i32,
    pub cantidad: Decimal,
    pub precio_unitario: Decimal,
}