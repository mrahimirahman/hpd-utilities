# HPD Utilities — Windows Server Deployment Guide

## Gambaran Keseluruhan

```
[Laptop Dev]                          [Windows Server]
     |                                      |
prepare-package.ps1  -->  server-package\  -->  install-server.ps1
(build + package)         (copy ke server)       (setup services)
```

Selepas setup:

```
Browser :8081  -->  nginx  -->  /api/*  -->  Spring Boot :8080  -->  MySQL DB
                       |
                  /  (frontend Angular)
```

---

## Prerequisite

### Laptop (build machine)
| Software | Versi | Guna untuk |
|---|---|---|
| Java (OpenJDK) | 17 | Compile & run backend |
| Maven | 3.6+ | Build backend |
| Node.js | 18+ | Build frontend |
| Angular CLI | 17 | Build frontend |

### Windows Server
| Software | Download | Install ke |
|---|---|---|
| OpenJDK 17 | [adoptium.net](https://adoptium.net) | Add `java` ke System PATH |
| nginx for Windows | [nginx.org/en/download.html](https://nginx.org/en/download.html) — pilih Stable | Extract ke `C:\nginx\` |
| NSSM | [nssm.cc/download](https://nssm.cc/download) — pilih 64-bit | Letak `nssm.exe` dalam `server-package\tools\` |

---

## Struktur Folder

### Selepas `prepare-package.ps1` dijalankan

```
server-package\
├── app.jar                        ← Backend Spring Boot
├── frontend\                      ← Angular built files
│   ├── index.html
│   └── ...
├── hpd-utilities-backend.env      ← Config (DB, API key)
├── install-server.ps1             ← Script setup server
├── SETUP.txt                      ← Quick reference
└── tools\
    └── nssm.exe                   ← (ko kena letak sendiri)
```

### Selepas `install-server.ps1` dijalankan kat server

```
C:\
├── hpd-utilities\
│   ├── app.jar
│   ├── frontend\
│   ├── hpd-utilities-backend.env
│   └── logs\
│       ├── backend.log
│       ├── backend-error.log
│       ├── hpd-access.log        ← nginx access log
│       └── hpd-error.log         ← nginx error log
└── nginx\
    └── conf\
        └── nginx.conf             ← Auto-generated oleh script
```

---

## Step-by-Step Deployment

### Step 1 — Edit Config

Edit `release\hpd-utilities-backend.env` sebelum package:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://10.29.217.205:3306/his_kkm?useSSL=false&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=utilities_app
SPRING_DATASOURCE_PASSWORD=<isi password DB>

OPENAI_API_KEY=<isi API key, atau kosongkan kalau tak guna>
OPENAI_MODEL=gpt-4.1-mini
```

### Step 2 — Build & Package (kat laptop)

Buka PowerShell sebagai Admin, run:

```powershell
cd C:\trae_ai\hpd_utilities
.\deploy\windows\prepare-package.ps1
```

Output: folder `server-package\` kat root project.

### Step 3 — Tambah nssm.exe

Download NSSM dari `nssm.cc/download`, extract `nssm.exe` (64-bit):

```
server-package\tools\nssm.exe
```

### Step 4 — Copy ke Server

Salin keseluruhan folder `server-package\` ke Windows Server.
Boleh guna RDP drag-and-drop, file share, atau USB.

Letak kat: `C:\server-package\`

### Step 5 — Install nginx kat Server

Download nginx for Windows (Stable version `.zip`) dari `nginx.org`.
Extract kandungan folder `nginx-x.x.x\` ke `C:\nginx\`.

Pastikan `C:\nginx\nginx.exe` wujud.

### Step 6 — Run Install Script (kat server)

Buka **PowerShell sebagai Administrator**:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd C:\server-package
.\install-server.ps1
```

Script akan:
- Semak semua requirement
- Copy files ke `C:\hpd-utilities\`
- Install & start backend sebagai Windows Service (`hpd-backend`)
- Generate nginx config & install sebagai Windows Service (`hpd-nginx`)
- Buka port `8081`, block port `8080` dari luar di firewall

### Step 7 — Verify

Dari PC lain, buka browser:

```
http://<server-ip>:8081
```

Login dan pastikan dashboard load dengan data.

---

## Pengurusan Services

### Check status
```powershell
Get-Service hpd-backend, hpd-nginx
```

### Start / Stop / Restart
```powershell
Start-Service hpd-backend
Stop-Service hpd-backend
Restart-Service hpd-backend

Start-Service hpd-nginx
Stop-Service hpd-nginx
Restart-Service hpd-nginx
```

### Remove services (kalau nak uninstall)
```powershell
C:\server-package\tools\nssm.exe stop hpd-backend confirm
C:\server-package\tools\nssm.exe remove hpd-backend confirm

C:\server-package\tools\nssm.exe stop hpd-nginx confirm
C:\server-package\tools\nssm.exe remove hpd-nginx confirm
```

---

## Update App (Deploy Versi Baru)

1. Kat laptop, run semula `prepare-package.ps1`
2. Copy `server-package\app.jar` yang baru ke `C:\hpd-utilities\app.jar`
3. Copy `server-package\frontend\*` ke `C:\hpd-utilities\frontend\`
4. Restart services:
```powershell
Restart-Service hpd-backend
Restart-Service hpd-nginx
```

---

## Troubleshooting

### Backend tak start

Semak log:
```powershell
Get-Content C:\hpd-utilities\logs\backend-error.log -Tail 50
```

Isu biasa:
| Error | Punca | Penyelesaian |
|---|---|---|
| `Cannot connect to DB` | DB IP salah / firewall | Semak `SPRING_DATASOURCE_URL` dalam `.env` |
| `InaccessibleObjectException` | Java version issue | Pastikan pakai Java 17 |
| `JAXBException` | JAXB missing | Guna JAR dari `prepare-package.ps1` (dah include fix) |
| Port 8080 already in use | Ada proses lain | `netstat -ano \| findstr :8080` |

### Frontend tak load / 404

Semak nginx log:
```powershell
Get-Content C:\nginx\logs\hpd-error.log -Tail 30
```

Pastikan path frontend dalam `nginx.conf` betul:
```
root C:/hpd-utilities/frontend;
```

### API call fail (502 Bad Gateway)

Backend belum ready atau crash. Semak:
```powershell
Get-Service hpd-backend
Get-Content C:\hpd-utilities\logs\backend-error.log -Tail 30
```

---

## Port Reference

| Port | Guna untuk | Accessible dari |
|---|---|---|
| `8081` | Frontend + API proxy (nginx) | Semua (firewall open) |
| `8080` | Backend Spring Boot | Localhost sahaja (firewall block) |
| `3306` | MySQL DB | Server ke DB server sahaja |
