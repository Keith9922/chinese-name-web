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
    ▼  https://api.zhangrg.top/api/generate-name
Cloudflare (HTTPS terminates here, named tunnel)
    │  ┊
    ▼  ┊  cloudflared on the VM (outbound, no port forward)
ink-name-backend on http://localhost:3002 (this code)
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

Cloudflared (named tunnel — stable URL on your own domain):

```bash
# 1. Create the tunnel via the Cloudflare API. Needs an API token with
#    `Cloudflare Tunnel: Edit` (Account) + `DNS: Edit` (Zone), scoped to
#    the zone you want to use.
TOKEN=...  # Cloudflare API token
ACCOUNT=...  # account ID
ZONE=...     # zone ID for your domain

# Create the tunnel — returns a tunnel ID
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"ink-name","config_src":"cloudflare"}' | jq

TUNNEL_ID=...

# Set ingress: route hostname -> localhost:3002
curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel/$TUNNEL_ID/configurations" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "config": {
      "ingress": [
        {"hostname":"api.YOUR_DOMAIN.com","service":"http://localhost:3002"},
        {"service":"http_status:404"}
      ]
    }
  }'

# Create a DNS CNAME pointing the chosen hostname at the tunnel
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/dns_records" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"type\":\"CNAME\",\"name\":\"api\",\"content\":\"$TUNNEL_ID.cfargotunnel.com\",\"proxied\":true,\"ttl\":1}"

# 2. Get the tunnel run-token + drop it on the box
RUN_TOKEN=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/cfd_tunnel/$TUNNEL_ID/token" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.result')
echo "$RUN_TOKEN" > /root/.cloudflared/tunnel-token
chmod 600 /root/.cloudflared/tunnel-token

# 3. systemd unit
cat > /etc/systemd/system/ink-name-tunnel.service <<E
[Unit]
Description=Ink Name Cloudflare Named Tunnel
After=network.target ink-name-backend.service
Requires=ink-name-backend.service

[Service]
Type=simple
ExecStart=/bin/sh -c 'exec /usr/bin/cloudflared --no-autoupdate tunnel --metrics 127.0.0.1:0 run --token \$(cat /root/.cloudflared/tunnel-token)'
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/ink-name-tunnel.log
StandardError=append:/var/log/ink-name-tunnel.log

[Install]
WantedBy=multi-user.target
E

systemctl daemon-reload
systemctl enable --now ink-name-tunnel
```

For development / staging without a domain, the `--url http://localhost:3002`
form gives you an ephemeral `*.trycloudflare.com` URL — same systemd unit,
just a different ExecStart line.

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
