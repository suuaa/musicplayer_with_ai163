const form = document.querySelector("#playlist-form");
const input = document.querySelector("#playlist-id");
const statusNode = document.querySelector("#status");
const playlistCard = document.querySelector("#playlist-card");
const cover = document.querySelector("#cover");
const playlistName = document.querySelector("#playlist-name");
const playlistDesc = document.querySelector("#playlist-desc");
const creator = document.querySelector("#creator");
const playCount = document.querySelector("#play-count");
const trackCount = document.querySelector("#track-count");
const resultCount = document.querySelector("#result-count");
const tracksBody = document.querySelector("#tracks-body");
const pageSizeSelect = document.querySelector("#page-size");
const pageSummary = document.querySelector("#page-summary");
const pageIndicator = document.querySelector("#page-indicator");
const prevPageButton = document.querySelector("#prev-page");
const nextPageButton = document.querySelector("#next-page");
const trackModal = document.querySelector("#track-modal");
const closeTrackModalButton = document.querySelector("#close-track-modal");
const trackDetailCover = document.querySelector("#track-detail-cover");
const trackDetailName = document.querySelector("#track-detail-name");
const trackDetailSubtitle = document.querySelector("#track-detail-subtitle");
const trackDetailArtist = document.querySelector("#track-detail-artist");
const trackDetailAlbum = document.querySelector("#track-detail-album");
const trackDetailDuration = document.querySelector("#track-detail-duration");
const trackDetailId = document.querySelector("#track-detail-id");
const playTrackButton = document.querySelector("#play-track-button");
const playerStatus = document.querySelector("#player-status");
const trackAudio = document.querySelector("#track-audio");
const qualitySelect = document.querySelector("#quality-select");
const playerDock = document.querySelector("#player-dock");
const dockCover = document.querySelector("#dock-cover");
const dockTitle = document.querySelector("#dock-title");
const dockSubtitle = document.querySelector("#dock-subtitle");
const dockPrevButton = document.querySelector("#dock-prev");
const dockPlayToggleButton = document.querySelector("#dock-play-toggle");
const dockNextButton = document.querySelector("#dock-next");
const dockQualitySelect = document.querySelector("#dock-quality-select");
const dockProgress = document.querySelector("#dock-progress");
const dockCurrentTime = document.querySelector("#dock-current-time");
const dockDuration = document.querySelector("#dock-duration");
const openPlayerModalButton = document.querySelector("#open-player-modal");
const dockOpenPlayerButton = document.querySelector("#dock-open-player");
const playerModal = document.querySelector("#player-modal");
const closePlayerModalButton = document.querySelector("#close-player-modal");
const modalPlayerCover = document.querySelector("#modal-player-cover");
const modalPlayerPlaylist = document.querySelector("#modal-player-playlist");
const modalPlayerTrackTitle = document.querySelector("#modal-player-track-title");
const modalPlayerSubtitle = document.querySelector("#modal-player-subtitle");
const modalPlayerStatus = document.querySelector("#modal-player-status");
const modalPlayerPrevButton = document.querySelector("#modal-player-prev");
const modalPlayerPlayButton = document.querySelector("#modal-player-play");
const modalPlayerNextButton = document.querySelector("#modal-player-next");
const modalPlayerQualitySelect = document.querySelector("#modal-player-quality");
const modalPlayerCount = document.querySelector("#modal-player-count");
const modalPlayerTracks = document.querySelector("#modal-player-tracks");
const modalPlayerProgress = document.querySelector("#modal-player-progress");
const modalPlayerCurrentTime = document.querySelector("#modal-player-current-time");
const modalPlayerDuration = document.querySelector("#modal-player-duration");
const playerLyrics = document.querySelector("#player-lyrics");
const playerLyricsEmpty = document.querySelector("#player-lyrics-empty");
const playerLyricsLines = document.querySelector("#player-lyrics-lines");
const openLoginModalButton = document.querySelector("#open-login-modal");
const neteaseLoginIndicator = document.querySelector("#netease-login-indicator");
const neteaseLoginAvatar = document.querySelector("#netease-login-avatar");
const loginModal = document.querySelector("#login-modal");
const closeLoginModalButton = document.querySelector("#close-login-modal");
const loginQrImage = document.querySelector("#login-qr-image");
const loginQrPlaceholder = document.querySelector("#login-qr-placeholder");
const loginUserStatus = document.querySelector("#login-user-status");
const loginActionStatus = document.querySelector("#login-action-status");
const loginQrStatus = document.querySelector("#login-qr-status");
const loginModePassword = document.querySelector("#login-mode-password");
const loginModeCaptcha = document.querySelector("#login-mode-captcha");
const loginPhoneInput = document.querySelector("#login-phone-input");
const loginPasswordInput = document.querySelector("#login-password-input");
const loginCaptchaInput = document.querySelector("#login-captcha-input");
const loginPasswordLabel = document.querySelector('label[for="login-password-input"]');
const loginCaptchaLabel = document.querySelector('label[for="login-captcha-input"]');
const loginSubmitButton = document.querySelector("#login-submit");
const accountPopover = document.querySelector("#account-popover");
const accountPopoverStatus = document.querySelector("#account-popover-status");
const accountOpenQrLoginButton = document.querySelector("#account-open-qr-login");
const scrollTopButton = document.querySelector("#scroll-top-button");
const topSearchForm = document.querySelector("#top-search-form");
const topSearchKeywords = document.querySelector("#top-search-keywords");
const topSearchType = document.querySelector("#top-search-type");
const searchStatus = document.querySelector("#search-status");
const searchResultsBody = document.querySelector("#search-results-body");
const discoverStatus = document.querySelector("#discover-status");
const discoverPlaylists = document.querySelector("#discover-playlists");
const settingsStatus = document.querySelector("#settings-status");
const settingsForm = document.querySelector("#settings-form");
const settingsApiBase = document.querySelector("#settings-api-base");
const settingsDefaultQuality = document.querySelector("#settings-default-quality");
const settingsUnlockFallback = document.querySelector("#settings-unlock-fallback");
const settingsLoginRegister = document.querySelector("#settings-login-register");
const settingsUserCenter = document.querySelector("#settings-user-center");
const settingsContentLibrary = document.querySelector("#settings-content-library");
const settingsSearchRecommend = document.querySelector("#settings-search-recommend");
const settingsFmSigninCloud = document.querySelector("#settings-fm-signin-cloud");
const reloadSettingsButton = document.querySelector("#reload-settings");
const featureStatus = document.querySelector("#feature-status");
const featureActionSelect = document.querySelector("#feature-action-select");
const featureForm = document.querySelector("#feature-form");
const featureParams = document.querySelector("#feature-params");
const featureResult = document.querySelector("#feature-result");
let scrollTopAnimationTimer = null;
const PLAYER_STATE_KEY = "music_player_state_v1";
let loginPollingTimer = null;
let loginQrRefreshTimer = null;
let activeLoginQrKey = "";
let loginStatusRequestId = 0;
let lyricTimeline = [];
let currentLyricIndex = -1;
let lyricRequestId = 0;
let currentFeatureSettings = null;
let lyricWordProgressIndex = -1;

