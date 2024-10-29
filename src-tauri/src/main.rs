mod register;
mod login;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![register::register_user, login::login_user])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}