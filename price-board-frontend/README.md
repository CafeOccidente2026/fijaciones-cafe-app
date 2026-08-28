# Price Board — Frontend (Expo)

App móvil (Android/iOS, y también corre en web) del "Portal Operativo de
Café". Construida con Expo Router, NativeWind (Tailwind) y conectada al
backend de `price-board-backend`.

## Arquitectura

```
app/                -> pantallas (Expo Router: cada archivo = una ruta)
  _layout.tsx        -> layout raíz: gestos + sesión + detector de inactividad
  index.tsx           -> decide a dónde mandar al usuario (login u home)
  login.tsx            -> pantalla de inicio de sesión
  home.tsx              -> pantalla provisional post-login (se reemplaza en fase 4)

src/
  api/          -> httpClient (axios con refresh automático), authApi
  auth/         -> AuthContext, almacenamiento seguro de tokens, inactividad
  components/   -> componentes reutilizables (FormField, PrimaryButton)
  types/        -> tipos compartidos de TypeScript
  theme/        -> (colores están en tailwind.config.js)
```

## Requisitos

- El backend (`price-board-backend`) debe estar corriendo.
- Tu celular y tu PC deben estar en la **misma red WiFi** para probar con
  Expo Go.

## Puesta en marcha

1. **Instalar dependencias:**
   ```
   npm install --legacy-peer-deps
   ```
   (el `--legacy-peer-deps` es necesario por un conflicto menor entre
   Expo Router y una librería de web que no usaremos; es seguro).

2. **Configurar la URL del backend:**
   Copia `.env.example` a `.env`. Cambia la IP por la de tu computador
   en la red WiFi (no "localhost" — el celular no es la misma máquina).

   Para saber tu IP en Windows: abre `cmd` y escribe `ipconfig`, busca
   "Dirección IPv4" en tu adaptador WiFi (algo como `192.168.1.XX`).

3. **Arrancar el proyecto:**
   ```
   npm run start
   ```
   Esto abre una terminal con un código QR.

4. **Probar en tu celular:**
   Abre la app **Expo Go**, escanea el código QR. La app debería abrir
   directo en la pantalla de login.

5. **Probar el login:**
   Usa el usuario admin que creaste en el backend (`admin` /
   `ChangeMe123!`, o los que hayas cambiado en tu `.env` del backend).

## Seguridad implementada en esta fase

- Las contraseñas nunca se guardan en el celular — solo se envían una
  vez al backend para validarlas.
- El **access token** y el **refresh token** se guardan en el
  almacenamiento seguro del sistema operativo (`expo-secure-store`,
  Keychain en iOS / Keystore en Android), nunca en texto plano visible.
- Si el access token expira en medio de una petición, `httpClient` lo
  renueva automáticamente con el refresh token, sin que el usuario note
  nada ni tenga que volver a loguearse.
- Si el usuario **no toca la pantalla durante 1 minuto** estando logueado,
  se cierra la sesión automáticamente y aparece un mensaje pidiendo
  iniciar sesión de nuevo.

## Próxima fase

Reemplazar `app/home.tsx` por las tres experiencias reales según el rol
del usuario logueado (Productor, Encargado de precios, Administrador).