const FEATURE_ACTIONS = [
  { key: "user_detail", label: "用户：用户信息", path: "/user/detail", enabledBy: "user_center_enabled", params: { uid: "" } },
  { key: "user_playlist", label: "用户：用户歌单", path: "/user/playlist", enabledBy: "user_center_enabled", params: { uid: "" } },
  { key: "user_event", label: "用户：用户动态", path: "/user/event", enabledBy: "user_center_enabled", params: { uid: "" } },
  { key: "user_record", label: "用户：播放记录", path: "/user/record", enabledBy: "user_center_enabled", params: { uid: "", type: "1" } },
  { key: "song_detail", label: "内容：歌曲详情", path: "/song/detail", enabledBy: "content_library_enabled", params: { ids: "" } },
  { key: "album_detail", label: "内容：专辑详情", path: "/album", enabledBy: "content_library_enabled", params: { id: "" } },
  { key: "artist_detail", label: "内容：歌手详情", path: "/artist/detail", enabledBy: "content_library_enabled", params: { id: "" } },
  { key: "mv_url", label: "内容：MV 地址", path: "/mv/url", enabledBy: "content_library_enabled", params: { id: "" } },
  { key: "lyric", label: "内容：歌词", path: "/lyric", enabledBy: "content_library_enabled", params: { id: "" } },
  { key: "comment_music", label: "内容：歌曲评论", path: "/comment/music", enabledBy: "content_library_enabled", params: { id: "" } },
  { key: "toplist", label: "内容：排行榜", path: "/toplist/detail", enabledBy: "content_library_enabled", params: {} },
  { key: "search", label: "发现：搜索", path: "/search", enabledBy: "search_recommend_enabled", params: { keywords: "", limit: "30", offset: "0" } },
  { key: "recommend_resource", label: "发现：推荐歌单", path: "/recommend/resource", enabledBy: "search_recommend_enabled", params: {} },
  { key: "recommend_songs", label: "发现：推荐歌曲", path: "/recommend/songs", enabledBy: "search_recommend_enabled", params: {} },
  { key: "personal_fm", label: "发现：私人 FM", path: "/personal_fm", enabledBy: "fm_signin_cloud_enabled", params: {} },
  { key: "daily_signin", label: "发现：每日签到", path: "/daily_signin", enabledBy: "fm_signin_cloud_enabled", params: { type: "0" } },
  { key: "user_cloud", label: "发现：云盘", path: "/user/cloud", enabledBy: "fm_signin_cloud_enabled", params: { limit: "30", offset: "0" } },
  { key: "unlock_song_url", label: "解灰：歌曲地址", path: "/song/url/v1", enabledBy: "content_library_enabled", params: { id: "", level: "lossless" } },
];

const paginationState = {
  tracks: [],
  pageSize: Number(pageSizeSelect.value),
  currentPage: 1,
  selectedTrackId: null,
  loadedTrackId: null,
  qualityLevel: "lossless",
  playlist: null,
};

function syncModalScrollLock() {
  const hasOpenModal =
    !trackModal.classList.contains("hidden") ||
    !playerModal.classList.contains("hidden") ||
    !loginModal.classList.contains("hidden");
  document.body.classList.toggle("modal-open", hasOpenModal);
  document.documentElement.classList.toggle("modal-open-root", hasOpenModal);
}

function stopLoginPolling() {
  if (loginPollingTimer) {
    window.clearInterval(loginPollingTimer);
    loginPollingTimer = null;
  }
}

function stopLoginQrRefreshTimer() {
  if (loginQrRefreshTimer) {
    window.clearTimeout(loginQrRefreshTimer);
    loginQrRefreshTimer = null;
  }
}

function updateLoginIndicator(statusData) {
  if (statusData?.logged_in) {
    neteaseLoginIndicator.textContent = statusData.nickname || "网易云用户";
    accountPopoverStatus.textContent = `已登录：${statusData.nickname || "网易云用户"}`;
    openLoginModalButton.classList.add("is-success");
    if (statusData.avatar_url) {
      neteaseLoginAvatar.src = statusData.avatar_url;
      neteaseLoginAvatar.alt = `${statusData.nickname || "网易云用户"} 头像`;
      neteaseLoginAvatar.classList.remove("hidden");
    } else {
      neteaseLoginAvatar.removeAttribute("src");
      neteaseLoginAvatar.classList.add("hidden");
    }
  } else {
    neteaseLoginIndicator.textContent = "网易云登录";
    accountPopoverStatus.textContent = "未登录，打开登录中心继续";
    openLoginModalButton.classList.remove("is-success");
    neteaseLoginAvatar.removeAttribute("src");
    neteaseLoginAvatar.classList.add("hidden");
  }
}

async function fetchNeteaseLoginStatus() {
  const response = await fetch("/api/netease-login/status");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "获取登录状态失败。");
  }
  return data;
}

async function fetchLoginQrSession() {
  const response = await fetch("/api/netease-login/qr");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "生成登录二维码失败。");
  }
  return data;
}

