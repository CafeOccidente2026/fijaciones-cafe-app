# Guía de redespliegue del backend

Cómo montar el backend de Fijaciones desde cero en un servidor nuevo. El VPS
original se eliminó a propósito durante la pausa del proyecto; no había datos
de producción importantes.

> **Nunca escribas en este archivo ni en el repo contraseñas, secretos ni
> tokens reales.** Los valores originales los guarda el dueño del proyecto en
> su gestor de contraseñas. Si no están disponibles, se generan nuevos (ver
> paso 2.2).

## Qué vive fuera del servidor (no hay que rehacerlo)

Nada de esto depende del VPS; al volver no hay que tocarlo:

- **El código**, en GitHub: `CafeOccidente2026/fijaciones-cafe-app` (público).
- **El proyecto de Expo/EAS** `cafeoccidentes-team/fijaciones-cafe`, con su
  keystore de Android y la clave de cuenta de servicio de Firebase para las
  notificaciones push (FCM V1), ya subida a EAS.
- **El proyecto de Firebase** `fijaciones-cafeoccidente`.
- **El dominio** `cafeoccidente.co` y su cPanel.

## Qué sí hay que rehacer

- El servidor (VPS) y toda su preparación.
- El registro DNS `A` de `fijaciones.cafeoccidente.co` hacia la IP nueva.
- El certificado SSL (certbot).
- Los valores del `.env` del backend (y la contraseña de PostgreSQL).
- Los datos: la base de datos y las fotos de perfil (`uploads/`) empiezan
  vacías.

**Sobre la app instalada en los celulares:** mientras el dominio siga siendo
`fijaciones.cafeoccidente.co`, el `.apk` ya instalado vuelve a funcionar solo
en cuanto el servidor esté en línea otra vez. Solo hay que recompilar el
`.apk` si cambia la URL del backend: en ese caso se actualiza la variable
`EXPO_PUBLIC_API_URL` en EAS (entorno `preview`) —termina en `/api`, por
ejemplo `https://otro-dominio/api`— y se hace un build nuevo con el perfil
`preview`. Ojo: los usuarios existentes se perdieron con la base de datos,
así que hay que crearlos de nuevo desde el administrador.

---

## 1. Servidor

**Plan original:** Hetzner Cloud, Ubuntu, ubicación Ashburn (us-east), plan
CPX11 (2 vCPU, 2 GB RAM), acceso con llave SSH (sin contraseña).

### 1.1 DNS (hacerlo primero)

En el cPanel de `cafeoccidente.co` → Zone Editor, crear o editar el registro
`A` de `fijaciones` apuntando a la IP del servidor nuevo. La propagación
puede tardar; hacerlo al principio deja tiempo antes de llegar a certbot.

### 1.2 Preparación (como `root`)

```bash
apt update && apt upgrade -y
```

**Swap de 2 GB** (2 GB de RAM se quedan cortos al compilar con `tsc`):

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Usuario `priceboard`** con sudo y la misma llave SSH:

```bash
adduser priceboard
usermod -aG sudo priceboard
rsync --archive --chown=priceboard:priceboard ~/.ssh /home/priceboard
```

**Antes de seguir**, desde tu PC abre otra terminal y verifica que entras con
`ssh priceboard@<IP>` y que `sudo` funciona. No cierres la sesión de root
hasta comprobarlo.

**Firewall:**

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

El puerto 4000 **no** se abre: todo el tráfico entra por Nginx.

### 1.3 Software (como `priceboard`, con `sudo`)

**Docker** desde el repositorio oficial (seguir
<https://docs.docker.com/engine/install/ubuntu/>, sección *Install using the
apt repository*). Luego:

```bash
sudo usermod -aG docker priceboard
```

Cerrar la sesión SSH y volver a entrar para que el grupo surta efecto
(verificar con `docker ps` sin `sudo`).

**Node.js 24** vía NodeSource, más git, pm2, Nginx y certbot:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

---

## 2. Backend

### 2.1 Clonar

```bash
cd ~
git clone https://github.com/CafeOccidente2026/fijaciones-cafe-app.git
cd ~/fijaciones-cafe-app/price-board-backend
```

### 2.2 Generar secretos

```bash
openssl rand -hex 32   # una vez para JWT_ACCESS_SECRET
openssl rand -hex 32   # otra vez para JWT_REFRESH_SECRET (distinto)
openssl rand -hex 16   # contraseña de la base de datos
```

Guardar los valores nuevos en el gestor de contraseñas.

### 2.3 Crear `.env`

```bash
cp .env.example .env
nano .env
```

Variables (solo nombres; los valores van en el servidor, nunca en el repo):

| Variable | Valor / cómo obtenerlo |
|---|---|
| `DATABASE_URL` | `postgresql://price_board_user:<CONTRASEÑA_BD>@localhost:5432/price_board?schema=public` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` (distinto al anterior) |
| `JWT_ACCESS_EXPIRES_IN` | p. ej. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | p. ej. `7d` |
| `BCRYPT_SALT_ROUNDS` | p. ej. `10` |
| `PUBLIC_BASE_URL` | `https://fijaciones.cafeoccidente.co` (necesario: sin él las URLs de las fotos de perfil salen con `http://`, porque Express está detrás de Nginx) |
| `SEED_ADMIN_USERNAME` | usuario del primer administrador |
| `SEED_ADMIN_PASSWORD` | contraseña del primer administrador |
| `SEED_ADMIN_FULLNAME` | nombre a mostrar del administrador |
| `GMAIL_BACKUP_USER` | cuenta de Gmail del respaldo (solo si se activa, ver sección 4) |
| `RESPALDO_FIJACIONES` | contraseña de aplicación de esa cuenta de Gmail (no la contraseña normal) |

