# Ink Name AI Backend

A tiny Node.js HTTP server that runs the AI naming logic without the
Vercel serverless timeout cap. Deployed on a regular VM and exposed to
the public Internet via Cloudflare Tunnel.

## Why this exists

Vercel's Hobby plan kills serverless functions at 25 seconds. MiniMax-M2
with our naming prompt routinely takes 22-26s, so half the requests
were timing out and falling back to the deterministic name generator.
This service runs on a regular box where there is no such cap.

## Architecture

```
Browser (https://ink-name.vercel.app)
    │
    ▼  https://*.trycloudflare.com/api/generate-name
Cloudflare Tunnel
    │
    ▼  http://localhost:3002
ink-name-backend (this code)
    │
    ▼  https://api.minimaxi.com
MiniMax
```

## Deploy

```bash
# On the server (Ubuntu 24.04, Node 20+):
mkdir -p /root/ink-name-backend
# rsync this folder up:
scp -r server/* root@SERVER:/root/ink-name-backend/

# Create env file:
cat > /root/ink-name-backend/.env <<E
PORT=3002
HOST=127.0.0.1
MINIMAX_API_KEY=sk-cp-...
MINIMAX_API_BASE=https://api.minimaxi.com
MINIMAX_MODEL=MiniMax-M2
NAME_AI_TIMEOUT_MS=60000
E
chmod 600 /root/ink-name-backend/.env

# Install systemd unit:
cat > /etc/systemd/system/ink-name-backend.service <<E
[Unit]
Description=Ink Name AI naming backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/ink-name-backend
EnvironmentFile=/root/ink-name-backend/.env
ExecStart=/usr/bin/node server.mjs
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/ink-name-backend.log
StandardError=append:/var/log/ink-name-backend.log

[Install]
WantedBy=multi-user.target
E

systemctl daemon-reload
systemctl enable --now ink-name-backend
```

Cloudflared:

```bash
# Quick tunnel — ephemeral URL, fine for staging:
cat > /etc/systemd/system/ink-name-tunnel.service <<E
[Unit]
Description=Ink Name Cloudflare Quick Tunnel
After=network.target ink-name-backend.service
Requires=ink-name-backend.service

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:3002 --no-autoupdate --metrics 127.0.0.1:0
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/ink-name-tunnel.log
StandardError=append:/var/log/ink-name-tunnel.log

[Install]
WantedBy=multi-user.target
E

systemctl daemon-reload
systemctl enable --now ink-name-tunnel

# Find the URL after a few seconds:
grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/ink-name-tunnel.log | tail -1
```

For a stable URL, use a named tunnel (requires Cloudflare account auth).

## Files

| | |
|---|---|
| `server.mjs` | the http server itself, with CORS for *.vercel.app |
| `name-generator.mjs` | port of frontend/src/lib/server/name-generator.ts |
| `naming-data.mjs` | port of frontend/src/lib/server/naming-data.ts |
| `package.json` | no runtime deps; builtin http + fetch only |

## Env vars

| | |
|---|---|
| `PORT` | default 3002 |
| `HOST` | default 127.0.0.1 (cloudflared talks to localhost) |
| `MINIMAX_API_KEY` | required |
| `MINIMAX_API_BASE` | default https://api.minimaxi.com |
| `MINIMAX_MODEL` | default MiniMax-M2 |
| `NAME_AI_TIMEOUT_MS` | default 60000 |
