$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "未发现监听 3000 端口的进程。"
  exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processIds) {
  try {
    Stop-Process -Id $pid -Force -ErrorAction Stop
    Write-Host "已停止进程 $pid"
  } catch {
    Write-Host "停止进程 $pid 失败：$($_.Exception.Message)"
  }
}
