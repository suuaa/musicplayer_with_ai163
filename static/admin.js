const statusNode = document.querySelector("#admin-status");
const cookieMeta = document.querySelector("#cookie-meta");
const cookieInput = document.querySelector("#cookie-input");
const cookieForm = document.querySelector("#cookie-form");
const reloadButton = document.querySelector("#reload-cookie");
const logoutButton = document.querySelector("#logout-button");
const loginPanel = document.querySelector("#admin-login-panel");
const cookiePanel = document.querySelector("#admin-cookie-panel");
const loginForm = document.querySelector("#admin-login-form");
const passwordInput = document.querySelector("#admin-password");

function setStatus(message) {
  statusNode.textContent = message;
}

function setMeta(length, hasCookie) {
  cookieMeta.textContent = hasCookie ? `当前长度：${length}` : "当前没有 Cookie";
}

function setAuthenticated(authenticated) {
  loginPanel.classList.toggle("hidden", authenticated);
  cookiePanel.classList.toggle("hidden", !authenticated);
}

async function checkSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "校验登录状态失败");
  }
  return Boolean(data.authenticated);
}

async function login(password) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "登录失败");
  }
  return data;
}

async function logout() {
  const response = await fetch("/api/admin/logout", {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "退出失败");
  }
  return data;
}

async function readCookie() {
  setStatus("正在读取当前 Cookie...");
  const response = await fetch("/api/admin/cookie");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "读取失败");
  }

  setMeta(data.length || 0, Boolean(data.has_cookie));
  setStatus(data.has_cookie ? "当前已有已保存的 Cookie，如需更换请直接粘贴新值后保存。" : "当前还没有保存 Cookie。");
}

async function saveCookie(cookie) {
  const response = await fetch("/api/admin/cookie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cookie }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "保存失败");
  }

  setMeta(data.length || 0, Boolean(data.has_cookie));
  setStatus(data.message || "Cookie 已保存。");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) {
    setStatus("请输入后台密码。");
    return;
  }

  setStatus("正在登录...");
  try {
    await login(password);
    setAuthenticated(true);
    passwordInput.value = "";
    await readCookie();
  } catch (error) {
    setStatus(error.message);
  }
});

cookieForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const cookie = cookieInput.value.trim();
  if (!cookie) {
    setStatus("请输入完整 Cookie 后再保存。");
    return;
  }

  setStatus("正在保存 Cookie...");
  try {
    await saveCookie(cookie);
  } catch (error) {
    setStatus(error.message);
  }
});

reloadButton.addEventListener("click", async () => {
  try {
    await readCookie();
  } catch (error) {
    setStatus(error.message);
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await logout();
    setAuthenticated(false);
    setStatus("已退出登录。");
  } catch (error) {
    setStatus(error.message);
  }
});

(async () => {
  try {
    const authenticated = await checkSession();
    setAuthenticated(authenticated);
    if (authenticated) {
      await readCookie();
    } else {
      setStatus("请先输入后台密码。");
    }
  } catch (error) {
    setStatus(error.message);
  }
})();
