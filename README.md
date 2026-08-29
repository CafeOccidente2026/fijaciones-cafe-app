# Price Board — Portal Operativo de Café

Sistema para fijar y consultar el precio del café en tiempo real. Reemplaza el
proceso manual/telefónico entre productores y el encargado de precios con una
app móvil por rol y una API central que guarda el historial.

## Arquitectura

- **`price-board-backend/`** — API en Node.js + Express + Prisma + PostgreSQL
  (JWT con access/refresh token, arquitectura por capas: routes → controller
  → service → repository).
- **`price-board-frontend/`** — App móvil en Expo Router + React Native +
  NativeWind, con una experiencia separada por rol.

### Roles de usuario

- **Productor** ("Fiel de Compra"): fija los kilos de café que vende al
  precio del día.
- **Encargado de precios** (`PRICE_MANAGER`): actualiza el precio del día y
  envía notificaciones a los productores.
- **Administrador**: gestiona usuarios, tipos de café y consulta historial y
  gráficos.

## Puesta en marcha rápida

Requiere Node.js y Docker Desktop instalados. Cada paso está resumido — el
detalle completo de cada uno (variables de `.env`, troubleshooting, etc.)
está en el README de cada subproyecto, enlazado más abajo.

1. **Clonar el repo y entrar a cada carpeta por separado** (backend y
   frontend se instalan y arrancan de forma independiente).

2. **Backend:**
   ```
   cd price-board-backend
   npm install
   copy .env.example .env      # y completar los secretos de JWT
   docker compose up -d        # levanta PostgreSQL
   npm run prisma:migrate      # crea las tablas
   npm run prisma:seed         # crea el primer usuario administrador
   npm run dev                 # arranca la API en http://localhost:4000
   ```

3. **Frontend** (en otra terminal, con el backend ya corriendo):
   ```
   cd price-board-frontend
   npm install --legacy-peer-deps
   copy .env.example .env      # apuntar a la IP de tu PC en la red WiFi
   npm run start                # abre el QR para Expo Go
   ```

4. Iniciar sesión con el usuario administrador creado en el paso 2 (o los
   que hayas definido en el `.env` del backend).

## Más detalle

- [`price-board-backend/README.md`](./price-board-backend/README.md) —
  arquitectura del API, endpoints, seguridad, variables de entorno.
- [`price-board-frontend/README.md`](./price-board-frontend/README.md) —
  arquitectura de la app, requisitos de red para Expo Go, seguridad del lado
  del cliente.