async function checkLoginQrStatus(key) {
  const response = await fetch(`/api/netease-login/check?key=${encodeURIComponent(key)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "检查登录状态失败。");
  }
  return data;
}

async function fetchDiscoverPlaylists() {
  const response = await fetch("/api/discover/recommend");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "获取发现页失败。");
  }
  return data;
}

async function fetchSearchResults(keywords, type) {
  const response = await fetch(`/api/search?keywords=${encodeURIComponent(keywords)}&type=${encodeURIComponent(type)}&limit=30`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "搜索失败。");
  }
  return data;
}

async function fetchFeatureSettings() {
  const response = await fetch("/api/settings");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "获取设置失败。");
  }
  return data;
}

async function saveFeatureSettings(payload) {
  const response = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "保存设置失败。");
  }
  return data;
}

async function callFeatureApi(path, params = {}, method = "GET") {
  const response = await fetch("/api/features/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      method,
      params,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "功能调用失败。");
  }
  return data;
}

function renderFeatureActionOptions() {
  featureActionSelect.innerHTML = FEATURE_ACTIONS
    .map((item) => {
      const disabled = currentFeatureSettings && item.enabledBy && currentFeatureSettings[item.enabledBy] === false;
      return `<option value="${item.key}" ${disabled ? "disabled" : ""}>${item.label}${disabled ? "（已禁用）" : ""}</option>`;
    })
    .join("");
}

function setFeatureParamTemplate() {
  const selected = FEATURE_ACTIONS.find((item) => item.key === featureActionSelect.value);
  if (!selected) {
    featureParams.value = "{}";
    return;
  }
  featureParams.value = JSON.stringify(selected.params || {}, null, 2);
}

function fillSettingsForm(settings) {
  settingsApiBase.value = settings.api_base || "";
  settingsDefaultQuality.value = settings.default_quality || "lossless";
  settingsUnlockFallback.checked = Boolean(settings.unlock_fallback_enabled);
  settingsLoginRegister.checked = Boolean(settings.login_register_enabled);
  settingsUserCenter.checked = Boolean(settings.user_center_enabled);
  settingsContentLibrary.checked = Boolean(settings.content_library_enabled);
  settingsSearchRecommend.checked = Boolean(settings.search_recommend_enabled);
  settingsFmSigninCloud.checked = Boolean(settings.fm_signin_cloud_enabled);
}

function collectSettingsForm() {
  return {
    api_base: settingsApiBase.value.trim(),
    default_quality: settingsDefaultQuality.value,
    unlock_fallback_enabled: settingsUnlockFallback.checked,
    login_register_enabled: settingsLoginRegister.checked,
    user_center_enabled: settingsUserCenter.checked,
    content_library_enabled: settingsContentLibrary.checked,
    search_recommend_enabled: settingsSearchRecommend.checked,
    fm_signin_cloud_enabled: settingsFmSigninCloud.checked,
  };
}

function toggleAccountPopover(forceVisible) {
  const shouldShow = typeof forceVisible === "boolean" ? forceVisible : accountPopover.classList.contains("hidden");
  accountPopover.classList.toggle("hidden", !shouldShow);
}

function getLoginFormValues() {
  return {
    phone: loginPhoneInput.value.trim(),
    password: loginPasswordInput.value.trim(),
    captcha: loginCaptchaInput.value.trim(),
  };
}

function getLoginMode() {
  return loginModeCaptcha.checked ? "captcha" : "password";
}

function updateLoginModeUI() {
  const mode = getLoginMode();
  const isPasswordMode = mode === "password";
  const isCaptchaMode = mode === "captcha";
  loginPasswordInput.classList.toggle("login-form-hidden", !isPasswordMode);
  loginCaptchaInput.classList.toggle("login-form-hidden", !isCaptchaMode);
  loginPasswordLabel.classList.toggle("login-form-hidden", !isPasswordMode);
  loginCaptchaLabel.classList.toggle("login-form-hidden", !isCaptchaMode);
  loginPasswordInput.disabled = !isPasswordMode;
  loginCaptchaInput.disabled = !isCaptchaMode;
  loginSubmitButton.textContent = isCaptchaMode ? "发送验证码 / 登录" : "密码登录";
  loginActionStatus.textContent = isCaptchaMode
    ? "验证码模式：首次点击发送验证码，填入验证码后再次点击登录。"
    : "密码模式：输入手机号和密码后登录。";
}

async function runLoginAction({ path, params, pending, successText }) {
  loginActionStatus.textContent = pending;
  try {
    const result = await callFeatureApi(path, params, "GET");
    const message = result?.message || successText;
    loginActionStatus.textContent = message;
    await refreshNeteaseLoginStatus();
  } catch (error) {
    loginActionStatus.textContent = error.message || "操作失败。";
  }
}

function renderDiscoverCards(payload) {
  const daily = Array.isArray(payload?.daily_recommend) ? payload.daily_recommend : [];
  const discover = Array.isArray(payload?.discover_playlists) ? payload.discover_playlists : [];
  const merged = [...daily, ...discover]
    .filter((item) => item && (item.id || item.name))
    .slice(0, 18);

  if (!merged.length) {
    discoverPlaylists.innerHTML = '<p class="empty">暂无推荐歌单（请先登录后重试）。</p>';
    return;
  }

  discoverPlaylists.innerHTML = merged
    .map((item) => {
      const id = item.id || "";
      const coverUrl = item.picUrl || item.coverImgUrl || "";
      const name = item.name || "未命名歌单";
      const reason = item.copywriter || item.rcmdtext || `ID: ${id}`;
      return `
        <article class="discover-card" data-playlist-id="${escapeHtml(id)}">
          <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(name)} 封面">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(reason)}</span>
        </article>
      `;
    })
    .join("");
}

function normalizeSearchRows(data, type) {
  const result = data?.result || {};
  if (type === "1") {
    const songs = Array.isArray(result.songs) ? result.songs : [];
    return songs.map((item) => ({
      name: item.name || "-",
      sub: `${(item.artists || []).map((v) => v.name).join(" / ") || "-"} · ${(item.album || {}).name || "-"}`,
      kind: "单曲",
    }));
  }
  if (type === "10") {
    const albums = Array.isArray(result.albums) ? result.albums : [];
    return albums.map((item) => ({
      name: item.name || "-",
      sub: `${(item.artist || {}).name || "-"} · ${item.publishTime || "-"}`,
      kind: "专辑",
    }));
  }
  if (type === "100") {
    const artists = Array.isArray(result.artists) ? result.artists : [];
    return artists.map((item) => ({
      name: item.name || "-",
      sub: `粉丝: ${item.fansSize || 0}`,
      kind: "歌手",
    }));
  }
  if (type === "1000") {
    const playlists = Array.isArray(result.playlists) ? result.playlists : [];
    return playlists.map((item) => ({
      name: item.name || "-",
      sub: `创建者: ${(item.creator || {}).nickname || "-"} · ${item.trackCount || 0} 首`,
      kind: "歌单",
    }));
  }
  const mvs = Array.isArray(result.mvs) ? result.mvs : [];
  return mvs.map((item) => ({
    name: item.name || "-",
    sub: `${item.artistName || "-"} · 播放 ${item.playCount || 0}`,
    kind: "MV",
  }));
}

function renderSearchRows(rows) {
  if (!rows.length) {
    searchResultsBody.innerHTML = '<tr><td colspan="3" class="empty">暂无搜索结果</td></tr>';
    return;
  }
  searchResultsBody.innerHTML = rows
    .map(
      (row) => `
      <tr>
        <td title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</td>
        <td title="${escapeHtml(row.sub)}">${escapeHtml(row.sub)}</td>
        <td>${escapeHtml(row.kind)}</td>
      </tr>
    `,
    )
    .join("");
}

async function loadDiscover() {
  discoverStatus.textContent = "正在加载推荐...";
  try {
    const payload = await fetchDiscoverPlaylists();
    renderDiscoverCards(payload);
    discoverStatus.textContent = "推荐已更新";
  } catch (error) {
    discoverPlaylists.innerHTML = '<p class="empty">发现页加载失败。</p>';
    discoverStatus.textContent = error.message || "发现页加载失败";
  }
}

function renderLoginQrState({ qrimg = "", message = "", showImage = false }) {
  if (showImage && qrimg) {
    loginQrImage.src = qrimg;
    loginQrImage.classList.remove("hidden");
    loginQrPlaceholder.classList.add("hidden");
  } else {
    loginQrImage.removeAttribute("src");
    loginQrImage.classList.add("hidden");
    loginQrPlaceholder.classList.remove("hidden");
  }

  if (message) {
    loginQrStatus.textContent = message;
  }
}

async function refreshNeteaseLoginStatus() {
  const requestId = ++loginStatusRequestId;
  try {
    const statusData = await fetchNeteaseLoginStatus();
    if (requestId !== loginStatusRequestId) {
      return statusData;
    }
    updateLoginIndicator(statusData);
    if (statusData.logged_in) {
      loginUserStatus.textContent = `当前已登录网易云账号：${statusData.nickname || "未知用户"}`;
      loadDiscover();
    } else {
      loginUserStatus.textContent = "当前未检测到网易云登录状态。";
    }
    return statusData;
  } catch (error) {
    if (requestId !== loginStatusRequestId) {
      return null;
    }
    updateLoginIndicator(null);
    loginUserStatus.textContent = error.message || "无法获取网易云登录状态。";
    return null;
  }
}

async function beginQrLogin() {
  stopLoginQrRefreshTimer();
  stopLoginPolling();
  renderLoginQrState({
    showImage: false,
    message: "正在生成二维码，请稍候...",
  });

  try {
    const qrSession = await fetchLoginQrSession();
    activeLoginQrKey = qrSession.key;
    renderLoginQrState({
      qrimg: qrSession.qrimg,
      showImage: true,
      message: "请打开网易云音乐 App 扫码，然后在手机上确认登录（5 分钟后自动刷新）。",
    });
    loginQrRefreshTimer = window.setTimeout(() => {
      if (!loginModal.classList.contains("hidden")) {
        beginQrLogin();
      }
    }, 5 * 60 * 1000);

    loginPollingTimer = window.setInterval(async () => {
      if (!activeLoginQrKey || loginModal.classList.contains("hidden")) {
        stopLoginPolling();
        return;
      }

      try {
        const result = await checkLoginQrStatus(activeLoginQrKey);
        if (result.code === 801) {
          loginQrStatus.textContent = result.message || "等待扫码。";
          return;
        }
        if (result.code === 802) {
          loginQrStatus.textContent = result.message || "已扫码，请在手机上确认登录。";
          return;
        }
        if (result.code === 800) {
          stopLoginPolling();
          activeLoginQrKey = "";
          loginQrStatus.textContent = result.message || "二维码已过期，正在自动刷新。";
          beginQrLogin();
          return;
        }
        if (result.code === 803 && result.saved_cookie) {
          stopLoginPolling();
          stopLoginQrRefreshTimer();
          activeLoginQrKey = "";
          renderLoginQrState({
            showImage: false,
            message: "登录成功，Cookie 已写入本地配置文件。",
          });
          const latestStatus = await refreshNeteaseLoginStatus();
          if (!latestStatus?.logged_in) {
            loginUserStatus.textContent = "登录成功，Cookie 已保存，状态正在同步中。";
          }
          return;
        }
        loginQrStatus.textContent = result.message || "等待扫码。";
      } catch (error) {
        stopLoginPolling();
        activeLoginQrKey = "";
        loginQrStatus.textContent = error.message || "登录轮询失败。";
      }
    }, 2000);
  } catch (error) {
    activeLoginQrKey = "";
    renderLoginQrState({
      showImage: false,
      message: error.message || "生成二维码失败。",
    });
  }
}

function openLoginModal() {
  loginModal.classList.remove("hidden");
  syncModalScrollLock();
  updateLoginModeUI();
  refreshNeteaseLoginStatus();
  beginQrLogin();
}

function closeLoginModal() {
  loginModal.classList.add("hidden");
  activeLoginQrKey = "";
  stopLoginPolling();
  stopLoginQrRefreshTimer();
  syncModalScrollLock();
}

function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatTimeSeconds(secondsValue) {
  const safeSeconds = Number.isFinite(secondsValue) ? Math.max(0, Math.floor(secondsValue)) : 0;
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatPlayCount(count) {
  return `播放量 ${Number(count || 0).toLocaleString("zh-CN")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTrackCoverUrl(track) {
  return track.cover_img_url || cover.src || "";
}

function getTrackAudioUrl(track) {
  return `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(track.id)}.mp3`;
}

async function fetchTrackPlayInfo(track) {
  const expectedDurationMs = Number(track?.duration_ms || 0);
  const response = await fetch(
    `/api/track/playinfo?id=${encodeURIComponent(track.id)}&level=${encodeURIComponent(paginationState.qualityLevel)}&expected_duration_ms=${encodeURIComponent(expectedDurationMs > 0 ? expectedDurationMs : "")}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "未能获取播放地址。");
  }
  return data;
}

async function fetchTrackLyric(track) {
  const response = await fetch(`/api/track/lyric?id=${encodeURIComponent(track.id)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "未能获取歌词。");
  }
  return data;
}

function parseLyricTimestamp(match) {
  const [minutePart, secondPart] = match.split(":");
  const minutes = Number(minutePart);
  const seconds = Number(secondPart);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }
  return minutes * 60 + seconds;
}

function parseLyricLines(rawLyric) {
  if (!rawLyric) {
    return [];
  }
  const rows = String(rawLyric).split(/\r?\n/);
  const timeline = [];
  for (const row of rows) {
    if (!row.trim()) {
      continue;
    }
    const matches = [...row.matchAll(/\[(\d{1,2}:\d{1,2}(?:\.\d{1,3})?)\]/g)];
    if (!matches.length) {
      continue;
    }
    const text = row.replace(/\[(\d{1,2}:\d{1,2}(?:\.\d{1,3})?)\]/g, "").trim();
    if (!text) {
      continue;
    }
    for (const matched of matches) {
      const timestamp = parseLyricTimestamp(matched[1]);
      if (timestamp !== null) {
        timeline.push({ time: timestamp, text });
      }
    }
  }
  timeline.sort((a, b) => a.time - b.time);
  return timeline;
}

function parseYrcLines(rawYrc) {
  if (!rawYrc) {
    return [];
  }
  const rows = String(rawYrc).split(/\r?\n/);
  const timeline = [];
  for (const row of rows) {
    const lineMatch = row.match(/^\[(\d{1,2}:\d{1,2}(?:\.\d{1,3})?)\](.*)$/);
    if (!lineMatch) {
      continue;
    }
    const time = parseLyricTimestamp(lineMatch[1]);
    if (time === null) {
      continue;
    }
    const words = [];
    const tokenRegex = /\((\d+),(\d+),\d+\)([^()]+)/g;
    let token;
    while ((token = tokenRegex.exec(lineMatch[2])) !== null) {
      const startMs = Number(token[1]);
      const durationMs = Number(token[2]);
      const text = token[3];
      if (Number.isFinite(startMs) && Number.isFinite(durationMs) && text) {
        words.push({ startMs, durationMs, text });
      }
    }
    if (!words.length) {
      continue;
    }
    timeline.push({
      time,
      text: words.map((item) => item.text).join(""),
      words,
    });
  }
  timeline.sort((a, b) => a.time - b.time);
  return timeline;
}

function renderLyrics(lines) {
  lyricTimeline = lines;
  currentLyricIndex = -1;
  lyricWordProgressIndex = -1;
  playerLyricsLines.innerHTML = "";
  if (!lyricTimeline.length) {
    playerLyricsEmpty.textContent = "暂无可用歌词。";
    playerLyricsEmpty.classList.remove("hidden");
    return;
  }

  playerLyricsEmpty.classList.add("hidden");
  playerLyricsLines.innerHTML = lyricTimeline
    .map((line, index) => {
      if (Array.isArray(line.words) && line.words.length) {
        const wordsHtml = line.words
          .map(
            (word, wordIndex) =>
              `<span class="lyric-word" data-word-index="${wordIndex}" data-word-start-ms="${word.startMs}" data-word-duration-ms="${word.durationMs}">${escapeHtml(word.text)}</span>`,
          )
          .join("");
        return `<p class="player-lyric-line" data-lyric-index="${index}" data-lyric-time="${line.time}">${wordsHtml}</p>`;
      }
      return `<p class="player-lyric-line" data-lyric-index="${index}" data-lyric-time="${line.time}">${escapeHtml(line.text)}</p>`;
    })
    .join("");
}

function resetLyrics(message = "歌词会显示在这里。") {
  lyricTimeline = [];
  currentLyricIndex = -1;
  playerLyricsLines.innerHTML = "";
  playerLyricsEmpty.textContent = message;
  playerLyricsEmpty.classList.remove("hidden");
  playerLyrics.scrollTop = 0;
}

async function loadTrackLyrics(track) {
  if (!track) {
    resetLyrics();
    return;
  }
  const requestId = ++lyricRequestId;
  const trackId = Number(track.id);
  resetLyrics("正在加载歌词...");
  try {
    const lyricData = await fetchTrackLyric(track);
    const currentTrack = getCurrentTrack();
    if (requestId !== lyricRequestId || !currentTrack || Number(currentTrack.id) !== trackId) {
      return;
    }
    const yrcTimeline = parseYrcLines(lyricData.yrc);
    if (yrcTimeline.length) {
      renderLyrics(yrcTimeline);
    } else {
      renderLyrics(parseLyricLines(lyricData.lyric));
    }
  } catch (error) {
    const currentTrack = getCurrentTrack();
    if (requestId !== lyricRequestId || !currentTrack || Number(currentTrack.id) !== trackId) {
      return;
    }
    resetLyrics(error.message || "歌词加载失败。");
  }
}

function updateLyricHighlight(currentTime) {
  if (!lyricTimeline.length) {
    return;
  }

  let nextIndex = -1;
  for (let i = lyricTimeline.length - 1; i >= 0; i -= 1) {
    if (currentTime + 0.06 >= lyricTimeline[i].time) {
      nextIndex = i;
      break;
    }
  }

  if (nextIndex === currentLyricIndex) {
    return;
  }

  if (currentLyricIndex >= 0) {
    const prevNode = playerLyricsLines.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
    if (prevNode) {
      prevNode.classList.remove("is-active");
    }
  }

  currentLyricIndex = nextIndex;
  if (currentLyricIndex < 0) {
    return;
  }

  const activeNode = playerLyricsLines.querySelector(`[data-lyric-index="${currentLyricIndex}"]`);
  if (!activeNode) {
    return;
  }
  activeNode.classList.add("is-active");

  // Reposition by visual delta to avoid offset errors caused by nested layout/padding.
  const containerRect = playerLyrics.getBoundingClientRect();
  const lineRect = activeNode.getBoundingClientRect();
  const containerCenterY = containerRect.top + containerRect.height / 2;
  const lineCenterY = lineRect.top + lineRect.height / 2;
  const deltaY = lineCenterY - containerCenterY;
  const threshold = Math.max(12, Math.floor(lineRect.height * 0.6));

  if (Math.abs(deltaY) > threshold) {
    const maxScrollTop = Math.max(0, playerLyrics.scrollHeight - playerLyrics.clientHeight);
    const nextScrollTop = Math.min(
      maxScrollTop,
      Math.max(0, Math.round(playerLyrics.scrollTop + deltaY)),
    );
    playerLyrics.scrollTop = nextScrollTop;
  }

  const activeLine = lyricTimeline[currentLyricIndex];
  if (activeLine && Array.isArray(activeLine.words) && activeLine.words.length) {
    const elapsedMs = Math.max(0, Math.floor((currentTime - activeLine.time) * 1000));
    if (lyricWordProgressIndex !== currentLyricIndex || currentTime === 0) {
      const allWords = activeNode.querySelectorAll(".lyric-word");
      allWords.forEach((node) => node.classList.remove("is-active"));
    }
    lyricWordProgressIndex = currentLyricIndex;
    const wordNodes = activeNode.querySelectorAll(".lyric-word");
    activeLine.words.forEach((word, idx) => {
      if (elapsedMs >= word.startMs) {
        wordNodes[idx]?.classList.add("is-active");
      } else {
        wordNodes[idx]?.classList.remove("is-active");
      }
    });
  }
}

function persistPlayerState() {
  const payload = {
    tracks: paginationState.tracks,
    selectedTrackId: paginationState.selectedTrackId,
    qualityLevel: paginationState.qualityLevel,
    playlist: paginationState.playlist,
  };
  localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(payload));
}

