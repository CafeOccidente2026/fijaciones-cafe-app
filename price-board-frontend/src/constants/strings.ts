import { NotificationAudience } from "../types/notification.types";

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
    PRICE_MANAGER: "Encargado",
    ADMIN: "Administrador",
  } as Record<string, string>,

  select: {
    placeholder: "Selecciona una opción",
    noOptions: "No hay opciones disponibles",
  },

  auth: {
    portalTitle: "Portal Operativo",
    portalSubtitle: "Gestión y Control de Fijaciones",
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
      notifications: "Notificaciones",
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
      notify: "Notificar",
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
    kilosPrefix: "Kg: ",
    fixButton: "Fijar precio",
    priceUpdatesBadge: "tipos con precio actualizado sin ver",
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
    changePassword: "Cambiar contraseña",
  },

  changePassword: {
    title: "Cambiar contraseña",
    currentPasswordLabel: "Contraseña actual",
    currentPasswordPlaceholder: "••••••••",
    newPasswordLabel: "Nueva contraseña",
    newPasswordPlaceholder: "Mínimo 8 caracteres",
    confirmPasswordLabel: "Repetir nueva contraseña",
    confirmPasswordPlaceholder: "••••••••",
    missingFields: "Completa los 3 campos",
    tooShort: "La nueva contraseña debe tener al menos 8 caracteres",
    passwordsDontMatch: "Las contraseñas nuevas no coinciden",
    success: "Tu contraseña se actualizó correctamente",
    saveButton: "Guardar contraseña",
  },

  priceManagerToday: {
    title: "Fijaciones del día",
    subtitle: "Agrupadas por tipo de café",
    empty: "Hoy todavía no hay fijaciones.",
    fixingCount: (count: number) =>
      `${count} ${count === 1 ? "fijación hoy" : "fijaciones hoy"}`,
    newCount: (count: number) => `${count} ${count === 1 ? "nueva" : "nuevas"}`,
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
    applyFilter: "Aplicar filtro",
    filterButton: "Filtro",
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
    messagePlaceholder: "Escribe el mensaje a enviar",
    toAll: "A todos los fieles de compra",
    toAllPriceManagers: "A todos los Encargados",
    toSpecific: "Elegir destinatarios específicos",
    missingMessage: "Escribe un mensaje",
    missingRecipients: "Selecciona al menos un destinatario",
    success: (audience: NotificationAudience, count: number) => {
      if (audience === "ALL_PRODUCER") return "Notificación enviada a todos los Fieles de Compra";
      if (audience === "ALL_PRICE_MANAGER") return "Notificación enviada a todos los Encargados";
      return `Notificación enviada a ${count} ${count === 1 ? "persona" : "personas"}`;
    },
    sendButton: "Enviar",
    empty: "No hay fieles de compra registrados.",
    emptyAdmin: "No hay usuarios disponibles para notificar.",
    historyButtonLabel: "Ver historial de notificaciones",
  },

  notificationsHistory: {
    title: "Historial de notificaciones",
    sentTab: "Enviadas",
    receivedTab: "Recibidas",
    sentEmpty: "Aún no has enviado notificaciones.",
    audienceAllProducer: "Enviado a todos los Fieles de Compra",
    audienceAllPriceManager: "Enviado a todos los Encargados",
    audienceSpecific: (count: number) =>
      `Enviado a ${count} ${count === 1 ? "destinatario" : "destinatarios"}`,
    meta: (audience: string, date: string) => `${audience} · ${date}`,
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
    weekOf: (range: string) => `Semana del ${range}`,
    historyButtonLabel: "Ver historial de semanas",
    empty: "No hay fijaciones en esta semana.",
    fixingCount: (count: number) => `${count} ${count === 1 ? "fijación" : "fijaciones"}`,
    downloadReport: "Descargar reporte",
    downloading: "Descargando...",
    downloadError: "No se pudo descargar el reporte. Intenta de nuevo.",
  },

  weeklyByUser: {
    subtitle: "Fieles de Compra que fijaron esta semana",
    empty: "Nadie fijó este tipo de café en esta semana.",
    row: (name: string, kilos: string) => `${name} — ${kilos}`,
  },

  weeklyUserFixings: {
    subtitle: (coffeeTypeName: string) => `Fijaciones de ${coffeeTypeName} esta semana`,
    empty: "Esta persona no tiene fijaciones de este tipo en esta semana.",
    row: (time: string, kilos: string) => `${time} — ${kilos}`,
  },

  weeklyHistory: {
    title: "Historial de semanas",
    subtitle: "Semanas ya cerradas, de la más reciente a la más antigua",
    empty: "Aún no hay semanas cerradas con fijaciones.",
    fixingCount: (count: number) => `${count} ${count === 1 ? "fijación" : "fijaciones"}`,
  },

  priceHistory: {
    fixingsTab: "Fijaciones",
    pricesTab: "Cambios de precio",
    empty: "No hay cambios de precio que coincidan con los filtros.",
    changedBy: (name: string, role: string) => `${name} (${role})`,
    newPrice: (price: string) => `Nuevo precio: ${price} / kg`,
  },

  fontScale: {
    title: "Tamaño de letra",
    small: "Pequeño",
    normal: "Normal",
    large: "Grande",
    extraLarge: "Muy grande",
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
