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
const openLoginModalButton = document.querySelector("#open-login-modal");
const neteaseLoginIndicator = document.querySelector("#netease-login-indicator");
const neteaseLoginAvatar = document.querySelector("#netease-login-avatar");
const loginModal = document.querySelector("#login-modal");
const closeLoginModalButton = document.querySelector("#close-login-modal");
const loginQrImage = document.querySelector("#login-qr-image");
const loginQrPlaceholder = document.querySelector("#login-qr-placeholder");
const loginUserStatus = document.querySelector("#login-user-status");
const loginQrStatus = document.querySelector("#login-qr-status");
const refreshLoginQrButton = document.querySelector("#refresh-login-qr");
const scrollTopButton = document.querySelector("#scroll-top-button");
let scrollTopAnimationTimer = null;
const PLAYER_STATE_KEY = "music_player_state_v1";
let loginPollingTimer = null;
let activeLoginQrKey = "";
let loginStatusRequestId = 0;

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

function updateLoginIndicator(statusData) {
  if (statusData?.logged_in) {
    neteaseLoginIndicator.textContent = statusData.nickname || "网易云用户";
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
      message: "请打开网易云音乐 App 扫码，然后在手机上确认登录。",
    });

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
          loginQrStatus.textContent = result.message || "二维码已过期，请重新生成。";
          return;
        }
        if (result.code === 803 && result.saved_cookie) {
          stopLoginPolling();
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
  refreshNeteaseLoginStatus();
  beginQrLogin();
}

function closeLoginModal() {
  loginModal.classList.add("hidden");
  activeLoginQrKey = "";
  stopLoginPolling();
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
  const response = await fetch(
    `/api/track/playinfo?id=${encodeURIComponent(track.id)}&level=${encodeURIComponent(paginationState.qualityLevel)}`,
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "未能获取播放地址。");
  }
  return data;
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
  playerStatus.textContent = message;
  modalPlayerStatus.textContent = message;
  updateProgressUI();
  updatePlayButtons();
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

  try {
    const playInfo = await fetchTrackPlayInfo(track);
    trackAudio.src = playInfo.url;
    paginationState.loadedTrackId = track.id;
    trackAudio.load();
    await trackAudio.play();
    const levelText = playInfo.level ? `，音质 ${playInfo.level}` : "";
    playerStatus.textContent = `正在播放${levelText}。`;
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
});

trackAudio.addEventListener("timeupdate", () => {
  updateProgressUI();
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

openLoginModalButton.addEventListener("click", () => {
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

refreshLoginQrButton.addEventListener("click", async () => {
  await beginQrLogin();
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

syncQualityControls();
renderPlayerModalList();
updatePlayerModal(null);
updateProgressUI();
refreshNeteaseLoginStatus();
