use actix_web::{get, post, web, HttpResponse, Responder};
use mysql::*;
use mysql::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::controllers::historial_controller::HistorialPago; // Asegúrate de importar HistorialPago

#[derive(Serialize)]
struct ProductoResumen {
    nombre: String,
    precio: f64,
}

#[derive(Serialize)]
struct VentaResumen {
    id: i32,
    cliente: String,
    fecha: String,
    productos: Vec<ProductoResumen>,
    total: f64,
}

#[derive(Serialize)]
struct ProductoDetalle {
    nombre: String,
    precio_unitario: f64,
    cantidad: f64,
}

#[derive(Serialize)]
struct VentaDetalle {
    cliente: String,
    fecha: String,
    productos: Vec<ProductoDetalle>,
    total: f64,
}

#[derive(Deserialize, Debug)] // Derive Debug trait
struct ProductoDetalleInput {
    id_producto: i32,
    cantidad: f64,
    precio_unitario: f64,
}

#[derive(Deserialize, Debug)] // Derive Debug trait
struct NuevaVenta {
    cliente: String,
    productos: Vec<ProductoDetalleInput>,
    descuento: f64,
    total: f64,
}

#[get("/ventas")]
async fn get_ventas() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let ventas: Vec<(i32, String, String, f64)> = conn
        .query(
            r#"
            SELECT v.id_venta, c.nombre AS cliente, DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i:%s') AS fecha_venta, v.total_venta
            FROM Ventas v
            JOIN Clientes c ON v.cliente_id = c.cliente_id
            "#,
        )
        .expect("Error fetching ventas");

    let mut ventas_resumen = Vec::new();

    for (id_venta, cliente, fecha, total) in ventas {
        let productos: Vec<(String, f64)> = conn
            .exec(
                r#"
                SELECT a.nombre_producto AS nombre, dv.precio_unitario AS precio
                FROM Detalle_Ventas dv
                JOIN Articulos a ON dv.id_producto = a.id_producto
                WHERE dv.id_venta = :id_venta
                LIMIT 2
                "#,
                params! {
                    "id_venta" => id_venta,
                },
            )
            .expect("Error fetching productos");

        let productos_resumen: Vec<ProductoResumen> = productos
            .into_iter()
            .map(|(nombre, precio)| ProductoResumen { nombre, precio })
            .collect();

        ventas_resumen.push(VentaResumen {
            id: id_venta,
            cliente,
            fecha,
            productos: productos_resumen,
            total,
        });
    }

    HttpResponse::Ok().json(ventas_resumen)
}

#[get("/ventas/{id_venta}")]
async fn get_venta_detalle(path: web::Path<i32>) -> impl Responder {
    let id_venta = path.into_inner();
    let mut conn = crate::config::get_connection();

    let venta: Option<(String, String, f64)> = conn.exec_first(
        r#"
        SELECT c.nombre AS cliente, DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i:%s') AS fecha_venta, v.total_venta
        FROM Ventas v
        JOIN Clientes c ON v.cliente_id = c.cliente_id
        WHERE v.id_venta = :id_venta
        "#,
        params! {
            "id_venta" => id_venta,
        },
    ).expect("Error fetching venta");

    if let Some((cliente, fecha, total)) = venta {
        let productos: Vec<(String, f64, f64)> = conn.exec(
            r#"
            SELECT a.nombre_producto AS nombre, dv.precio_unitario, dv.cantidad
            FROM Detalle_Ventas dv
            JOIN Articulos a ON dv.id_producto = a.id_producto
            WHERE dv.id_venta = :id_venta
            "#,
            params! {
                "id_venta" => id_venta,
            },
        ).expect("Error fetching productos");

        let productos_detalle: Vec<ProductoDetalle> = productos.into_iter()
            .map(|(nombre, precio_unitario, cantidad)| ProductoDetalle {
                nombre,
                precio_unitario,
                cantidad,
            })
            .collect();

        let venta_detalle = VentaDetalle {
            cliente,
            fecha,
            productos: productos_detalle,
            total,
        };

        HttpResponse::Ok().json(venta_detalle)
    } else {
        HttpResponse::NotFound().finish()
    }
}

