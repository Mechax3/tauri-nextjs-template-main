mod config;
mod register;
mod login;
mod controllers;

use actix_web::{App, HttpServer, rt::System};
use actix_cors::Cors;
use std::thread;
use env_logger;
use crate::controllers::{ventas_controller, historial_controller}; // Importa los controladores

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Inicializar el logger
    env_logger::init();

    // Inicia el servidor Actix-web en un hilo separado
    thread::spawn(|| {
        let sys = System::new();
        sys.block_on(async {
            HttpServer::new(|| {
                App::new()
                    .wrap(
                        Cors::default()
                            .allow_any_origin()
                            .allow_any_method()
                            .allow_any_header()
                            .max_age(3600)
                    )
                    .service(register::register_user_actix)
                    .service(login::login_user_actix)
                    .service(controllers::producto_controller::get_productos)
                    .service(controllers::producto_controller::add_producto)
                    .service(controllers::producto_controller::update_producto)
                    .service(controllers::producto_controller::delete_producto)
                    .service(ventas_controller::get_ventas)
                    .service(ventas_controller::get_venta_detalle)
                    .service(ventas_controller::crear_venta)
                    .service(historial_controller::get_historial)
                    .service(historial_controller::agregar_historial)
                    .service(historial_controller::obtener_total_historial)
                    .service(controllers::compras_controller::get_compras)
                    .service(controllers::compras_controller::get_compra_detalle)
                    .service(controllers::compras_controller::crear_compra)
                    .service(controllers::inventario_controller::get_movimientos_inventario)
                    .service(controllers::admin_controller::get_usuarios)
                    .service(controllers::admin_controller::delete_usuario) // Añadir este servicio
            })
            .bind("127.0.0.1:8080")
            .expect("Cannot bind to port 8080")
            .run()
            .await
            .expect("Error running Actix-web server");
        });
    });

    // Inicia la aplicación Tauri
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![register::register_user, login::login_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}