function syncQualityControls() {
  qualitySelect.value = paginationState.qualityLevel;
  dockQualitySelect.value = paginationState.qualityLevel;
  modalPlayerQualitySelect.value = paginationState.qualityLevel;
}

function getCurrentTrackIndex() {
  return paginationState.tracks.findIndex((track) => track.id === paginationState.selectedTrackId);
}

function getCurrentTrack() {
  return paginationState.tracks.find((track) => track.id === paginationState.selectedTrackId) || null;
}

function hasLoadedTrack(track) {
  return Boolean(track && trackAudio.src && paginationState.loadedTrackId === track.id);
}

function resetPlaybackState(message = "请选择一首歌开始播放。") {
  trackAudio.pause();
  trackAudio.removeAttribute("src");
  trackAudio.load();
  paginationState.loadedTrackId = null;
  lyricRequestId += 1;
  playerStatus.textContent = message;
  modalPlayerStatus.textContent = message;
  updateProgressUI();
  updatePlayButtons();
  resetLyrics();
}

function updateProgressUI() {
  const duration = Number.isFinite(trackAudio.duration) ? trackAudio.duration : 0;
  const currentTime = Number.isFinite(trackAudio.currentTime) ? trackAudio.currentTime : 0;
  const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0;

  dockProgress.value = String(progressValue);
  modalPlayerProgress.value = String(progressValue);
  dockCurrentTime.textContent = formatTimeSeconds(currentTime);
  modalPlayerCurrentTime.textContent = formatTimeSeconds(currentTime);
  dockDuration.textContent = formatTimeSeconds(duration);
  modalPlayerDuration.textContent = formatTimeSeconds(duration);
}