#[post("/ventas")]
async fn crear_venta(nueva_venta: web::Json<NuevaVenta>) -> impl Responder {
    println!("Received new venta: {:?}", nueva_venta);

    let mut conn = crate::config::get_connection();

    // Insertar cliente si no existe
    let cliente_id: Option<i32> = conn.exec_first(
        "SELECT cliente_id FROM Clientes WHERE nombre = :nombre",
        params! {
            "nombre" => &nueva_venta.cliente,
        },
    ).unwrap_or(None);

    let cliente_id = match cliente_id {
        Some(id) => id,
        None => {
            conn.exec_drop(
                "INSERT INTO Clientes (nombre) VALUES (:nombre)",
                params! {
                    "nombre" => &nueva_venta.cliente,
                },
            ).expect("Error inserting cliente");
            conn.last_insert_id() as i32
        }
    };

    // Iniciar transacción
    let mut tx = conn.start_transaction(TxOpts::default()).unwrap();

    // Insertar venta
    tx.exec_drop(
        "INSERT INTO Ventas (cliente_id, total_venta) VALUES (:cliente_id, :total_venta)",
        params! {
            "cliente_id" => cliente_id,
            "total_venta" => nueva_venta.total,
        },
    ).expect("Error inserting venta");

    let id_venta = match tx.last_insert_id() {
        Some(id) => id as i32,
        None => {
            return HttpResponse::InternalServerError().json("No se pudo obtener el id de la venta");
        }
    };

    // Insertar detalles de la venta y actualizar la cantidad de productos
    for producto in &nueva_venta.productos {
        // Verificar que haya suficiente stock
        let stock_actual: f64 = tx.exec_first(
            "SELECT cantidad FROM Articulos WHERE id_producto = :id_producto",
            params! {
                "id_producto" => producto.id_producto,
            },
        ).unwrap_or(None).unwrap_or(0.0);

        if stock_actual < producto.cantidad {
            return HttpResponse::BadRequest().json("No hay suficiente stock");
        }

        // Insertar detalle de venta
        tx.exec_drop(
            "INSERT INTO Detalle_Ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (:id_venta, :id_producto, :cantidad, :precio_unitario)",
            params! {
                "id_venta" => id_venta,
                "id_producto" => producto.id_producto,
                "cantidad" => producto.cantidad,
                "precio_unitario" => producto.precio_unitario,
            },
        ).expect("Error inserting detalle_venta");

        // Actualizar inventario
        tx.exec_drop(
            "UPDATE Articulos SET cantidad = cantidad - :cantidad WHERE id_producto = :id_producto",
            params! {
                "cantidad" => producto.cantidad,
                "id_producto" => producto.id_producto,
            },
        ).expect("Error updating cantidad in Articulos");

        // Insertar movimiento de inventario
        tx.exec_drop(
            "INSERT INTO Movimientos_Inventario (id_producto, tipo_movimiento, cantidad) VALUES (:id_producto, 'salida', :cantidad)",
            params! {
                "id_producto" => producto.id_producto,
                "cantidad" => producto.cantidad,
            },
        ).expect("Error inserting movimiento_inventario");
    }

    // Commit de la transacción
    tx.commit().unwrap();

    // Enviar información de la venta al historial
    let fecha: String = conn.exec_first(
        "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')",
        (),
    ).unwrap_or(None).unwrap_or("Desconocido".to_string());

    let historial_pago = HistorialPago {
        id_pago: 0, // Este campo se autogenera en la base de datos
        id_venta,
        fecha_pago: fecha,
        monto_pago: nueva_venta.total,
        usuario: "Desconocido".to_string(), // Usuario desconocido
    };

    let client = reqwest::Client::new();
    client.post("http://localhost:8080/historial")
        .json(&historial_pago)
        .send()
        .await
        .expect("Error sending historial");

    // Responder con éxito
    HttpResponse::Ok().json(json!({
        "message": "Venta creada exitosamente",
        "id_venta": id_venta,
    }))
}