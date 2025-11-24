# CodeClash-Server

![CodeClash Banner](/docs/codeclash-logo.png)

**Realtime collaborative coding & chat backend** for the CodeClash platform
built with Node.js, Express, WebSocket, Yjs (CRDT), Redis and MongoDB.

---

[![license](https://img.shields.io/badge/license-MIT-blue)](#license)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [System Flowchart](#system-flowchart)
- [Codeclash Authentication](#codeclash-authentication)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)

---

## Overview

**CodeClash-Server** is the backend service for CodeClash a realtime
collaborative coding platform where users join rooms, share and view live code,
chat, run & submit code, and track progress.  
The server handles authentication, room lifecycle, realtime collaboration (Yjs),
presence, persistence, and safe code execution integration (self-hosted Judge0).

💡 What You Can Do on CodeClash

- 👥 Join coding rooms & collaborate in real-time
- 💭 Chat with others to discuss logic and approach
- 🧠 Share and view each other’s live code
- ⚡ Run and submit code seamlessly (Judge0 integration)
- 📈 Track your progress and achievements

---

## Features

- Realtime chat and presence (WebSocket + Redis pub/sub)
- CRDT-based collaborative editing using **Yjs**
- Room lifecycle management (TTL, cleanup, snapshot persistence)
- Secure code execution via **self-hosted Judge0** (Azure VM)
- Dockerized services for local testing and production deployment
- Lightweight, modular service design for easy scaling

---

## System Flowchart

![System Architecture](/docs/codeclash-flowchart.png)

## System Architecture

![System Architecture](/docs/codeclash-system-design.png)

- **Frontend (React + Yjs + Cloudflare Hosting)**

  - Handles UI, code editor, collaboration UI, chat UI

- **Backend**

  - **HTTP Routes Service**
    - login / register / logout
    - post questions
  - **Question Services**
    - fetch questions
    - interacts with MongoDB
  - **Collaboration & Code Execution**
    - WebSocket Chat Server
    - Yjs Server (live code sharing)
    - Code Run Service
    - Code Submit Service

- **Redis (Docker)**

  - user presence tracking
  - pub/sub for chat & collaboration events

- **MongoDB**

  - persistent storage for questions, profiles, achievements, submissions

- **Judge0 (Self-hosted on Azure VM)**
  - Secure isolated code execution
  - Polling-based result retrieval
  - Docker sandbox per execution

---

## Codeclash Authentication

![Codeclash Authentication](/docs/codeclash-authentication.png)

CodeClash uses a secure JWT-based authentication flow with **Access Token
(1day)** and **Refresh Token (10 days)**.

**Flow:**

- `/register` → user created
- `/login` → server generates:
  - Access Token (expires in 1 day)
  - Refresh Token (expires in 10 days)
- When access token expires → client sends refresh token
  - If refresh token is valid → new access token issued
  - If refresh token expired → user must login again

## Database Schema

![Database Schema](/docs/codeclash-datamodel.png)

**High-level notes**

- `users` — authentication & identity reference (minimal info stored; profile
  separated).
- `profiles` — public-facing profile info (bio, avatar, social links).
- `rooms` — room metadata, config, TTL/expiry timestamps.
- `snapshots` — serialized Yjs states stored for recovery/audit.
- `chats` or `chat-streams` — optional persisted chat messages (can also be
  stored in Redis streams).
- `submissions` — user code submissions, status, and Judge0 results.
- `achievements` — user progress metadata (solved, attempted, bookmarked).

---

## Tech Stack

**Backend**

- Node.js, Express.js, WebSockets (native / ws), Yjs server (y-websocket), Redis
  (pub/sub & presence), MongoDB, JWT, Bcrypt, Cloudinary, Docker, Self-hosted
  Judge0 (Azure VM)

**Tools / Infra**

- Docker & docker-compose, NGINX (reverse proxy / TLS), GitHub Actions (CI/CD),
  Azure VM

---

## Quick Start

```bash
# 1. clone
git clone https://github.com/omkar-devx/codeclash-server.git
cd codeclash-server

# 2. install
npm i

# 3. copy sample env and edit
cp .env.sample .env
=
# 4. run in dev
npm run dev
```
