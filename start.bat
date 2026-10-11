@echo off
title LifeLink Healthcare Grid - Full Stack Engine
echo =========================================================================
echo  LifeLink: Digital Blood & Organ Donation Management and Tracking System
echo  Launching Backend API (Port 5000) and Frontend Client (Port 5173)...
echo =========================================================================
echo.
echo * Backend REST API & Socket.IO: http://localhost:5000
echo * Frontend Live Web App:        http://localhost:5173
echo.
echo Press Ctrl+C in this terminal to terminate all processes.
echo =========================================================================
echo.

npm run dev:all
