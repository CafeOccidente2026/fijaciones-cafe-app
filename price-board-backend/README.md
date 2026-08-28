# Price Board — Backend

API para el "Portal Operativo de Café": maneja usuarios, roles, autenticación
(JWT + refresh token), tipos de café, fijaciones de precio y notificaciones.

## Arquitectura

Patrón por capas, una responsabilidad por clase:

```
src/
  config/       -> variables de entorno + cliente de Prisma (singleton)
  middlewares/  -> authenticate, authorize (por rol), manejo de errores
  utils/        -> password (bcrypt), tokens (JWT), respuestas de API
  modules/
    auth/       -> login, refresh, logout (COMPLETO en esta fase)
    users/      -> gestión de usuarios (siguiente fase)
    coffeeTypes/-> tipos de café y precio actual (siguiente fase)
    priceFixings/ -> fijaciones de kilos (siguiente fase)
    notifications/ -> notificaciones (siguiente fase)
```

Cada módulo sigue: `repository` (toca la BD) -> `service` (reglas de
negocio) -> `controller` (HTTP) -> `routes`.

## Requisitos

- Node.js 24.x (ya lo tienes instalado)
- Docker Desktop (ya lo tienes instalado)

## Puesta en marcha (paso a paso)

1. **Instalar dependencias:**
   ```
   npm install
   ```

2. **Crear tu archivo de variables de entorno:**
   Copia `.env.example` y renómbralo a `.env`. Cambia al menos
   `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` por cadenas largas y
   aleatorias (pueden ser cualquier texto largo, no tienen que tener un
   formato especial).

3. **Levantar PostgreSQL con Docker:**
   ```
   docker compose up -d
   ```
   Esto crea el contenedor `price_board_db`. Puedes verificar que quedó
   corriendo con `docker ps`.

4. **Crear las tablas en la base de datos:**
   ```
   npm run prisma:migrate
   ```
   Te va a pedir un nombre para la migración, puedes poner `init`.

5. **Crear el primer usuario administrador:**
   ```
   npm run prisma:seed
   ```
   Esto crea el usuario definido en `SEED_ADMIN_USERNAME` /
   `SEED_ADMIN_PASSWORD` de tu `.env`. Con ese usuario vas a poder
   loguearte y, desde el rol Administrador, crear a todos los demás
   usuarios (recuerda: la app NO tiene registro público).

6. **Arrancar el servidor en modo desarrollo:**
   ```
   npm run dev
   ```
   Deberías ver: `Price Board API corriendo en http://localhost:4000`

## Probar que funciona

Con el servidor corriendo, abre otra terminal y prueba:

```
curl http://localhost:4000/health
```

Y el login (reemplaza usuario/contraseña por los de tu `.env`):

```
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"ChangeMe123!\"}"
```

(en PowerShell el `^` de salto de línea puede fallar; puedes escribirlo
todo en una sola línea sin problema)

Deberías recibir un `accessToken`, un `refreshToken` y los datos del
usuario.

## Endpoints disponibles en esta fase

| Método | Ruta                | Descripción                          |
|--------|---------------------|---------------------------------------|
| POST   | /api/auth/login      | Inicia sesión, devuelve access+refresh |
| POST   | /api/auth/refresh    | Renueva el access token                |
| POST   | /api/auth/logout     | Revoca el refresh token                |
| GET    | /health               | Verifica que el servidor está vivo    |

## Seguridad implementada

- Contraseñas: nunca se guardan ni se comparan en texto plano — se cifran
  con **bcrypt** desde el momento en que se crea el usuario.
- **Access token** (JWT, expira rápido, ej. 15 min): va en cada request
  como `Authorization: Bearer <token>`.
- **Refresh token** (expira en días, se guarda en la base de datos y se
  puede revocar): se usa solo para pedir un access token nuevo sin volver
  a pedir usuario/contraseña. Se "rota" en cada uso (el viejo se invalida).
- El cierre de sesión por inactividad de 1 minuto se maneja del lado del
  **frontend** (un temporizador que detecta toques en pantalla) — el
  backend ya soporta esto porque el access token expira solo.

## Próxima fase

Construir los módulos `users`, `coffeeTypes`, `priceFixings` y
`notifications` siguiendo el mismo patrón de `auth`.
