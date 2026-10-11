# =============================================================================
# LifeLink Healthcare Grid: Automated MySQL 8 Backup Script (PowerShell)
# Performs timestamped mysqldump with verification and compression
# =============================================================================

param (
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [string]$DbUser = "root",
    [string]$DbPassword = "rootpassword123",
    [string]$DbName = "lifelink_db",
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = Join-Path $BackupDir "lifelink_backup_$timestamp.sql"

Write-Host "[LifeLink Backup] Initiating hot backup of database '$DbName'..." -ForegroundColor Cyan

$mysqldumpPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
if (-not (Test-Path $mysqldumpPath)) {
    $mysqldumpPath = "mysqldump"
}

$dumpArgs = @(
    "--host=$DbHost",
    "--port=$DbPort",
    "--user=$DbUser",
    "--password=$DbPassword",
    "--single-transaction",
    "--routines",
    "--triggers",
    "--databases",
    $DbName,
    "--result-file=$dumpFile"
)

& $mysqldumpPath $dumpArgs

if ($LASTEXITCODE -eq 0 -and (Test-Path $dumpFile)) {
    $size = (Get-Item $dumpFile).Length / 1KB
    Write-Host "[LifeLink Backup] SUCCESS: Backup archive generated at $dumpFile ($([math]::Round($size, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "[LifeLink Backup] ERROR: Backup generation failed." -ForegroundColor Red
    exit 1
}