function seekAudioByPercent(percentValue) {
  const duration = Number.isFinite(trackAudio.duration) ? trackAudio.duration : 0;
  if (!duration) {
    return;
  }

  const percent = Math.min(100, Math.max(0, Number(percentValue) || 0));
  trackAudio.currentTime = (percent / 100) * duration;
  updateProgressUI();
  updateLyricHighlight(trackAudio.currentTime);
}

function updatePlayerDock(track) {
  if (!track) {
    playerDock.classList.add("hidden");
    dockTitle.textContent = "未选择歌曲";
    dockSubtitle.textContent = "请选择一首歌开始播放";
    return;
  }

  playerDock.classList.remove("hidden");
  dockCover.src = getTrackCoverUrl(track);
  dockCover.alt = `${track.name || "歌曲"} 封面`;
  dockTitle.textContent = track.name || "未命名歌曲";
  dockSubtitle.textContent = `${(track.artists || []).join(" / ") || "未知歌手"} · ${track.album || "未知专辑"}`;
}

function updatePlayButtons() {
  const isPlaying = !trackAudio.paused && !trackAudio.ended;
  playTrackButton.textContent = isPlaying ? "暂停播放" : "播放歌曲";
  dockPlayToggleButton.textContent = isPlaying ? "暂停" : "播放";
  modalPlayerPlayButton.textContent = isPlaying ? "暂停" : "播放";
}

function updatePlayerModal(track) {
  const playlistName = paginationState.playlist?.name || "当前未加载歌单";
  const playlistCount = paginationState.tracks.length;

  modalPlayerPlaylist.textContent = playlistName;
  modalPlayerCount.textContent = `${playlistCount} 首`;
  syncQualityControls();
  updatePlayButtons();

  if (!track) {
    modalPlayerCover.src = cover.src || "";
    modalPlayerCover.alt = "播放器封面";
    modalPlayerTrackTitle.textContent = "未选择歌曲";
    modalPlayerSubtitle.textContent = "请先在歌单列表中选择一首歌曲。";
    modalPlayerStatus.textContent = "等待加载播放状态。";
    resetLyrics();
    return;
  }

  modalPlayerCover.src = getTrackCoverUrl(track);
  modalPlayerCover.alt = `${track.name || "歌曲"} 封面`;
  modalPlayerTrackTitle.textContent = track.name || "未命名歌曲";
  modalPlayerSubtitle.textContent = `${(track.artists || []).join(" / ") || "未知歌手"} · ${track.album || "未知专辑"} · ${formatDuration(track.duration_ms || 0)}`;
  modalPlayerStatus.textContent = playerStatus.textContent || "准备播放。";
}

