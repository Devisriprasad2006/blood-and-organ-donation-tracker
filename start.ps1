# =============================================================================
# LifeLink: Digital Blood & Organ Donation Management and Tracking System
# Simultaneous Full-Stack Startup Script
# =============================================================================

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " LifeLink: Digital Blood & Organ Donation Management and Tracking System" -ForegroundColor Green
Write-Host " Launching Backend API (Port 5000) and Frontend Client (Port 5173)..." -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " * Backend REST API & Socket.IO: http://localhost:5000" -ForegroundColor Yellow
Write-Host " * Frontend Live Web App:        http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host " Press Ctrl+C to terminate both servers." -ForegroundColor DarkGray
Write-Host ""

npm run dev:all
