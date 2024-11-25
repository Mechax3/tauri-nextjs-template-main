use actix_web::{get, post, put, delete, web, Responder, HttpResponse};
use mysql::*;
use mysql::prelude::*;
use serde::{Serialize, Deserialize};
use log::{info, error};

#[derive(Serialize, Deserialize)]
struct Producto {
    id_producto: Option<i32>,
    nombre_producto: String,
    precio: f64,
    cantidad: f64,
    unidad: String,
    descripcion: Option<String>,
}

#[post("/productos")]
async fn add_producto(new_product: web::Json<Producto>) -> impl Responder {
    let mut conn = crate::config::get_connection();

    let result = conn.exec_drop(
        "INSERT INTO Articulos (nombre_producto, precio, cantidad, id_unidad, descripcion)
         VALUES (:nombre_producto, :precio, :cantidad, 
         (SELECT id_unidad FROM Unidades_Medida WHERE abreviatura = :unidad), :descripcion)",
        params! {
            "nombre_producto" => &new_product.nombre_producto,
            "precio" => &new_product.precio,
            "cantidad" => &new_product.cantidad,
            "unidad" => &new_product.unidad,
            "descripcion" => &new_product.descripcion,
        },
    );

    if let Err(e) = result {
        error!("Error inserting product: {:?}", e);
        return HttpResponse::InternalServerError().finish();
    }

    let producto_tuple: Option<(i32, String, f64, f64, String, Option<String>)> = conn.exec_first(
        "SELECT a.id_producto, a.nombre_producto, a.precio, a.cantidad, u.nombre_unidad, a.descripcion
         FROM Articulos a
         JOIN Unidades_Medida u ON a.id_unidad = u.id_unidad
         WHERE a.nombre_producto = :nombre_producto",
        params! {
            "nombre_producto" => &new_product.nombre_producto,
        },
    ).unwrap();

    if let Some((id_producto, nombre_producto, precio, cantidad, unidad, descripcion)) = producto_tuple {
        let producto = Producto {
            id_producto: Some(id_producto),
            nombre_producto,
            precio,
            cantidad,
            unidad,
            descripcion,
        };
        HttpResponse::Created().json(producto)
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[put("/productos/{id}")]
async fn update_producto(id: web::Path<i32>, updated_product: web::Json<Producto>) -> impl Responder {
    let mut conn = crate::config::get_connection();

    // Verificar si la unidad existe
    let unidad_exists: Option<i32> = conn.exec_first(
        "SELECT id_unidad FROM Unidades_Medida WHERE abreviatura = :unidad",
        params! {
            "unidad" => &updated_product.unidad,
        },
    ).unwrap();

    if unidad_exists.is_none() {
        error!("Unidad no encontrada: {:?}", updated_product.unidad);
        return HttpResponse::BadRequest().body("Unidad no encontrada");
    }

    let result = conn.exec_drop(
        "UPDATE Articulos SET nombre_producto = :nombre_producto, precio = :precio, cantidad = :cantidad, 
         id_unidad = (SELECT id_unidad FROM Unidades_Medida WHERE abreviatura = :unidad), descripcion = :descripcion
         WHERE id_producto = :id_producto",
        params! {
            "id_producto" => *id,
            "nombre_producto" => &updated_product.nombre_producto,
            "precio" => &updated_product.precio,
            "cantidad" => &updated_product.cantidad,
            "unidad" => &updated_product.unidad,
            "descripcion" => &updated_product.descripcion,
        },
    );

    if let Err(e) = result {
        error!("Error updating product: {:?}", e);
        return HttpResponse::InternalServerError().finish();
    }

    let producto_tuple: Option<(i32, String, f64, f64, String, Option<String>)> = conn.exec_first(
        "SELECT a.id_producto, a.nombre_producto, a.precio, a.cantidad, u.nombre_unidad, a.descripcion
         FROM Articulos a
         JOIN Unidades_Medida u ON a.id_unidad = u.id_unidad
         WHERE a.id_producto = :id_producto",
        params! {
            "id_producto" => *id,
        },
    ).unwrap();

    if let Some((id_producto, nombre_producto, precio, cantidad, unidad, descripcion)) = producto_tuple {
        let producto = Producto {
            id_producto: Some(id_producto),
            nombre_producto,
            precio,
            cantidad,
            unidad,
            descripcion,
        };
        HttpResponse::Ok().json(producto)
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[delete("/productos/{id}")]
async fn delete_producto(id: web::Path<i32>) -> impl Responder {
    let mut conn = crate::config::get_connection();

    // Eliminar referencias en detalle_compras
    let result = conn.exec_drop(
        "DELETE FROM detalle_compras WHERE id_producto = :id_producto",
        params! {
            "id_producto" => *id,
        },
    );

    if let Err(e) = result {
        error!("Error deleting product references in detalle_compras: {:?}", e);
        return HttpResponse::InternalServerError().finish();
    }

    // Eliminar referencias en movimientos_inventario
    let result = conn.exec_drop(
        "DELETE FROM movimientos_inventario WHERE id_producto = :id_producto",
        params! {
            "id_producto" => *id,
        },
    );

    if let Err(e) = result {
        error!("Error deleting product references in movimientos_inventario: {:?}", e);
        return HttpResponse::InternalServerError().finish();
    }

    // Eliminar el producto en articulos
    let result = conn.exec_drop(
        "DELETE FROM Articulos WHERE id_producto = :id_producto",
        params! {
            "id_producto" => *id,
        },
    );

    if let Err(e) = result {
        error!("Error deleting product: {:?}", e);
        return HttpResponse::InternalServerError().finish();
    }

    HttpResponse::NoContent().finish()
}

#[get("/productos")]
async fn get_productos() -> impl Responder {
    let mut conn = crate::config::get_connection();

    let productos: Vec<Producto> = conn
        .query_map(
            "SELECT a.id_producto, a.nombre_producto, a.precio, a.cantidad, u.nombre_unidad, a.descripcion
             FROM Articulos a
             JOIN Unidades_Medida u ON a.id_unidad = u.id_unidad",
            |(id_producto, nombre_producto, precio, cantidad, unidad, descripcion)| Producto {
                id_producto: Some(id_producto),
                nombre_producto,
                precio,
                cantidad,
                unidad,
                descripcion,
            },
        )
        .expect("Failed to fetch products");

    web::Json(productos)
}
