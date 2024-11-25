// src/models.rs

use diesel::prelude::*;
use diesel::sql_types::{Decimal, Datetime};

#[derive(Queryable)]
pub struct Venta {
    pub id_venta: i32,
    pub id_usuario: i32,
    pub cliente_id: Option<i32>,
    pub fecha_venta: Datetime,
    pub total_venta: Decimal,
}

#[derive(Queryable)]
pub struct DetalleVenta {
    pub id_detalle: i32,
    pub id_venta: i32,
    pub id_producto: i32,
    pub cantidad: Decimal,
    pub precio_unitario: Decimal,
    pub descuento: Decimal,
}

#[derive(Queryable)]
pub struct HistorialPago {
    pub id_pago: i32,
    pub id_venta: i32,
    pub fecha_pago: Datetime,
    pub monto_pago: Decimal,
}