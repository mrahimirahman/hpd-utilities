# HPD Utilities Ubuntu Deployment

This folder contains the deployment assets for Ubuntu server `10.29.59.55`.

## Target runtime
- Frontend: Angular static files served by Nginx on port `8081`
- Backend: Spring Boot JAR running as a systemd service
- Database: MySQL `his_kkm` on `10.29.59.55`

## Why port 8081
The existing staging environment already uses Nginx on port `80` for `/hiskkm_stg/`.
To avoid disturbing that setup, HPD Utilities is published on a separate listener:
```text
http://10.29.59.55:8081/
```

## Suggested server layout
- Frontend root: `/var/www/hpd-utilities`
- Backend app home: `/opt/hpd-utilities`
- Backend log dir: `/var/log/hpd-utilities`
- Backend service name: `hpd-utilities-backend`

## Files in this folder
- `nginx/hpd-utilities.conf`: Nginx site config
- `systemd/hpd-utilities-backend.service`: backend systemd unit
- `env/hpd-utilities-backend.env`: backend environment template
- `scripts/install_runtime.sh`: install Java, Nginx, folders, service user
- `scripts/deploy_frontend.sh`: deploy Angular build output to Nginx root
- `scripts/deploy_backend.sh`: deploy Spring Boot JAR and env config
- `scripts/restart_services.sh`: restart backend and Nginx
- `../windows/build-release.ps1`: build artifacts on the Windows machine

## End-to-end deployment flow

### 1. Build artifacts on Windows
```powershell
cd C:\trae_ai\hpd_utilities\deploy\windows
.\build-release.ps1
```

### 2. Copy artifacts to Ubuntu
Copy these items to the server, for example to `/tmp/hpd-utilities-release/`:
- `hospital-maintenance-frontend.zip`
- `maintenance-system-0.0.1-SNAPSHOT.jar`
- `hpd-utilities-backend.env`
- folder `ubuntu-deploy`

### 3. Install runtime on Ubuntu
```bash
cd /tmp/hpd-utilities-release/ubuntu-deploy/scripts
sudo bash install_runtime.sh
```

### 4. Deploy frontend
```bash
cd /tmp/hpd-utilities-release/ubuntu-deploy/scripts
sudo bash deploy_frontend.sh /tmp/hpd-utilities-release/hospital-maintenance-frontend.zip
```

### 5. Deploy backend
```bash
cd /tmp/hpd-utilities-release/ubuntu-deploy/scripts
sudo bash deploy_backend.sh \
  /tmp/hpd-utilities-release/maintenance-system-0.0.1-SNAPSHOT.jar \
  /tmp/hpd-utilities-release/hpd-utilities-backend.env
```

### 6. Verify
```bash
sudo systemctl status hpd-utilities-backend
sudo nginx -t
curl http://127.0.0.1:8080/api/auth/session
curl http://127.0.0.1:8081
```

Then open:
```text
http://10.29.59.55:8081/
```

## Notes
- Update the values inside `env/hpd-utilities-backend.env` before first deployment.
- Do not keep the database password in `application.properties` for production.
- The app uses `/api` automatically when accessed from the Ubuntu server host.
- Java 8 is preferred. The install script falls back to Java 11 only if Java 8 package is unavailable on the server.
