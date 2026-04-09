---
name: deploy-and-check
description: "Deploy latest master to the production server with pre-deploy checks, build, restart, and post-deploy verification."
disable-model-invocation: true
allowed-tools: Bash
---

> Ejecutar estos pasos conectado al servidor de producción vía SSH.
> Ruta base: `/home/ryzepeck/webapps/tuhuella_project`
> NO ejecutar en local.

# Deploy tuhuella_project to Production

Run these steps on the production server at `/home/ryzepeck/webapps/tuhuella_project` to deploy the latest `master` branch.

## Pre-Deploy

1. Quick status snapshot before deploy:
```bash
bash /home/ryzepeck/webapps/ops/vps/scripts/diagnostics/quick-status.sh
```

## Deploy Steps

2. Pull the latest code from master:
```bash
cd /home/ryzepeck/webapps/tuhuella_project && git pull origin master
```

3. Install backend dependencies and run migrations:
```bash
cd /home/ryzepeck/webapps/tuhuella_project/backend && source venv/bin/activate && pip install -r requirements.txt && DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod python manage.py migrate
```

4. Build the frontend (Next.js — requires nvm for Node 20.19.4):
```bash
bash -c 'export NVM_DIR="$HOME/.nvm"; source "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/ryzepeck/webapps/tuhuella_project/frontend && npm ci && npm run build'
```
> ⚠️ Do NOT remove `node_modules` after build — the `tuhuella-frontend` service needs them to run `next start`.

5. Collect static files:
```bash
cd /home/ryzepeck/webapps/tuhuella_project/backend && source venv/bin/activate && DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod python manage.py collectstatic --noinput
```

6. Restart services:
```bash
sudo systemctl restart tuhuella_project && sudo systemctl restart tuhuella-huey && sudo systemctl restart tuhuella-frontend
```

## Post-Deploy Verification

7. Run post-deploy check for tuhuella_project:
```bash
bash /home/ryzepeck/webapps/ops/vps/scripts/deployment/post-deploy-check.sh tuhuella_project
```
Expected: PASS on all checks, FAIL=0.

8. If something fails, check the logs:
```bash
sudo journalctl -u tuhuella_project.service --no-pager -n 30
sudo journalctl -u tuhuella-huey.service --no-pager -n 30
sudo journalctl -u tuhuella-frontend.service --no-pager -n 30
sudo tail -20 /var/log/nginx/error.log
```

## Architecture Reference

- **Domain**: `tuhuella.projectapp.co`
- **Backend**: Django (`base_feature_project` module), `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod`
- **Frontend**: Next.js SSR running as a Node.js service on port 3001 (`tuhuella-frontend.service`)
- **Services**:
  - `tuhuella_project.service` — Gunicorn via Unix socket
  - `tuhuella_project.socket` — `/run/tuhuella_project.sock`
  - `tuhuella-huey.service` — Huey task queue
  - `tuhuella-frontend.service` — Next.js (`next start -p 3001`)
- **Nginx**: `/etc/nginx/sites-available/tuhuella_project`
- **Static**: `/home/ryzepeck/webapps/tuhuella_project/backend/staticfiles/`
- **Media**: `/home/ryzepeck/webapps/tuhuella_project/backend/media/`

## Notes

- VPS operations scripts live in `/home/ryzepeck/webapps/ops/vps/scripts/`.
- `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod` must be set for migrate and collectstatic (manage.py defaults to settings_dev).
- Next.js requires `node_modules` to be present at runtime — do not delete them after build.
- Node version: 20.19.4 (managed via nvm).
