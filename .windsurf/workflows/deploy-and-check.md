---
description: Deploy latest branch to production server for this project
---

# Deploy and Check

> **Adapt this template** after forking: replace all `<PLACEHOLDERS>` with actual values.

## Project Parameters

| Parameter | Value |
|-----------|-------|
| **Branch** | `master` |
| **Gunicorn service** | `tuhuella_project.service` |
| **Huey service** | `tuhuella-huey.service` |
| **Venv activation** | `source /home/ryzepeck/webapps/tuhuella_project/backend/venv/bin/activate` |
| **Requirements** | `/home/ryzepeck/webapps/tuhuella_project/backend/requirements.txt` |
| **Has frontend?** | `yes` |
| **Frontend build** | `npm ci && npm run build` |
| **Domain** | `tuhuella.projectapp.co` |
| **Settings module** | `base_feature_project.settings_prod` |

---

## Steps

### 1. Pull latest code
```bash
cd /home/ryzepeck/webapps/tuhuella_project
git pull origin master
```

### 2. Backend dependencies
```bash
source /home/ryzepeck/webapps/tuhuella_project/backend/venv/bin/activate
pip install -r /home/ryzepeck/webapps/tuhuella_project/backend/requirements.txt
```

### 3. Django migrations + collectstatic
```bash
cd /home/ryzepeck/webapps/tuhuella_project/backend
DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod python manage.py migrate
DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod python manage.py collectstatic --noinput
```

### 4. Frontend build (if applicable)
```bash
cd /home/ryzepeck/webapps/tuhuella_project/frontend
npm ci && npm run build
```

### 5. Restart services
```bash
sudo systemctl restart tuhuella_project.service tuhuella-huey.service tuhuella-frontend.service
```

### 6. Verify
```bash
# Service status
systemctl is-active tuhuella_project.service
systemctl is-active tuhuella-huey.service
systemctl is-active tuhuella-frontend.service

# Health check
curl -s https://tuhuella.projectapp.co/api/health/

# Check for errors in journal
journalctl -u tuhuella_project.service --since "5 minutes ago" --no-pager -n 20

# Run post-deploy check
bash ~/scripts/post-deploy-check.sh tuhuella_project
```

### 7. Resource limits verification
```bash
systemctl show tuhuella_project.service --property=MemoryMax,CPUQuota,TasksMax
```
