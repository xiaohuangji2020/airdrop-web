---
name: project_overview
description: Overview of the airdrop-web project - purpose, tech stack, and structure
type: project
---

# airdrop-web Project Overview

## Purpose
A web-based local file transfer tool (like AirDrop) that allows peer-to-peer file and text sharing between devices on a local network using WebRTC (via PeerJS).

## Tech Stack
- **Framework**: React 19 + Vite 7
- **Routing**: react-router-dom v7
- **P2P**: PeerJS v1.5 (WebRTC)
- **QR Code**: qrcode.react v4
- **Language**: JavaScript (JSX), TypeScript configured but not strictly enforced
- **Linting**: ESLint 9 with react-hooks and react-refresh plugins

## Project Structure
```
src/
  App.jsx              # Root component with routing (/ and /drop)
  App.css
  index.css
  main.jsx
  pages/
    HomePage.jsx       # Landing page with tool cards
    HomePage.css
    DropPage.jsx       # Main file transfer page
    DropPage.css
  components/
    DropPage/
      ActivityLog.jsx  # Transfer activity log
      AfterConnect.jsx # UI after peer connection
      BeforeConnect.jsx # UI before connection (QR, ID entry)
      Footer.jsx
      Navbar.jsx
  assets/
public/
design/                # Design assets
```

## Routes
- `/` → HomePage
- `/drop` → DropPage (main transfer interface)