Usuario y nombre de la base (`price_board_user`, `price_board`) son los que
define `docker-compose.yml`.

### 2.4 Ajustar `docker-compose.yml` (solo en el servidor)

En `price-board-backend/docker-compose.yml`:

1. Cambiar `POSTGRES_PASSWORD` por la contraseña nueva de la base de datos;
   debe ser **la misma** que va en `DATABASE_URL`.
2. Cambiar `- "5432:5432"` por `- "127.0.0.1:5432:5432"`. Docker abre los
   puertos publicados saltándose `ufw`, así que con la línea original
   PostgreSQL queda expuesto a internet aunque el firewall diga lo
   contrario.

No hacer commit de estos cambios (la contraseña no debe llegar a GitHub).

> PostgreSQL solo toma `POSTGRES_PASSWORD` **la primera vez** que crea el
> volumen. Si ya existe un volumen creado con otra contraseña, el login
> fallará; hay que borrarlo con `docker compose down -v` (**esto borra todos
> los datos**) y volver a levantarlo.

### 2.5 Levantar la base de datos

```bash
docker compose up -d
docker ps   # esperar a que price_board_db diga (healthy)
```

### 2.6 Instalar, migrar, sembrar y compilar

```bash
npm install
npx prisma generate
npx prisma migrate deploy   # en producción NUNCA "migrate dev"
npm run prisma:seed         # crea el primer administrador desde el .env
npm run build
```

Nota: `npm install` debe instalar también las dependencias de desarrollo
(`tsx` las necesitan el seed y el respaldo, `typescript` el build). No
exportar `NODE_ENV=production` en la shell antes de este paso; el valor del
`.env` no afecta a npm.

### 2.7 Arrancar con pm2

```bash
pm2 start dist/server.js --name price-board-api
pm2 startup     # imprime un comando "sudo env PATH=..." → copiarlo y ejecutarlo
pm2 save
```

Comprobar localmente: `curl http://localhost:4000/health`.

---

## 3. Nginx + SSL

Crear `/etc/nginx/sites-available/fijaciones-cafe`:

```nginx
server {
    listen 80;
    server_name fijaciones.cafeoccidente.co;

    # Las fotos de perfil aceptan hasta 5 MB; el límite por defecto de Nginx es 1 MB.
    client_max_body_size 6M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activarlo:

```bash
sudo ln -s /etc/nginx/sites-available/fijaciones-cafe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Antes de certbot**, confirmar que el DNS ya apunta a la IP nueva (si no,
certbot falla):

```bash
nslookup fijaciones.cafeoccidente.co   # debe mostrar la IP del servidor nuevo
```

Luego:

```bash
sudo certbot --nginx -d fijaciones.cafeoccidente.co
```

certbot modifica el archivo de Nginx para HTTPS y deja la renovación
automática configurada (`sudo certbot renew --dry-run` para probarla).

---

## 4. Respaldo automático (opcional, hoy desactivado)

`npm run backup:db` (`scripts/backup-database.ts`) hace un `pg_dump` del
contenedor `price_board_db`, lo comprime en
`/home/priceboard/backups/price_board_backup.sql.gz` (ruta fija: requiere el
usuario `priceboard`) y lo envía por Gmail a `GMAIL_BACKUP_USER`. Hetzner
bloquea la salida por los puertos 25 y 465, por eso el script usa el 587 con
STARTTLS.

Probarlo a mano primero:

```bash
cd ~/fijaciones-cafe-app/price-board-backend && npm run backup:db
```

cron no carga el `PATH` de la sesión, así que hay que darle la carpeta de
`node`. Obtenerla con:

```bash
dirname "$(which node)"   # con NodeSource normalmente es /usr/bin
```

Luego `crontab -e` y agregar (lunes y jueves a las 3:00 AM), reemplazando
`<CARPETA_NODE>`:

```
0 3 * * 1,4 cd /home/priceboard/fijaciones-cafe-app/price-board-backend && PATH=<CARPETA_NODE>:/usr/local/bin:/usr/bin:/bin npm run backup:db >> /home/priceboard/backup-db.log 2>&1
```

La hora es la del servidor (UTC por defecto en Hetzner; 3:00 UTC = 22:00 en
Colombia).

---

## 5. Verificación final

```bash
curl https://fijaciones.cafeoccidente.co/health
# {"success":true,"data":{"status":"ok"}}
```

Y probar el login con el administrador creado por el seed, desde la app o
con:

```bash
curl -X POST https://fijaciones.cafeoccidente.co/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<SEED_ADMIN_USERNAME>","password":"<SEED_ADMIN_PASSWORD>"}'
```

Debe devolver `accessToken`, `refreshToken` y los datos del usuario.

## Actualizar el código más adelante

```bash
cd ~/fijaciones-cafe-app && git pull
cd price-board-backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart price-board-api
```

Si hiciste `git pull` con `docker-compose.yml` modificado localmente y hay
conflicto, usa `git stash` / `git stash pop` para conservar tus cambios.
