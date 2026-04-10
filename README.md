# 网易云歌单播放器（Rust 后端）

本项目后端已全部迁移为 Rust 实现。

## 运行方式

```powershell
cd E:\codex
cargo run
```

或使用一键启动脚本：

```powershell
.\start-rust-backend.ps1
```

启动后访问：

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/admin.html

## 说明

- `api-enhanced` 需要运行在 `http://127.0.0.1:3000`
- Cookie 文件：`netease_cookie.conf`
- 后端地址配置文件：`api_enhanced_base.conf`

## 项目结构

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
