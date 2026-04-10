# Netease Playlist Player (Rust Backend)

This project is now fully backended by Rust.

## Run

```powershell
cd E:\codex
cargo run`r`n# or`r`n.\start-rust-backend.ps1
```

Open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/admin.html

## Notes

- `api-enhanced` should be running at `http://127.0.0.1:3000`.
- Cookie file: `netease_cookie.conf`
- Backend base config: `api_enhanced_base.conf`

## Core Structure

```text
E:\codex
|-- Cargo.toml
|-- Cargo.lock
|-- src/
|   `-- main.rs
|-- static/
|   |-- index.html
|   |-- app.js
|   |-- admin.html
|   |-- admin.js
|   `-- styles.css
`-- api-enhanced-src/
```

