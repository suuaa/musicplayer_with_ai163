$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $projectRoot "api-enhanced-src\api-enhanced-main"
$cargoExe = Join-Path $env:USERPROFILE ".cargo\bin\cargo.exe"

function Test-Url {
  param(
    [Parameter(Mandatory = $true)][string]$Url
  )
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 4
    return $resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-Url {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [int]$Retry = 15,
    [int]$SleepSeconds = 1
  )
  for ($i = 0; $i -lt $Retry; $i++) {
    if (Test-Url -Url $Url) {
      return $true
    }
    Start-Sleep -Seconds $SleepSeconds
  }
  return $false
}

if (-not (Test-Path $cargoExe)) {
  Write-Host "Cargo not found: $cargoExe"
  Write-Host "Install Rust first, then run this script again."
  exit 1
}

if (-not (Test-Path (Join-Path $apiDir ".env"))) {
  Write-Host "Missing $apiDir\.env"
  Write-Host "Please make sure api-enhanced env file exists."
  exit 1
}

if (-not (Test-Url -Url "http://127.0.0.1:3000/banner")) {
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $nodeCmd) {
    Write-Host "Node.js not found in PATH."
    exit 1
  }
  Start-Process -FilePath $nodeCmd.Source -ArgumentList "app.js" -WorkingDirectory $apiDir -WindowStyle Minimized
}

if (-not (Wait-Url -Url "http://127.0.0.1:3000/banner" -Retry 20 -SleepSeconds 1)) {
  Write-Host "api-enhanced did not become healthy at http://127.0.0.1:3000/banner"
  exit 1
}

if (-not (Test-Url -Url "http://127.0.0.1:8000/api/admin/session")) {
  $runCmd = "cd /d `"$projectRoot`" && `"$cargoExe`" run"
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $runCmd -WindowStyle Minimized
}

if (-not (Wait-Url -Url "http://127.0.0.1:8000/api/admin/session" -Retry 30 -SleepSeconds 1)) {
  Write-Host "Rust backend did not become healthy at http://127.0.0.1:8000/api/admin/session"
  exit 1
}

Write-Host "Services are ready:"
Write-Host "  Web: http://127.0.0.1:8000/"
Write-Host "  Admin: http://127.0.0.1:8000/admin.html"
Write-Host "  API Enhanced: http://127.0.0.1:3000/"