function renderPlayerModalList() {
  if (!paginationState.tracks.length) {
    modalPlayerTracks.innerHTML = `
      <tr>
        <td colspan="3" class="empty">等待歌单页加载播放列表。</td>
      </tr>
    `;
    modalPlayerCount.textContent = "0 首";
    return;
  }

  modalPlayerTracks.innerHTML = paginationState.tracks
    .map(
      (track) => `
        <tr class="track-row${track.id === paginationState.selectedTrackId ? " is-active" : ""}" data-player-track-id="${track.id}">
          <td title="${escapeHtml(track.name ?? "-")}">
            <div class="track-title-cell">
              <img class="track-thumb" src="${escapeHtml(getTrackCoverUrl(track))}" alt="${escapeHtml(track.name || "歌曲")} 封面">
              <span class="track-title-text">${escapeHtml(track.name ?? "-")}</span>
            </div>
          </td>
          <td title="${escapeHtml((track.artists || []).join(" / ") || "-")}">${escapeHtml((track.artists || []).join(" / ") || "-")}</td>
          <td>${formatDuration(track.duration_ms || 0)}</td>
        </tr>
      `,
    )
    .join("");
  modalPlayerCount.textContent = `${paginationState.tracks.length} 首`;
}

function openPlayerModal() {
  playerModal.classList.remove("hidden");
  syncModalScrollLock();
  renderPlayerModalList();
  updatePlayerModal(getCurrentTrack());
}

function closePlayerModal() {
  playerModal.classList.add("hidden");
  syncModalScrollLock();
}

async function startPlayback(track) {
  if (!track) {
    return;
  }

  updatePlayerDock(track);
  updatePlayerModal(track);
  updatePlayButtons();
  playerStatus.textContent = "正在获取可播放地址...";
  modalPlayerStatus.textContent = playerStatus.textContent;
  loadTrackLyrics(track);

  try {
    const playInfo = await fetchTrackPlayInfo(track);
    trackAudio.src = playInfo.url;
    paginationState.loadedTrackId = track.id;
    trackAudio.load();
    await trackAudio.play();
    const levelText = playInfo.level ? `，音质 ${playInfo.level}` : "";
    const unlockApplied = Boolean(playInfo.duration_mismatch_unlock || playInfo.short_track_unlock_applied);
    const durationMeta =
      Number.isFinite(Number(playInfo.expected_duration_ms)) && Number.isFinite(Number(playInfo.actual_duration_ms))
        ? `（时长期望 ${formatDuration(Number(playInfo.expected_duration_ms))} / 返回 ${formatDuration(Number(playInfo.actual_duration_ms))}）`
        : "";
    const resolvedLevelMeta =
      playInfo.resolved_level && String(playInfo.resolved_level) !== String(playInfo.requested_level)
        ? `，回退 ${playInfo.resolved_level}`
        : "";
    const unlockMeta = unlockApplied ? "，已启用解灰替换" : "，未触发解灰";
    playerStatus.textContent = `正在播放${levelText}${resolvedLevelMeta}${unlockMeta}${durationMeta}。`;
    modalPlayerStatus.textContent = playerStatus.textContent;
    updateProgressUI();
  } catch (error) {
    paginationState.loadedTrackId = null;
    playerStatus.textContent = error.message || "播放失败。";
    modalPlayerStatus.textContent = playerStatus.textContent;
    updateProgressUI();
  }
}

async function playTrackByOffset(offset) {
  const currentIndex = getCurrentTrackIndex();
  if (currentIndex < 0) {
    return;
  }

  const nextIndex = currentIndex + offset;
  if (nextIndex < 0 || nextIndex >= paginationState.tracks.length) {
    return;
  }

  const track = paginationState.tracks[nextIndex];
  paginationState.selectedTrackId = track.id;
  renderPagination();
  renderPlayerModalList();
  updateTrackDetail(track);
  await startPlayback(track);
}

