use actix_web::{get, post, web, HttpResponse, Responder};
use mysql::*;
use mysql::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize)]
struct ProductoResumen {
    nombre: String,
    precio: f64,
}

#[derive(Serialize)]
struct CompraResumen {
    id: i32,
    proveedor: String,
    fecha: String,
    productos: Vec<ProductoResumen>,
    total: f64,
    observacion: Option<String>, // Agregar campo observacion
}

#[derive(Serialize)]
struct ProductoDetalle {
    nombre: String,
    precio_unitario: f64,
    cantidad: f64,
}

#[derive(Serialize)]
struct CompraDetalle {
    proveedor: String,
    fecha: String,
    productos: Vec<ProductoDetalle>,
    total: f64,
    observacion: Option<String>, // Agregar campo observacion
}

#[derive(Deserialize)]
struct ProductoDetalleInput {
    id_producto: i32,
    cantidad: f64,
    precio_unitario: f64,
}

#[derive(Deserialize)]
struct NuevaCompra {
    proveedor: String,
    productos: Vec<ProductoDetalleInput>,
    total: f64,
    observacion: Option<String>, // Agregar campo observacion
}

#[get("/compras")]
async fn get_compras() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let compras: Vec<(i32, String, String, f64, Option<String>)> = conn
        .query(
            r#"
            SELECT c.id_compra, p.nombre AS proveedor, DATE_FORMAT(c.fecha_compra, '%Y-%m-%d %H:%i:%s') AS fecha_compra, c.total_compra, c.observacion
            FROM Compras c
            JOIN Proveedores p ON c.proveedor_id = p.proveedor_id
            "#,
        )
        .expect("Error fetching compras");

    let mut compras_resumen = Vec::new();

    for (id_compra, proveedor, fecha, total, observacion) in compras {
        let productos: Vec<(String, f64)> = conn
            .exec(
                r#"
                SELECT a.nombre_producto AS nombre, dc.precio_unitario AS precio
                FROM Detalle_Compras dc
                JOIN Articulos a ON dc.id_producto = a.id_producto
                WHERE dc.id_compra = :id_compra
                LIMIT 2
                "#,
                params! {
                    "id_compra" => id_compra,
                },
            )
            .expect("Error fetching productos");

        let productos_resumen: Vec<ProductoResumen> = productos
            .into_iter()
            .map(|(nombre, precio)| ProductoResumen { nombre, precio })
            .collect();

        compras_resumen.push(CompraResumen {
            id: id_compra,
            proveedor,
            fecha,
            productos: productos_resumen,
            total,
            observacion,
        });
    }

    HttpResponse::Ok().json(compras_resumen)
}

#[get("/compras/{id_compra}")]
async fn get_compra_detalle(path: web::Path<i32>) -> impl Responder {
    let id_compra = path.into_inner();
    let mut conn = crate::config::get_connection();

    let compra: Option<(String, String, f64, Option<String>)> = conn.exec_first(
        r#"
        SELECT p.nombre AS proveedor, DATE_FORMAT(c.fecha_compra, '%Y-%m-%d %H:%i:%s') AS fecha_compra, c.total_compra, c.observacion
        FROM Compras c
        JOIN Proveedores p ON c.proveedor_id = p.proveedor_id
        WHERE c.id_compra = :id_compra
        "#,
        params! {
            "id_compra" => id_compra,
        },
    ).expect("Error fetching compra");

    if let Some((proveedor, fecha, total, observacion)) = compra {
        let productos: Vec<(String, f64, f64)> = conn.exec(
            r#"
            SELECT a.nombre_producto AS nombre, dc.precio_unitario, dc.cantidad
            FROM Detalle_Compras dc
            JOIN Articulos a ON dc.id_producto = a.id_producto
            WHERE dc.id_compra = :id_compra
            "#,
            params! {
                "id_compra" => id_compra,
            },
        ).expect("Error fetching productos");

        let productos_detalle: Vec<ProductoDetalle> = productos.into_iter()
            .map(|(nombre, precio_unitario, cantidad)| ProductoDetalle {
                nombre,
                precio_unitario,
                cantidad,
            })
            .collect();

        let compra_detalle = CompraDetalle {
            proveedor,
            fecha,
            productos: productos_detalle,
            total,
            observacion,
        };

        HttpResponse::Ok().json(compra_detalle)
    } else {
        HttpResponse::NotFound().finish()
    }
}

#[post("/compras")]
async fn crear_compra(nueva_compra: web::Json<NuevaCompra>) -> impl Responder {
    let mut conn = crate::config::get_connection();

    // Insertar proveedor si no existe
    let proveedor_id: Option<i32> = conn.exec_first(
        "SELECT proveedor_id FROM Proveedores WHERE nombre = :nombre",
        params! {
            "nombre" => &nueva_compra.proveedor,
        },
    ).unwrap_or(None);

    let proveedor_id = match proveedor_id {
        Some(id) => id,
        None => {
            conn.exec_drop(
                "INSERT INTO Proveedores (nombre) VALUES (:nombre)",
                params! {
                    "nombre" => &nueva_compra.proveedor,
                },
            ).expect("Error inserting proveedor");
            conn.last_insert_id() as i32
        }
    };

    // Iniciar transacción
    let mut tx = conn.start_transaction(TxOpts::default()).unwrap();

    // Insertar compra
    tx.exec_drop(
        "INSERT INTO Compras (proveedor_id, total_compra, observacion) VALUES (:proveedor_id, :total_compra, :observacion)",
        params! {
            "proveedor_id" => proveedor_id,
            "total_compra" => nueva_compra.total,
            "observacion" => &nueva_compra.observacion,
        },
    ).expect("Error inserting compra");

    let id_compra = match tx.last_insert_id() {
        Some(id) => id as i32,
        None => {
            return HttpResponse::InternalServerError().json("No se pudo obtener el id de la compra");
        }
    };

    // Insertar detalles de la compra y actualizar la cantidad de productos
    for producto in &nueva_compra.productos {
        // Insertar detalle de compra
        tx.exec_drop(
            "INSERT INTO Detalle_Compras (id_compra, id_producto, cantidad, precio_unitario) VALUES (:id_compra, :id_producto, :cantidad, :precio_unitario)",
            params! {
                "id_compra" => id_compra,
                "id_producto" => producto.id_producto,
                "cantidad" => producto.cantidad,
                "precio_unitario" => producto.precio_unitario,
            },
        ).expect("Error inserting detalle_compra");

        // Actualizar inventario
        tx.exec_drop(
            "UPDATE Articulos SET cantidad = cantidad + :cantidad WHERE id_producto = :id_producto",
            params! {
                "cantidad" => producto.cantidad,
                "id_producto" => producto.id_producto,
            },
        ).expect("Error updating cantidad in Articulos");

        // Insertar movimiento de inventario
        tx.exec_drop(
            "INSERT INTO Movimientos_Inventario (id_producto, tipo_movimiento, cantidad) VALUES (:id_producto, 'entrada', :cantidad)",
            params! {
                "id_producto" => producto.id_producto,
                "cantidad" => producto.cantidad,
            },
        ).expect("Error inserting movimiento_inventario");
    }

    // Commit de la transacción
    tx.commit().unwrap();

    // Responder con éxito
    HttpResponse::Ok().json(json!({
        "message": "Compra creada exitosamente",
        "id_compra": id_compra,
    }))
}