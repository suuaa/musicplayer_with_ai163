$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $projectRoot "api-enhanced-src\api-enhanced-main"

if (-not (Test-Path (Join-Path $apiDir ".env"))) {
  Write-Host "未找到 $apiDir\.env，请先确认配置文件存在。"
  exit 1
}

$existing = Get-Process | Where-Object {
  $_.ProcessName -like "node*" -and $_.Path -eq "C:\Program Files\nodejs\node.exe"
}

if ($existing) {
  Write-Host "检测到已有 node 进程正在运行，请先确认是否已经启动 api-enhanced。"
}

cmd.exe /c "cd /d $apiDir && start "" /min ""C:\Program Files\nodejs\node.exe"" app.js"
Write-Host "已尝试启动 api-enhanced。"
Write-Host "请访问 http://127.0.0.1:3000/banner 测试服务是否可用。"