function updateTracks(tracks) {
  if (!tracks.length) {
    tracksBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">这个歌单暂时没有歌曲。</td>
      </tr>
    `;
    return;
  }

  tracksBody.innerHTML = tracks
    .map(
      (track) => `
        <tr class="track-row${track.id === paginationState.selectedTrackId ? " is-active" : ""}" data-track-id="${track.id}">
          <td title="${escapeHtml(track.name ?? "-")}">
            <div class="track-title-cell">
              <img class="track-thumb" src="${escapeHtml(getTrackCoverUrl(track))}" alt="${escapeHtml(track.name || "歌曲")} 封面">
              <span class="track-title-text">${escapeHtml(track.name ?? "-")}</span>
            </div>
          </td>
          <td title="${escapeHtml((track.artists || []).join(" / ") || "-")}">${escapeHtml((track.artists || []).join(" / ") || "-")}</td>
          <td title="${escapeHtml(track.album || "-")}">${escapeHtml(track.album || "-")}</td>
          <td>${formatDuration(track.duration_ms || 0)}</td>
        </tr>
      `
    )
    .join("");
}

function updateTrackDetail(track) {
  if (!track) {
    trackModal.classList.add("hidden");
    syncModalScrollLock();
    return;
  }

  trackModal.classList.remove("hidden");
  syncModalScrollLock();
  trackDetailCover.src = getTrackCoverUrl(track);
  trackDetailCover.alt = `${track.name || "歌曲"} 封面`;
  trackDetailName.textContent = track.name || "未命名歌曲";
  trackDetailSubtitle.textContent = "歌曲详情已根据当前选中项更新。";
  updatePlayerDock(track);
  updatePlayerModal(track);
  updatePlayButtons();
  playerStatus.textContent = "点击播放歌曲后，将通过后端请求 api-enhanced 获取真实播放地址。";
  modalPlayerStatus.textContent = playerStatus.textContent;
  trackDetailArtist.textContent = `歌手：${(track.artists || []).join(" / ") || "未知"}`;
  trackDetailAlbum.textContent = `专辑：${track.album || "未知"}`;
  trackDetailDuration.textContent = `时长：${formatDuration(track.duration_ms || 0)}`;
  trackDetailId.textContent = `歌曲 ID：${track.id || "-"}`;
  persistPlayerState();
}

function closeTrackModal() {
  trackModal.classList.add("hidden");
  syncModalScrollLock();
}

function getTotalPages() {
  return Math.max(1, Math.ceil(paginationState.tracks.length / paginationState.pageSize));
}

function renderPagination() {
  const totalTracks = paginationState.tracks.length;
  const totalPages = getTotalPages();

  if (!totalTracks) {
    updateTracks([]);
    pageSummary.textContent = "暂无分页数据";
    pageIndicator.textContent = "第 0 / 0 页";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    return;
  }

  if (paginationState.currentPage > totalPages) {
    paginationState.currentPage = totalPages;
  }

  const startIndex = (paginationState.currentPage - 1) * paginationState.pageSize;
  const endIndex = Math.min(startIndex + paginationState.pageSize, totalTracks);
  const visibleTracks = paginationState.tracks.slice(startIndex, endIndex);

  updateTracks(visibleTracks);
  pageSummary.textContent = `当前显示第 ${startIndex + 1}-${endIndex} 首，共 ${totalTracks} 首`;
  pageIndicator.textContent = `第 ${paginationState.currentPage} / ${totalPages} 页`;
  prevPageButton.disabled = paginationState.currentPage <= 1;
  nextPageButton.disabled = paginationState.currentPage >= totalPages;
}

function updatePlaylist(playlist) {
  playlistCard.classList.remove("hidden");
  cover.src = playlist.cover_img_url || "";
  cover.alt = `${playlist.name} 封面`;
  playlistName.textContent = playlist.name || "未命名歌单";
  playlistDesc.textContent = playlist.description || "这个歌单没有简介。";
  creator.textContent = `创建者：${playlist.creator || "未知"}`;
  playCount.textContent = formatPlayCount(playlist.play_count);
  trackCount.textContent = `歌曲数：${playlist.track_count || 0}`;
  resultCount.textContent = `共 ${playlist.tracks.length} 首`;
  paginationState.tracks = playlist.tracks || [];
  paginationState.currentPage = 1;
  paginationState.selectedTrackId = null;
  paginationState.playlist = {
    id: playlist.id,
    name: playlist.name,
    cover_img_url: playlist.cover_img_url,
    creator: playlist.creator,
  };
  resetPlaybackState("已加载新歌单，请重新选择歌曲播放。");
  renderPagination();
  renderPlayerModalList();
  closeTrackModal();
  updatePlayerDock(null);
  updatePlayerModal(null);
  persistPlayerState();
}

async function fetchPlaylist(id) {
  const response = await fetch(`/api/playlist?id=${encodeURIComponent(id)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "查询失败");
  }
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const playlistId = input.value.trim();
  if (!playlistId) {
    statusNode.textContent = "请输入歌单 ID 或网易云歌单链接。";
    return;
  }

  statusNode.textContent = "正在查询歌单，请稍候...";
  try {
    const data = await fetchPlaylist(playlistId);
    updatePlaylist(data.playlist);
    statusNode.textContent = "查询成功。";
  } catch (error) {
    playlistCard.classList.add("hidden");
    closeTrackModal();
    resultCount.textContent = "";
    paginationState.tracks = [];
    paginationState.selectedTrackId = null;
    paginationState.playlist = null;
    resetPlaybackState("查询失败，请重新选择歌曲播放。");
    tracksBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">${escapeHtml(error.message)}</td>
      </tr>
    `;
    pageSummary.textContent = "暂无分页数据";
    pageIndicator.textContent = "第 0 / 0 页";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
    renderPlayerModalList();
    updatePlayerModal(null);
    statusNode.textContent = "查询失败。";
  }
});

tracksBody.addEventListener("click", (event) => {
  const row = event.target.closest(".track-row");
  if (!row) {
    return;
  }

  const trackId = Number(row.dataset.trackId);
  const track = paginationState.tracks.find((item) => item.id === trackId);
  if (!track) {
    return;
  }

  paginationState.selectedTrackId = trackId;
  renderPagination();
  renderPlayerModalList();
  updateTrackDetail(track);
  persistPlayerState();
});

modalPlayerTracks.addEventListener("click", async (event) => {
  const row = event.target.closest("[data-player-track-id]");
  if (!row) {
    return;
  }

  const trackId = Number(row.dataset.playerTrackId);
  const track = paginationState.tracks.find((item) => item.id === trackId);
  if (!track) {
    return;
  }

  paginationState.selectedTrackId = trackId;
  renderPagination();
  renderPlayerModalList();
  updateTrackDetail(track);
  await startPlayback(track);
  persistPlayerState();
});

trackModal.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal === "true") {
    closeTrackModal();
  }
});

closeTrackModalButton.addEventListener("click", () => {
  closeTrackModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (!loginModal.classList.contains("hidden")) {
    closeLoginModal();
  }

  if (!playerModal.classList.contains("hidden")) {
    closePlayerModal();
  }

  if (!trackModal.classList.contains("hidden")) {
    closeTrackModal();
  }
});

function updateScrollTopButton() {
  const shouldShow = window.scrollY > 280;
  scrollTopButton.classList.toggle("is-visible", shouldShow);
}

scrollTopButton.addEventListener("click", () => {
  scrollTopButton.classList.add("is-animating");
  if (scrollTopAnimationTimer) {
    window.clearTimeout(scrollTopAnimationTimer);
  }
  scrollTopAnimationTimer = window.setTimeout(() => {
    scrollTopButton.classList.remove("is-animating");
    scrollTopAnimationTimer = null;
  }, 560);
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", updateScrollTopButton, { passive: true });
updateScrollTopButton();

playTrackButton.addEventListener("click", async () => {
  const currentTrack = getCurrentTrack();
  if (!currentTrack) {
    playerStatus.textContent = "请先选择一首歌曲。";
    modalPlayerStatus.textContent = playerStatus.textContent;
    return;
  }

  if (!hasLoadedTrack(currentTrack)) {
    await startPlayback(currentTrack);
    return;
  }

  if (trackAudio.paused || trackAudio.ended) {
    try {
      await trackAudio.play();
      playerStatus.textContent = "正在播放。";
    } catch (error) {
      playerStatus.textContent = "播放失败，可能是浏览器限制或歌曲不可播放。";
      modalPlayerStatus.textContent = playerStatus.textContent;
    }
  } else {
    trackAudio.pause();
  }
});

trackAudio.addEventListener("play", () => {
  playerStatus.textContent = "正在播放。";
  modalPlayerStatus.textContent = playerStatus.textContent;
  updateProgressUI();
  updatePlayButtons();
});

trackAudio.addEventListener("pause", () => {
  if (!trackAudio.ended) {
    playerStatus.textContent = "已暂停播放。";
  }
  modalPlayerStatus.textContent = playerStatus.textContent;
  updateProgressUI();
  updatePlayButtons();
});

trackAudio.addEventListener("ended", () => {
  playerStatus.textContent = "播放结束。";
  modalPlayerStatus.textContent = playerStatus.textContent;
  updateProgressUI();
  updatePlayButtons();
  playTrackByOffset(1);
});

trackAudio.addEventListener("error", () => {
  paginationState.loadedTrackId = null;
  playerStatus.textContent = "音频加载失败，可能是版权或链接限制。";
  modalPlayerStatus.textContent = playerStatus.textContent;
  updateProgressUI();
  updatePlayButtons();
});

trackAudio.addEventListener("loadedmetadata", () => {
  updateProgressUI();
  updateLyricHighlight(trackAudio.currentTime);
});

trackAudio.addEventListener("timeupdate", () => {
  updateProgressUI();
  updateLyricHighlight(trackAudio.currentTime);
});

function applyQualityLevel(level) {
  paginationState.qualityLevel = level;
  syncQualityControls();
  persistPlayerState();
  const currentTrack = getCurrentTrack();
  if (currentTrack && !trackAudio.paused && !trackAudio.ended) {
    startPlayback(currentTrack);
  }

  playerStatus.textContent = `已切换到 ${level} 音质。`;
  modalPlayerStatus.textContent = playerStatus.textContent;
}

dockPlayToggleButton.addEventListener("click", async () => {
  const currentTrack = getCurrentTrack();
  if (!currentTrack) {
    return;
  }

  if (!hasLoadedTrack(currentTrack)) {
    await startPlayback(currentTrack);
    return;
  }

  if (trackAudio.paused || trackAudio.ended) {
    await trackAudio.play();
  } else {
    trackAudio.pause();
  }
});

dockPrevButton.addEventListener("click", async () => {
  await playTrackByOffset(-1);
});

dockNextButton.addEventListener("click", async () => {
  await playTrackByOffset(1);
});

qualitySelect.addEventListener("change", () => {
  applyQualityLevel(qualitySelect.value);
});

dockQualitySelect.addEventListener("change", () => {
  applyQualityLevel(dockQualitySelect.value);
});

modalPlayerQualitySelect.addEventListener("change", () => {
  applyQualityLevel(modalPlayerQualitySelect.value);
});

openPlayerModalButton.addEventListener("click", () => {
  openPlayerModal();
});

dockOpenPlayerButton.addEventListener("click", () => {
  openPlayerModal();
});

playerModal.addEventListener("click", (event) => {
  if (event.target.dataset.closePlayerModal === "true") {
    closePlayerModal();
  }
});

closePlayerModalButton.addEventListener("click", () => {
  closePlayerModal();
});

openLoginModalButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAccountPopover();
});

accountOpenQrLoginButton.addEventListener("click", () => {
  toggleAccountPopover(false);
  openLoginModal();
});

loginModal.addEventListener("click", (event) => {
  if (event.target.dataset.closeLoginModal === "true") {
    closeLoginModal();
  }
});

closeLoginModalButton.addEventListener("click", () => {
  closeLoginModal();
});

loginModePassword.addEventListener("change", updateLoginModeUI);
loginModeCaptcha.addEventListener("change", updateLoginModeUI);

loginSubmitButton.addEventListener("click", async () => {
  const mode = getLoginMode();
  const { phone, password, captcha } = getLoginFormValues();
  if (!phone) {
    loginActionStatus.textContent = "请先输入手机号。";
    return;
  }

  if (mode === "password") {
    if (!password) {
      loginActionStatus.textContent = "请输入密码。";
      return;
    }
    await runLoginAction({
      path: "/login/cellphone",
      params: { phone, password },
      pending: "正在进行密码登录...",
      successText: "登录成功。",
    });
    return;
  }

  if (!captcha) {
    await runLoginAction({
      path: "/captcha/sent",
      params: { phone },
      pending: "正在发送验证码...",
      successText: "验证码已发送，请输入验证码后再次点击登录。",
    });
    return;
  }

  await runLoginAction({
    path: "/login/cellphone",
    params: { phone, captcha },
    pending: "正在进行验证码登录...",
    successText: "登录成功。",
  });
});

topSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const keywords = topSearchKeywords.value.trim();
  const type = topSearchType.value;
  if (!keywords) {
    searchStatus.textContent = "请输入搜索关键词";
    return;
  }
  searchStatus.textContent = "搜索中...";
  try {
    const data = await fetchSearchResults(keywords, type);
    renderSearchRows(normalizeSearchRows(data, type));
    searchStatus.textContent = `搜索完成：${keywords}`;
    window.location.hash = "search-panel";
  } catch (error) {
    renderSearchRows([]);
    searchStatus.textContent = error.message || "搜索失败";
  }
});

discoverPlaylists.addEventListener("click", (event) => {
  const card = event.target.closest("[data-playlist-id]");
  if (!card) {
    return;
  }
  const playlistId = card.dataset.playlistId;
  if (!playlistId) {
    return;
  }
  input.value = playlistId;
  form.requestSubmit();
  window.location.hash = "playlist-form";
});

document.addEventListener("click", (event) => {
  if (
    !accountPopover.classList.contains("hidden") &&
    !accountPopover.contains(event.target) &&
    !openLoginModalButton.contains(event.target)
  ) {
    toggleAccountPopover(false);
  }
});

modalPlayerPlayButton.addEventListener("click", async () => {
  const currentTrack = getCurrentTrack();
  if (!currentTrack) {
    modalPlayerStatus.textContent = "请先选择一首歌曲。";
    return;
  }

  if (!hasLoadedTrack(currentTrack)) {
    await startPlayback(currentTrack);
    return;
  }

  if (trackAudio.paused || trackAudio.ended) {
    try {
      await trackAudio.play();
    } catch (error) {
      modalPlayerStatus.textContent = "播放失败，可能是浏览器限制或歌曲不可播放。";
    }
  } else {
    trackAudio.pause();
  }
});

modalPlayerPrevButton.addEventListener("click", async () => {
  await playTrackByOffset(-1);
});

modalPlayerNextButton.addEventListener("click", async () => {
  await playTrackByOffset(1);
});

dockProgress.addEventListener("input", () => {
  seekAudioByPercent(dockProgress.value);
});

modalPlayerProgress.addEventListener("input", () => {
  seekAudioByPercent(modalPlayerProgress.value);
});

pageSizeSelect.addEventListener("change", () => {
  paginationState.pageSize = Number(pageSizeSelect.value);
  paginationState.currentPage = 1;
  renderPagination();
});

prevPageButton.addEventListener("click", () => {
  if (paginationState.currentPage <= 1) {
    return;
  }
  paginationState.currentPage -= 1;
  renderPagination();
});

nextPageButton.addEventListener("click", () => {
  const totalPages = getTotalPages();
  if (paginationState.currentPage >= totalPages) {
    return;
  }
  paginationState.currentPage += 1;
  renderPagination();
});

featureActionSelect.addEventListener("change", () => {
  setFeatureParamTemplate();
});

featureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = FEATURE_ACTIONS.find((item) => item.key === featureActionSelect.value);
  if (!selected) {
    featureStatus.textContent = "未选择有效功能。";
    return;
  }

  let params = {};
  const rawParams = featureParams.value.trim();
  if (rawParams) {
    try {
      params = JSON.parse(rawParams);
    } catch (error) {
      featureStatus.textContent = "参数 JSON 格式错误。";
      return;
    }
  }
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    featureStatus.textContent = "参数必须是 JSON 对象。";
    return;
  }

  featureStatus.textContent = `正在执行：${selected.label}`;
  featureResult.textContent = "请求中...";
  try {
    const result = await callFeatureApi(selected.path, params, "GET");
    featureResult.textContent = JSON.stringify(result, null, 2);
    featureStatus.textContent = `执行成功：${selected.label}`;
  } catch (error) {
    featureResult.textContent = error.message || "功能调用失败。";
    featureStatus.textContent = `执行失败：${selected.label}`;
  }
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  settingsStatus.textContent = "正在保存...";
  try {
    const saved = await saveFeatureSettings(collectSettingsForm());
    currentFeatureSettings = saved.settings || collectSettingsForm();
    fillSettingsForm(currentFeatureSettings);
    renderFeatureActionOptions();
    settingsStatus.textContent = "设置已保存";
  } catch (error) {
    settingsStatus.textContent = error.message || "保存失败";
  }
});

reloadSettingsButton.addEventListener("click", async () => {
  settingsStatus.textContent = "正在加载...";
  try {
    currentFeatureSettings = await fetchFeatureSettings();
    fillSettingsForm(currentFeatureSettings);
    renderFeatureActionOptions();
    settingsStatus.textContent = "设置已加载";
  } catch (error) {
    settingsStatus.textContent = error.message || "加载失败";
  }
});

syncQualityControls();
renderPlayerModalList();
updatePlayerModal(null);
updateProgressUI();
updateLoginModeUI();
refreshNeteaseLoginStatus();

(async () => {
  settingsStatus.textContent = "正在加载...";
  try {
    currentFeatureSettings = await fetchFeatureSettings();
    fillSettingsForm(currentFeatureSettings);
    renderFeatureActionOptions();
    if (!featureActionSelect.value && FEATURE_ACTIONS.length) {
      featureActionSelect.value = FEATURE_ACTIONS[0].key;
    }
    setFeatureParamTemplate();
    settingsStatus.textContent = "设置已加载";
  } catch (error) {
    renderFeatureActionOptions();
    featureStatus.textContent = "功能中心加载失败";
    settingsStatus.textContent = error.message || "设置加载失败";
  }
  await loadDiscover();
})();
