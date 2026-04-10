use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use axum::body::Body;
use axum::extract::{Path as AxumPath, Query, State};
use axum::http::{header, HeaderMap, HeaderValue, Response, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::Utc;
use mime_guess::from_path;
use rand::RngCore;
use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use subtle::ConstantTimeEq;
use tokio::fs;
use tokio::sync::RwLock;
use url::Url;

const HOST: &str = "127.0.0.1";
const PORT: u16 = 8000;
const ADMIN_SESSION_COOKIE: &str = "admin_session";
const DEFAULT_ADMIN_PASSWORD: &str = "change-me-123456";
const DEFAULT_API_ENHANCED_BASE: &str = "http://127.0.0.1:3000";
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

#[derive(Clone)]
struct AppState {
    paths: AppPaths,
    sessions: Arc<RwLock<HashSet<String>>>,
    client: Client,
}

#[derive(Clone)]
struct AppPaths {
    static_dir: PathBuf,
    cookie_file: PathBuf,
    admin_password_file: PathBuf,
    api_enhanced_base_file: PathBuf,
    api_enhanced_env_file: PathBuf,
}

#[derive(Debug)]
enum ApiError {
    BadRequest(String),
    Unauthorized(String),
    NotFound(String),
    BadGateway(String),
    Internal(String),
}

impl ApiError {
    fn status(&self) -> StatusCode {
        match self {
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::BadGateway(_) => StatusCode::BAD_GATEWAY,
            Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> &str {
        match self {
            Self::BadRequest(msg)
            | Self::Unauthorized(msg)
            | Self::NotFound(msg)
            | Self::BadGateway(msg)
            | Self::Internal(msg) => msg,
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response<Body> {
        let status = self.status();
        let payload = Json(json!({ "error": self.message() }));
        (status, payload).into_response()
    }
}

#[derive(Debug)]
enum UpstreamError {
    Http(u16),
    Network,
    Other(String),
}

#[derive(Deserialize)]
struct LoginRequest {
    password: String,
}

#[derive(Deserialize)]
struct CookieRequest {
    cookie: String,
}

#[tokio::main]
async fn main() {
    let base_dir = std::env::current_dir().expect("failed to read current directory");
    let paths = AppPaths {
        static_dir: base_dir.join("static"),
        cookie_file: base_dir.join("netease_cookie.conf"),
        admin_password_file: base_dir.join("admin_password.conf"),
        api_enhanced_base_file: base_dir.join("api_enhanced_base.conf"),
        api_enhanced_env_file: base_dir
            .join("api-enhanced-src")
            .join("api-enhanced-main")
            .join(".env"),
    };

    if let Err(err) = ensure_file(&paths.admin_password_file, DEFAULT_ADMIN_PASSWORD).await {
        eprintln!("初始化后台密码文件失败: {err}");
        return;
    }
    if let Err(err) = ensure_file(&paths.api_enhanced_base_file, DEFAULT_API_ENHANCED_BASE).await {
        eprintln!("初始化 api-enhanced 地址文件失败: {err}");
        return;
    }

    let client = match Client::builder().timeout(Duration::from_secs(10)).build() {
        Ok(client) => client,
        Err(err) => {
            eprintln!("创建 HTTP 客户端失败: {err}");
            return;
        }
    };

    let state = AppState {
        paths,
        sessions: Arc::new(RwLock::new(HashSet::new())),
        client,
    };

    let app = Router::new()
        .route(
            "/api/playlist",
            get(api_playlist_get).post(api_playlist_post),
        )
        .route("/api/track/playinfo", get(api_track_playinfo_get))
        .route(
            "/api/netease-login/status",
            get(api_netease_login_status_get),
        )
        .route("/api/netease-login/qr", get(api_netease_login_qr_get))
        .route("/api/netease-login/check", get(api_netease_login_check_get))
        .route("/api/admin/session", get(api_admin_session_get))
        .route("/api/admin/login", post(api_admin_login_post))
        .route("/api/admin/logout", post(api_admin_logout_post))
        .route(
            "/api/admin/cookie",
            get(api_admin_cookie_get).post(api_admin_cookie_post),
        )
        .route("/", get(serve_index))
        .route("/admin", get(serve_admin))
        .route("/admin.html", get(serve_admin))
        .route("/*path", get(serve_static))
        .with_state(state);

    let listener = match tokio::net::TcpListener::bind((HOST, PORT)).await {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!("端口绑定失败: {err}");
            return;
        }
    };

    println!("服务已启动: http://{HOST}:{PORT}");
    println!("在浏览器打开页面后，输入网易云歌单 ID 即可查询。");
    println!(
        "后台密码文件: {}",
        base_dir.join("admin_password.conf").display()
    );
    println!(
        "api-enhanced 地址文件: {}",
        base_dir.join("api_enhanced_base.conf").display()
    );

    if let Err(err) = axum::serve(listener, app).await {
        eprintln!("服务运行异常: {err}");
    }
}

async fn api_playlist_get(
    State(state): State<AppState>,
    Query(query): Query<HashMap<String, String>>,
) -> Result<Json<Value>, ApiError> {
    let raw_input = query.get("id").map_or("", String::as_str).trim();
    if raw_input.is_empty() {
        return Err(ApiError::BadRequest(
            "请在查询参数中提供歌单 ID 或歌单链接，例如 /api/playlist?id=3778678".to_string(),
        ));
    }

    let playlist_id = normalize_playlist_input(raw_input).map_err(ApiError::BadGateway)?;
    match fetch_playlist(&state, &playlist_id).await {
        Ok(payload) => Ok(Json(payload)),
        Err(UpstreamError::Http(code)) => Err(ApiError::BadGateway(format!(
            "网易云接口请求失败，状态码 {code}。"
        ))),
        Err(UpstreamError::Network) => Err(ApiError::BadGateway(
            "网络连接失败，暂时无法访问网易云接口。".to_string(),
        )),
        Err(UpstreamError::Other(msg)) => Err(ApiError::Internal(format!(
            "服务内部异常，请稍后重试。{msg}"
        ))),
    }
}

async fn api_playlist_post() -> Result<Json<Value>, ApiError> {
    Err(ApiError::NotFound("接口不存在。".to_string()))
}

async fn api_track_playinfo_get(
    State(state): State<AppState>,
    Query(query): Query<HashMap<String, String>>,
) -> Result<Json<Value>, ApiError> {
    let track_id = query
        .get("id")
        .map_or("", String::as_str)
        .trim()
        .to_string();
    let level = query
        .get("level")
        .map_or("lossless", String::as_str)
        .trim()
        .to_string();

    if track_id.is_empty() || !track_id.chars().all(|c| c.is_ascii_digit()) {
        return Err(ApiError::BadRequest("请提供有效的歌曲 ID。".to_string()));
    }

    match fetch_track_play_info(&state, &track_id, &level).await {
        Ok(payload) => Ok(Json(payload)),
        Err(UpstreamError::Http(code)) => Err(ApiError::BadGateway(format!(
            "播放接口请求失败，状态码 {code}。"
        ))),
        Err(UpstreamError::Network) => Err(ApiError::BadGateway(
            "无法连接到 api-enhanced 服务，请检查是否已启动。".to_string(),
        )),
        Err(UpstreamError::Other(msg)) => Err(ApiError::BadGateway(msg)),
    }
}

async fn api_netease_login_status_get(
    State(state): State<AppState>,
) -> Result<Json<Value>, ApiError> {
    match fetch_login_status(&state).await {
        Ok(mut payload) => {
            let has_saved_cookie = load_cookie(&state.paths.cookie_file)
                .await
                .map_or(false, |v| !v.is_empty());
            payload["has_saved_cookie"] = json!(has_saved_cookie);
            Ok(Json(payload))
        }
        Err(UpstreamError::Http(code)) => Err(ApiError::BadGateway(format!(
            "网易云登录状态接口请求失败，状态码 {code}。"
        ))),
        Err(UpstreamError::Network) => Err(ApiError::BadGateway(
            "无法连接到 api-enhanced 服务，请检查是否已启动。".to_string(),
        )),
        Err(UpstreamError::Other(msg)) => Err(ApiError::BadGateway(msg)),
    }
}

async fn api_netease_login_qr_get(State(state): State<AppState>) -> Result<Json<Value>, ApiError> {
    match create_qr_login_session(&state).await {
        Ok(payload) => Ok(Json(payload)),
        Err(UpstreamError::Http(code)) => Err(ApiError::BadGateway(format!(
            "获取登录二维码失败，状态码 {code}。"
        ))),
        Err(UpstreamError::Network) => Err(ApiError::BadGateway(
            "无法连接到 api-enhanced 服务，请检查是否已启动。".to_string(),
        )),
        Err(UpstreamError::Other(msg)) => Err(ApiError::BadGateway(msg)),
    }
}

async fn api_netease_login_check_get(
    State(state): State<AppState>,
    Query(query): Query<HashMap<String, String>>,
) -> Result<Json<Value>, ApiError> {
    let key = query
        .get("key")
        .map_or("", String::as_str)
        .trim()
        .to_string();
    if key.is_empty() {
        return Err(ApiError::BadRequest("缺少登录二维码 key。".to_string()));
    }

    match check_qr_login_status(&state, &key).await {
        Ok(payload) => Ok(Json(payload)),
        Err(UpstreamError::Http(code)) => Err(ApiError::BadGateway(format!(
            "检查登录状态失败，状态码 {code}。"
        ))),
        Err(UpstreamError::Network) => Err(ApiError::BadGateway(
            "无法连接到 api-enhanced 服务，请检查是否已启动。".to_string(),
        )),
        Err(UpstreamError::Other(msg)) => Err(ApiError::BadGateway(msg)),
    }
}

async fn api_admin_session_get(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let authenticated = is_admin_authenticated(&state, &headers).await;
    Ok(Json(json!({ "authenticated": authenticated })))
}

async fn api_admin_login_post(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Response<Body>, ApiError> {
    let expected_password = load_admin_password(&state.paths.admin_password_file)
        .await
        .map_err(|err| ApiError::Internal(format!("读取后台密码失败: {err}")))?;

    let ok = payload
        .password
        .as_bytes()
        .ct_eq(expected_password.as_bytes())
        .unwrap_u8()
        == 1;
    if !ok {
        return Err(ApiError::Unauthorized("密码错误。".to_string()));
    }

    let session_token = generate_session_token();
    state.sessions.write().await.insert(session_token.clone());

    let body = Json(json!({
        "message": "登录成功。",
        "authenticated": true
    }))
    .into_response();
    let mut response = Response::new(body.into_body());
    *response.status_mut() = StatusCode::OK;
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&format!(
            "{ADMIN_SESSION_COOKIE}={session_token}; HttpOnly; Path=/; SameSite=Lax"
        ))
        .map_err(|err| ApiError::Internal(format!("设置登录 Cookie 失败: {err}")))?,
    );
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/json; charset=utf-8"),
    );
    Ok(response)
}

async fn api_admin_logout_post(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Response<Body>, ApiError> {
    if let Some(token) = extract_cookie_value(&headers, ADMIN_SESSION_COOKIE) {
        state.sessions.write().await.remove(&token);
    }

    let body = Json(json!({
        "message": "已退出登录。",
        "authenticated": false
    }))
    .into_response();
    let mut response = Response::new(body.into_body());
    *response.status_mut() = StatusCode::OK;
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_static("admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"),
    );
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/json; charset=utf-8"),
    );
    Ok(response)
}

async fn api_admin_cookie_get(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    require_admin_auth(&state, &headers).await?;
    let cookie_value = load_cookie(&state.paths.cookie_file)
        .await
        .unwrap_or_default();
    Ok(Json(json!({
        "has_cookie": !cookie_value.is_empty(),
        "length": cookie_value.chars().count()
    })))
}

async fn api_admin_cookie_post(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<CookieRequest>,
) -> Result<Json<Value>, ApiError> {
    require_admin_auth(&state, &headers).await?;
    let cookie_value = payload.cookie.trim().to_string();
    if cookie_value.is_empty() {
        return Err(ApiError::BadRequest("Cookie 内容不能为空。".to_string()));
    }

    persist_netease_cookie(&state.paths, &cookie_value)
        .await
        .map_err(|err| ApiError::Internal(format!("写入 Cookie 失败: {err}")))?;

    Ok(Json(json!({
        "message": "Cookie 已更新。",
        "has_cookie": true,
        "length": cookie_value.chars().count()
    })))
}

async fn serve_index(State(state): State<AppState>) -> Result<Response<Body>, ApiError> {
    serve_static_file(&state.paths.static_dir, "index.html").await
}

async fn serve_admin(State(state): State<AppState>) -> Result<Response<Body>, ApiError> {
    serve_static_file(&state.paths.static_dir, "admin.html").await
}

async fn serve_static(
    State(state): State<AppState>,
    AxumPath(path): AxumPath<String>,
) -> Result<Response<Body>, ApiError> {
    let relative = path.trim_start_matches('/').to_string();
    serve_static_file(&state.paths.static_dir, &relative).await
}

async fn serve_static_file(
    static_dir: &Path,
    relative_path: &str,
) -> Result<Response<Body>, ApiError> {
    let normalized_relative = if relative_path.is_empty() {
        "index.html"
    } else {
        relative_path
    };
    let target = static_dir.join(normalized_relative);
    let canonical_static = fs::canonicalize(static_dir)
        .await
        .map_err(|_| ApiError::NotFound("文件不存在。".to_string()))?;
    let canonical_target = fs::canonicalize(&target)
        .await
        .map_err(|_| ApiError::NotFound("文件不存在。".to_string()))?;

    if !canonical_target.starts_with(&canonical_static) {
        return Err(ApiError::NotFound("文件不存在。".to_string()));
    }

    let data = fs::read(&canonical_target)
        .await
        .map_err(|_| ApiError::NotFound("文件不存在。".to_string()))?;
    let content_type = from_path(&canonical_target)
        .first_or_octet_stream()
        .to_string();

    let mut response = Response::new(Body::from(data));
    *response.status_mut() = StatusCode::OK;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_str(&content_type)
            .map_err(|err| ApiError::Internal(format!("写入响应头失败: {err}")))?,
    );
    Ok(response)
}

