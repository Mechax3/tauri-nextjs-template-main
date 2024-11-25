// src/models.rs

use diesel::prelude::*;
use diesel::sql_types::{Decimal, Datetime};

#[derive(Queryable)]
pub struct MovimientoInventario {
    pub id_movimiento: i32,
    pub id_producto: i32,
    pub tipo_movimiento: String,
    pub cantidad: Decimal,
    pub fecha_movimiento: Datetime,
}