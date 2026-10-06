// Tarifas de Inter Rapidísimo (mensajería expresa / carga express, hasta 60 kg).
// Fuente: Tarifario público GME-GCV-F-01 versión 6, vigente desde el 30 de junio de 2026.
export const ORIGIN = { department: "Bogotá, D.C.", city: "Bogotá, D.C." };

// Peso promedio asumido por unidad de producto (los productos no tienen peso registrado).
export const UNIT_WEIGHT_KG = Number(process.env.SHIPPING_UNIT_WEIGHT_KG) || 1;

// base = kilo inicial; extra[tier] = valor del kilo adicional según la distancia.
export const RATES = {
  local: { base: 7900, extra: [3800] },
  regional: { base: 11600, extra: [4400, 5900, 7700] },
  metropolitano: { base: 17600, extra: [4900, 6100, 8000, 9200] },
  municipal: { base: 20000, extra: [4900, 6100, 8000, 9200] },
  dificil: { base: 31000, extra: [13500, 17300, 22000] },
};

export const SOBREFLETE_RATE = 0.02;
// Valor mínimo declarado por envío: [peso máximo en kg, valor].
export const MIN_DECLARED_VALUE = [
  [2, 45000],
  [5, 60000],
  [Infinity, 75000],
];

// ---------------------------------------------------------------------------
// CLASIFICACIÓN DE DESTINOS (APROXIMADA)
// El tarifario no publica a qué zona ni a qué tramo de distancia pertenece cada
// municipio; esta clasificación es una estimación desde Bogotá y debe validarse
// contra el cotizador de Inter Rapidísimo. Ajustar aquí sin tocar el cálculo.
// ---------------------------------------------------------------------------

// Destinos tratados como zona local (clave "Departamento|Ciudad").
export const LOCAL_CITIES = new Set(["Bogotá, D.C.|Bogotá, D.C.", "Cundinamarca|Soacha"]);

// Zona regional: departamento -> tramo de distancia (índice en RATES.regional.extra).
export const REGIONAL_DEPARTMENTS = {
  Cundinamarca: 0,
  Boyacá: 1,
  Tolima: 1,
  Meta: 1,
};

// Zona de difícil acceso: departamento -> tramo (índice en RATES.dificil.extra).
export const HARD_ACCESS_DEPARTMENTS = {
  Guaviare: 0,
  Chocó: 1,
  Amazonas: 2,
  Guainía: 2,
  Vaupés: 2,
  Vichada: 2,
  "Archipiélago de San Andrés, Providencia y Santa Catalina": 2,
};

// Zona nacional (metropolitano o municipal): departamento -> tramo de distancia.
export const NATIONAL_DEPARTMENT_TIER = {
  Caldas: 0,
  Quindío: 0,
  Risaralda: 0,
  Huila: 0,
  Santander: 0,
  Casanare: 0,
  Antioquia: 1,
  "Valle del Cauca": 1,
  Cauca: 1,
  "Norte de Santander": 1,
  Atlántico: 2,
  Bolívar: 2,
  Magdalena: 2,
  Córdoba: 2,
  Sucre: 2,
  Cesar: 2,
  Arauca: 2,
  Caquetá: 2,
  "La Guajira": 3,
  Nariño: 3,
  Putumayo: 3,
};
export const DEFAULT_NATIONAL_TIER = 3;

// Ciudades principales (capitales y áreas metropolitanas): "Departamento|Ciudad".
export const METROPOLITAN_CITIES = new Set([
  "Antioquia|Medellín", "Antioquia|Bello", "Antioquia|Envigado", "Antioquia|Itagüí", "Antioquia|Sabaneta",
  "Atlántico|Barranquilla", "Atlántico|Soledad",
  "Bolívar|Cartagena de Indias",
  "Caldas|Manizales",
  "Caquetá|Florencia",
  "Cauca|Popayán",
  "Cesar|Valledupar",
  "Córdoba|Montería",
  "Huila|Neiva",
  "La Guajira|Riohacha",
  "Magdalena|Santa Marta",
  "Nariño|Pasto",
  "Norte de Santander|San José de Cúcuta",
  "Quindío|Armenia",
  "Risaralda|Pereira", "Risaralda|Dosquebradas",
  "Santander|Bucaramanga", "Santander|Floridablanca", "Santander|Girón", "Santander|Piedecuesta",
  "Sucre|Sincelejo",
  "Valle del Cauca|Santiago de Cali", "Valle del Cauca|Palmira", "Valle del Cauca|Yumbo",
  "Valle del Cauca|Jamundí", "Valle del Cauca|Tuluá", "Valle del Cauca|Buenaventura",
  "Casanare|Yopal",
  "Arauca|Arauca",
  "Putumayo|Mocoa",
]);