async fn require_admin_auth(state: &AppState, headers: &HeaderMap) -> Result<(), ApiError> {
    if is_admin_authenticated(state, headers).await {
        Ok(())
    } else {
        Err(ApiError::Unauthorized("请先登录后台。".to_string()))
    }
}

async fn is_admin_authenticated(state: &AppState, headers: &HeaderMap) -> bool {
    if let Some(token) = extract_cookie_value(headers, ADMIN_SESSION_COOKIE) {
        let sessions = state.sessions.read().await;
        sessions.contains(&token)
    } else {
        false
    }
}

fn extract_cookie_value(headers: &HeaderMap, name: &str) -> Option<String> {
    let cookie_header = headers.get(header::COOKIE)?.to_str().ok()?;
    for part in cookie_header.split(';') {
        let trimmed = part.trim();
        if let Some((key, value)) = trimmed.split_once('=') {
            if key.trim() == name {
                return Some(value.trim().to_string());
            }
        }
    }
    None
}

fn generate_session_token() -> String {
    let mut bytes = [0_u8; 24];
    rand::thread_rng().fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

async fn ensure_file(path: &Path, default_content: &str) -> Result<(), String> {
    if fs::metadata(path).await.is_ok() {
        return Ok(());
    }
    fs::write(path, default_content)
        .await
        .map_err(|err| err.to_string())
}

async fn load_cookie(path: &Path) -> Result<String, String> {
    match fs::read_to_string(path).await {
        Ok(raw) => Ok(raw.trim().to_string()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
        Err(err) => Err(err.to_string()),
    }
}

async fn save_cookie(path: &Path, raw_cookie: &str) -> Result<(), String> {
    fs::write(path, raw_cookie.trim())
        .await
        .map_err(|err| err.to_string())
}

async fn sync_api_enhanced_env_cookie(env_path: &Path, raw_cookie: &str) -> Result<(), String> {
    if fs::metadata(env_path).await.is_err() {
        return Ok(());
    }
    let cookie_value = raw_cookie.trim();
    let raw = fs::read_to_string(env_path)
        .await
        .map_err(|err| err.to_string())?;
    let mut lines: Vec<String> = raw.lines().map(|v| v.to_string()).collect();
    let mut updated = false;
    for line in &mut lines {
        if line.starts_with("NETEASE_COOKIE=") {
            *line = format!("NETEASE_COOKIE={cookie_value}");
            updated = true;
            break;
        }
    }
    if !updated {
        lines.push(format!("NETEASE_COOKIE={cookie_value}"));
    }
    let content = format!("{}\n", lines.join("\n"));
    fs::write(env_path, content)
        .await
        .map_err(|err| err.to_string())
}

async fn persist_netease_cookie(paths: &AppPaths, raw_cookie: &str) -> Result<(), String> {
    save_cookie(&paths.cookie_file, raw_cookie).await?;
    sync_api_enhanced_env_cookie(&paths.api_enhanced_env_file, raw_cookie).await
}

async fn load_admin_password(path: &Path) -> Result<String, String> {
    ensure_file(path, DEFAULT_ADMIN_PASSWORD).await?;
    let raw = fs::read_to_string(path)
        .await
        .map_err(|err| err.to_string())?;
    Ok(raw.trim().trim_start_matches('\u{feff}').to_string())
}

async fn load_api_enhanced_base(path: &Path) -> Result<String, String> {
    ensure_file(path, DEFAULT_API_ENHANCED_BASE).await?;
    let raw = fs::read_to_string(path)
        .await
        .map_err(|err| err.to_string())?;
    Ok(raw.trim().trim_end_matches('/').to_string())
}

async fn fetch_json_url(state: &AppState, url: &str) -> Result<Value, UpstreamError> {
    let cookie = load_cookie(&state.paths.cookie_file)
        .await
        .unwrap_or_default();
    let mut request = state
        .client
        .get(url)
        .header(header::USER_AGENT, USER_AGENT)
        .header(header::REFERER, "https://music.163.com/")
        .header(header::ACCEPT, "application/json, text/plain, */*");
    if !cookie.is_empty() {
        request = request.header(header::COOKIE, cookie);
    }

    let response = request.send().await.map_err(map_reqwest_error)?;
    if !response.status().is_success() {
        return Err(UpstreamError::Http(response.status().as_u16()));
    }
    response
        .json::<Value>()
        .await
        .map_err(|err| UpstreamError::Other(format!("解析上游 JSON 失败: {err}")))
}

async fn fetch_api_enhanced_json(
    state: &AppState,
    path_with_query: &str,
) -> Result<Value, UpstreamError> {
    let base = load_api_enhanced_base(&state.paths.api_enhanced_base_file)
        .await
        .map_err(UpstreamError::Other)?;
    fetch_json_url(state, &format!("{base}{path_with_query}")).await
}

fn append_query_param(path_with_query: &str, key: &str, value: &str) -> String {
    let sep = if path_with_query.contains('?') {
        "&"
    } else {
        "?"
    };
    format!("{path_with_query}{sep}{key}={}", urlencoding::encode(value))
}

fn normalize_playlist_input(raw_value: &str) -> Result<String, String> {
    let value = raw_value.trim();
    if value.is_empty() {
        return Err("请输入歌单 ID 或网易云歌单链接。".to_string());
    }
    if value.chars().all(|c| c.is_ascii_digit()) {
        return Ok(value.to_string());
    }

    let parsed = Url::parse(value).or_else(|_| Url::parse(&format!("https://{value}")));
    let parsed = match parsed {
        Ok(url) => url,
        Err(_) => {
            return Err("无法识别输入内容，请输入歌单 ID 或包含 id 参数的歌单链接。".to_string());
        }
    };

    if let Some((_, id)) = parsed.query_pairs().find(|(k, _)| k == "id") {
        let id = id.trim();
        if id.chars().all(|c| c.is_ascii_digit()) {
            return Ok(id.to_string());
        }
    }

    let fragment = parsed.fragment().unwrap_or_default();
    if let Some((_, fragment_query)) = fragment.split_once('?') {
        let pairs = url::form_urlencoded::parse(fragment_query.as_bytes());
        for (k, v) in pairs {
            if k == "id" {
                let candidate = v.trim();
                if candidate.chars().all(|c| c.is_ascii_digit()) {
                    return Ok(candidate.to_string());
                }
            }
        }
    }

    let path = parsed.path();
    if path.contains("/playlist/") {
        if let Some(last) = path.trim_end_matches('/').rsplit('/').next() {
            if last.chars().all(|c| c.is_ascii_digit()) {
                return Ok(last.to_string());
            }
        }
    }

    Err("无法识别输入内容，请输入歌单 ID 或包含 id 参数的歌单链接。".to_string())
}

async fn fetch_track_details(
    state: &AppState,
    track_ids: &[i64],
) -> Result<Vec<Value>, UpstreamError> {
    let mut tracks = Vec::new();
    for group in track_ids.chunks(100) {
        if group.is_empty() {
            continue;
        }
        let ids_json =
            serde_json::to_string(group).map_err(|err| UpstreamError::Other(err.to_string()))?;
        let api_url = format!(
            "https://music.163.com/api/song/detail/?id={}&ids={}",
            group[0],
            urlencoding::encode(&ids_json)
        );
        let data = fetch_json_url(state, &api_url).await?;
        if let Some(songs) = data.get("songs").and_then(Value::as_array) {
            tracks.extend(songs.iter().cloned());
        }
    }
    Ok(tracks)
}

async fn resolve_playlist_tracks(
    state: &AppState,
    playlist: &Value,
) -> Result<Vec<Value>, UpstreamError> {
    let preview_tracks = playlist
        .get("tracks")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let track_count = playlist
        .get("trackCount")
        .and_then(Value::as_i64)
        .unwrap_or(preview_tracks.len() as i64);
    if preview_tracks.len() as i64 >= track_count {
        return Ok(preview_tracks);
    }

    let mut track_ids = Vec::new();
    if let Some(ids) = playlist.get("trackIds").and_then(Value::as_array) {
        for item in ids {
            if let Some(id) = item.get("id").and_then(Value::as_i64) {
                track_ids.push(id);
            }
        }
    }
    if track_ids.is_empty() {
        return Ok(preview_tracks);
    }

    let full_tracks = fetch_track_details(state, &track_ids).await?;
    if full_tracks.is_empty() {
        Ok(preview_tracks)
    } else {
        Ok(full_tracks)
    }
}

fn normalize_track(track: &Value, index: usize) -> Value {
    let artists = track
        .get("ar")
        .and_then(Value::as_array)
        .or_else(|| track.get("artists").and_then(Value::as_array))
        .map(|arr| {
            arr.iter()
                .filter_map(|item| item.get("name").and_then(Value::as_str))
                .filter(|name| !name.is_empty())
                .map(|name| name.to_string())
                .collect::<Vec<String>>()
        })
        .unwrap_or_default();

    let album = track
        .get("al")
        .or_else(|| track.get("album"))
        .cloned()
        .unwrap_or_else(|| json!({}));

    json!({
        "index": index,
        "id": track.get("id").cloned().unwrap_or(Value::Null),
        "name": track.get("name").cloned().unwrap_or_else(|| json!("")),
        "artists": artists,
        "album": album.get("name").and_then(Value::as_str).unwrap_or(""),
        "cover_img_url": album.get("picUrl").and_then(Value::as_str).unwrap_or(""),
        "duration_ms": track.get("dt").and_then(Value::as_i64).or_else(|| track.get("duration").and_then(Value::as_i64)).unwrap_or(0),
    })
}

async fn fetch_playlist(state: &AppState, playlist_id: &str) -> Result<Value, UpstreamError> {
    let api_url = format!(
        "https://music.163.com/api/v6/playlist/detail?id={}",
        urlencoding::encode(playlist_id)
    );
    let data = fetch_json_url(state, &api_url).await?;
    let code = data.get("code").and_then(Value::as_i64);
    if let Some(code_value) = code {
        if code_value != 200 {
            let msg = data
                .get("message")
                .and_then(Value::as_str)
                .unwrap_or("网易云接口返回异常。")
                .to_string();
            return Err(UpstreamError::Other(msg));
        }
    }

    let playlist = data
        .get("playlist")
        .or_else(|| data.get("result"))
        .cloned()
        .ok_or_else(|| {
            UpstreamError::Other("未找到歌单信息，请确认歌单 ID 是否正确。".to_string())
        })?;

    let tracks = resolve_playlist_tracks(state, &playlist).await?;
    let track_items: Vec<Value> = tracks
        .iter()
        .enumerate()
        .map(|(idx, track)| normalize_track(track, idx + 1))
        .collect();

    let creator = playlist
        .get("creator")
        .cloned()
        .unwrap_or_else(|| json!({}));
    Ok(json!({
        "playlist": {
            "id": playlist.get("id").cloned().unwrap_or(Value::Null),
            "name": playlist.get("name").cloned().unwrap_or_else(|| json!("")),
            "cover_img_url": playlist.get("coverImgUrl").and_then(Value::as_str).unwrap_or(""),
            "description": playlist.get("description").and_then(Value::as_str).unwrap_or(""),
            "track_count": playlist.get("trackCount").and_then(Value::as_i64).unwrap_or(track_items.len() as i64),
            "play_count": playlist.get("playCount").and_then(Value::as_i64).unwrap_or(0),
            "creator": creator.get("nickname").and_then(Value::as_str).unwrap_or(""),
            "tracks": track_items,
        }
    }))
}

async fn fetch_track_play_info(
    state: &AppState,
    track_id: &str,
    level: &str,
) -> Result<Value, UpstreamError> {
    let safe_level = match level {
        "standard" | "higher" | "exhigh" | "lossless" => level,
        _ => "lossless",
    };
    let api_path = format!(
        "/song/url/v1?id={}&level={}",
        urlencoding::encode(track_id),
        urlencoding::encode(safe_level)
    );
    let data = fetch_api_enhanced_json(state, &api_path).await?;
    let songs = data
        .get("data")
        .and_then(Value::as_array)
        .ok_or_else(|| UpstreamError::Other("未获取到歌曲播放信息。".to_string()))?;
    let song = songs
        .first()
        .ok_or_else(|| UpstreamError::Other("未获取到歌曲播放信息。".to_string()))?;
    let play_url = song.get("url").and_then(Value::as_str).ok_or_else(|| {
        UpstreamError::Other("当前歌曲暂时没有可用播放地址，可能受版权或账号权限限制。".to_string())
    })?;

    Ok(json!({
        "id": song.get("id").cloned().unwrap_or(Value::Null),
        "url": play_url,
        "level": song.get("level").cloned().or_else(|| song.get("br").cloned()).unwrap_or(Value::Null),
        "size": song.get("size").cloned().unwrap_or(Value::Null),
        "requested_level": safe_level,
    }))
}

async fn fetch_login_status(state: &AppState) -> Result<Value, UpstreamError> {
    let cookie_value = load_cookie(&state.paths.cookie_file)
        .await
        .unwrap_or_default();
    if cookie_value.is_empty() {
        return Ok(json!({
            "logged_in": false,
            "nickname": "",
            "user_id": Value::Null,
            "avatar_url": "",
        }));
    }
    let path = append_query_param("/user/account", "cookie", &cookie_value);
    let data = fetch_api_enhanced_json(state, &path).await?;
    let account = data.get("account").cloned().unwrap_or(Value::Null);
    let profile = data.get("profile").cloned().unwrap_or(Value::Null);
    let logged_in = account.is_object() && profile.is_object();
    Ok(json!({
        "logged_in": logged_in,
        "nickname": profile.get("nickname").and_then(Value::as_str).unwrap_or(""),
        "user_id": account.get("id").cloned().unwrap_or(Value::Null),
        "avatar_url": profile.get("avatarUrl").and_then(Value::as_str).unwrap_or(""),
    }))
}

async fn create_qr_login_session(state: &AppState) -> Result<Value, UpstreamError> {
    let timestamp = Utc::now().timestamp_millis();
    let key_data =
        fetch_api_enhanced_json(state, &format!("/login/qr/key?timestamp={timestamp}")).await?;
    let unikey = key_data
        .get("data")
        .and_then(|v| v.get("unikey"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    if unikey.is_empty() {
        return Err(UpstreamError::Other("未获取到登录二维码密钥。".to_string()));
    }

    let qr_data = fetch_api_enhanced_json(
        state,
        &format!(
            "/login/qr/create?key={}&qrimg=true&timestamp={timestamp}",
            urlencoding::encode(&unikey)
        ),
    )
    .await?;
    let qrimg = qr_data
        .get("data")
        .and_then(|v| v.get("qrimg"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    let qrurl = qr_data
        .get("data")
        .and_then(|v| v.get("qrurl"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    if qrimg.is_empty() {
        return Err(UpstreamError::Other("未生成登录二维码。".to_string()));
    }

    Ok(json!({
        "key": unikey,
        "qrimg": qrimg,
        "qrurl": qrurl,
    }))
}

async fn check_qr_login_status(state: &AppState, key: &str) -> Result<Value, UpstreamError> {
    let timestamp = Utc::now().timestamp_millis();
    let data = fetch_api_enhanced_json(
        state,
        &format!(
            "/login/qr/check?key={}&timestamp={timestamp}",
            urlencoding::encode(key)
        ),
    )
    .await?;
    let code = data.get("code").and_then(Value::as_i64).unwrap_or(0);
    let cookie_value = data
        .get("cookie")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    if code == 803 && !cookie_value.is_empty() {
        persist_netease_cookie(&state.paths, &cookie_value)
            .await
            .map_err(UpstreamError::Other)?;
        let login_status = fetch_login_status(state).await?;
        return Ok(json!({
            "code": code,
            "message": data.get("message").and_then(Value::as_str).unwrap_or("授权登录成功。"),
            "authorized": true,
            "saved_cookie": true,
            "login_status": login_status,
        }));
    }

    Ok(json!({
        "code": code,
        "message": data.get("message").and_then(Value::as_str).unwrap_or("等待扫码。"),
        "authorized": false,
        "saved_cookie": false,
    }))
}

fn map_reqwest_error(err: reqwest::Error) -> UpstreamError {
    if let Some(status) = err.status() {
        return UpstreamError::Http(status.as_u16());
    }
    if err.is_connect() || err.is_timeout() {
        return UpstreamError::Network;
    }
    UpstreamError::Other(err.to_string())
}
