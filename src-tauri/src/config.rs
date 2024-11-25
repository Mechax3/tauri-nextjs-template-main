use mysql::*;
use std::env;
use dotenv::dotenv;

pub fn get_connection() -> PooledConn {
    // Cargar variables de entorno desde el archivo .env
    dotenv().ok();

    let opts = OptsBuilder::new()
        .ip_or_hostname(Some(env::var("DB_HOST").expect("DB_HOST must be set")))
        .tcp_port(env::var("DB_PORT").expect("DB_PORT must be set").parse().expect("DB_PORT must be a number"))
        .user(Some(env::var("DB_USER").expect("DB_USER must be set")))
        .pass(Some(env::var("DB_PASSWORD").expect("DB_PASSWORD must be set")))
        .db_name(Some(env::var("DB_NAME").expect("DB_NAME must be set")));

    let pool = Pool::new(opts).expect("Failed to create pool.");
    pool.get_conn().expect("Failed to get connection.")
}
