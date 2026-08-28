/**
 * Single source of truth for every user-visible string in the app.
 * Code stays in English; only the CONTENT here is in Spanish. No UI text
 * should be written inline in JSX anywhere else.
 */
export const strings = {
  common: {
    loading: "Cargando...",
    retry: "Reintentar",
    cancel: "Cancelar",
    accept: "Aceptar",
    save: "Guardar",
    delete: "Eliminar",
    back: "‹ Volver",
    noData: "No hay datos para mostrar.",
    genericError: "Ocurrió un error. Intenta de nuevo.",
    networkError: "No se pudo conectar con el servidor. Revisa tu conexión.",
    noMunicipality: "Sin municipio",
  },

  roles: {
    PRODUCER: "Fiel de Compra",
    PRICE_MANAGER: "Encargado de precios",
    ADMIN: "Administrador",
  } as Record<string, string>,

  select: {
    placeholder: "Selecciona una opción",
    noOptions: "No hay opciones disponibles",
  },

  auth: {
    portalTitle: "Portal Operativo",
    portalSubtitle: "Gestión y Control Agrícola",
    usernameLabel: "Usuario",
    usernamePlaceholder: "Ingrese su usuario",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "••••••••",
    loginButton: "Entrar",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    missingFields: "Ingresa tu usuario y contraseña",
    invalidCredentials: "Usuario o contraseña incorrectos",
  },

  tabs: {
    producer: {
      fix: "Fijar",
      history: "Historial",
      notifications: "Avisos",
      profile: "Perfil",
    },
    priceManager: {
      today: "Hoy",
      history: "Historial",
      updatePrice: "Precio",
      sendNotification: "Notificar",
      profile: "Perfil",
    },
    admin: {
      users: "Usuarios",
      coffeeTypes: "Precios",
      history: "Historial",
      chart: "Gráfico",
      profile: "Perfil",
    },
  },

  priceCard: {
    label: "Precio actual",
    perKg: "por kg",
    updatedOn: (date: string) => `Actualizado el ${date}`,
  },

  producerFix: {
    title: "Fijar precio",
    coffeeTypeLabel: "Tipo de café",
    kilosLabel: "Kilos a fijar",
    kilosPlaceholder: "Ej. 27",
    fixButton: "Fijar precio",
    selectCoffeeType: "Selecciona un tipo de café",
    invalidKilos: "Ingresa una cantidad de kilos válida",
    confirmMessage: (kilos: number, coffeeType: string, price: string) =>
      `¿Está seguro que desea fijar ${kilos} kg de café ${coffeeType} a ${price}?`,
    success: "Tu fijación fue registrada correctamente",
    emptyCoffeeTypes: "Aún no hay tipos de café disponibles.",
  },

  producerHistory: {
    title: "Mi historial",
    subtitle: "Tus fijaciones, de la más reciente a la más antigua",
    empty: "Todavía no has hecho ninguna fijación.",
  },

  fixingCard: {
    municipalityOf: (municipality: string) => `Municipio de ${municipality}`,
    summary: (kilos: string, coffeeType: string, price: string) =>
      `${kilos} de ${coffeeType} a ${price} / kg`,
    pricePerKg: (price: string) => `${price} / kg`,
  },

  notificationsInbox: {
    title: "Notificaciones",
    empty: "No tienes notificaciones.",
    meta: (sender: string, date: string) => `De ${sender} · ${date}`,
  },

  profile: {
    title: "Perfil",
    usernameLabel: "Usuario",
    municipalityLabel: "Municipio",
    noMunicipality: "No registrado",
    changePhoto: "Cambiar foto de perfil",
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión...",
    photoSheetTitle: "Foto de perfil",
    photoSheetHint: "Elige cómo quieres actualizar tu foto de perfil.",
    takePhoto: "Tomar foto",
    chooseFromGallery: "Elegir de galería",
    cameraPermissionDenied:
      "Necesitamos permiso de cámara para tomar la foto. Actívalo en los ajustes del teléfono.",
    galleryPermissionDenied:
      "Necesitamos permiso de galería para elegir una foto. Actívalo en los ajustes del teléfono.",
    uploadError: "No se pudo subir la imagen. Intenta de nuevo.",
    appearanceTitle: "Apariencia",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
  },

  priceManagerToday: {
    title: "Fijaciones del día",
    subtitle: "Agrupadas por tipo de café",
    empty: "Hoy todavía no hay fijaciones.",
    fixingCount: (count: number) => `${count} ${count === 1 ? "fijación" : "fijaciones"}`,
  },

  todayDetail: {
    fallbackTitle: "Detalle del día",
    subtitle: "Fijaciones de hoy",
    empty: "No hay fijaciones de este tipo hoy.",
  },

  history: {
    title: "Historial",
    subtitle: "Todas las fijaciones, de la más reciente a la más antigua",
    coffeeTypeFilterLabel: "Tipo de café",
    allTypes: "Todos los tipos",
    userFilterLabel: "Usuario",
    allUsers: "Todos los usuarios",
    municipalityLabel: "Municipio",
    municipalityPlaceholder: "Ej. Ancuya",
    nameLabel: "Nombre",
    namePlaceholder: "Buscar por nombre",
    fromLabel: "Desde",
    toLabel: "Hasta",
    datePlaceholder: "AAAA-MM-DD",
    applyFilters: "Aplicar filtros",
    empty: "No hay fijaciones que coincidan con los filtros.",
  },

  updatePrice: {
    title: "Actualizar precio",
    coffeeTypeLabel: "Tipo de café",
    currentPrice: (price: string) => `Precio actual: ${price} / kg`,
    newPriceLabel: "Nuevo precio por kg",
    newPricePlaceholder: "Ej. 12500",
    selectCoffeeType: "Selecciona un tipo de café",
    invalidPrice: "Ingresa un precio válido",
    success: (name: string, price: string) => `Precio de ${name} actualizado a ${price}`,
    saveButton: "Guardar precio",
    empty: "No hay tipos de café registrados.",
    optionLabel: (name: string, price: string) => `${name} — ${price}`,
  },

  sendNotification: {
    title: "Enviar notificación",
    messageLabel: "Mensaje",
    messagePlaceholder: "Escribe el mensaje para los fieles de compra",
    toAll: "A todos los fieles de compra",
    toSpecific: "Elegir destinatarios específicos",
    missingMessage: "Escribe un mensaje",
    missingRecipients: "Selecciona al menos un destinatario",
    success: (count: number) => `Notificación enviada a ${count} persona(s)`,
    sendButton: "Enviar",
    empty: "No hay fieles de compra registrados.",
  },

  adminUsers: {
    title: "Usuarios",
    createButton: "+ Crear",
    empty: "No hay usuarios.",
    suspend: "Suspender",
    activate: "Activar",
    delete: "Eliminar",
    statusActive: "Activo",
    statusSuspended: "Suspendido",
    deleteTitle: "Eliminar usuario",
    deleteMessage: (name: string) =>
      `¿Seguro que deseas eliminar a ${name}? Esta acción no se puede deshacer.`,
    meta: (role: string, municipality: string) => `${role} · ${municipality}`,
  },

  createUser: {
    title: "Crear usuario",
    usernameLabel: "Usuario",
    usernamePlaceholder: "nombre.usuario",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Mínimo 8 caracteres",
    generatePassword: "Generar contraseña",
    fullNameLabel: "Nombre completo",
    fullNamePlaceholder: "Nombre y apellido",
    municipalityLabel: "Municipio",
    municipalityPlaceholder: "Ej. Ancuya",
    roleLabel: "Rol",
    missingFields: "Completa usuario, contraseña, nombre y rol",
    createButton: "Crear usuario",
  },

  adminCoffeeTypes: {
    title: "Tipos de café",
    newTypeTitle: "Nuevo tipo de café",
    nameLabel: "Nombre",
    namePlaceholder: "Ej. Café Excelso",
    initialPriceLabel: "Precio inicial (opcional)",
    initialPricePlaceholder: "Ej. 12000",
    createButton: "Crear tipo de café",
    missingName: "Escribe un nombre para el tipo de café",
    currentPrice: (price: string) => `Precio actual: ${price} / kg`,
    newPriceLabel: "Nuevo precio",
    newPricePlaceholder: "Ej. 12500",
    invalidPrice: "Ingresa un precio válido",
    save: "Guardar",
    activate: "Activar",
    deactivate: "Desactivar",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    empty: "Aún no hay tipos de café. Crea el primero arriba.",
  },

  adminChart: {
    title: "Gráfico",
    subtitle: "Kilos fijados por tipo de café en los últimos 30 días",
    empty: "No hay fijaciones en los últimos 30 días.",
    typesWithActivity: (count: number) => `Total de tipos con actividad: ${count}`,
    fixingCount: (count: number) => `${count} ${count === 1 ? "fijación" : "fijaciones"}`,
  },

  logout: {
    accessibilityLabel: "Cerrar sesión",
  },

  inactivity: {
    title: "Sesión cerrada",
    message: "Pasó mucho tiempo de inactividad. Por seguridad, inicia sesión nuevamente.",
    acknowledge: "Entendido",
  },
} as const;
