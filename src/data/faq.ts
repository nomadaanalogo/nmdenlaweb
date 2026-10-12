// Preguntas frecuentes: se muestran en la sección FAQ y se publican como datos
// estructurados (FAQPage) para Google y los buscadores de IA.
// Las respuestas son texto plano: el mismo texto se usa en la página y en el JSON-LD.

export const COLOMBIA_CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Santa Marta",
  "Cúcuta",
  "Ibagué",
  "Villavicencio",
  "Pasto",
  "Palmira",
];

export const USA_CITIES = ["Miami", "Orlando", "Houston", "Los Ángeles", "Nueva York", "Nueva Jersey", "Chicago", "Dallas"];

export const FAQ = [
  {
    q: "¿Hacen páginas web para negocios en toda Colombia?",
    a: `Sí. Trabajamos 100 % en línea con negocios de cualquier ciudad de Colombia: ${COLOMBIA_CITIES.slice(0, -1).join(", ")} y ${COLOMBIA_CITIES.at(-1)}, entre otras. Hacemos todo por WhatsApp, videollamada y correo, sin que tengas que desplazarte.`,
  },
  {
    q: "¿Trabajan con negocios hispanos en Estados Unidos?",
    a: `Sí. Creamos páginas web en español y posicionamos negocios latinos en Estados Unidos para que los encuentren clientes hispanohablantes en Google, Google Maps y las IAs. Atendemos negocios en ${USA_CITIES.slice(0, -1).join(", ")} y ${USA_CITIES.at(-1)}, entre otras ciudades.`,
  },
  {
    q: "¿Qué es el posicionamiento en IAs como ChatGPT y Gemini?",
    a: "Cada vez más personas le preguntan a ChatGPT, Gemini o Perplexity dónde comprar o a quién contratar. Preparamos tu página web con información clara, estructurada y confiable sobre tu negocio para que estas IAs la entiendan y puedan mostrarla en sus respuestas.",
  },
  {
    q: "¿Cómo me ayudan a aparecer en Google Maps?",
    a: "Creamos u optimizamos tu Perfil de Empresa en Google: categorías, servicios, horarios, fotos, descripción y reseñas. Además conectamos el perfil con tu página web para que Google confíe más en tu negocio y te muestre a clientes cercanos.",
  },
  {
    q: "¿Qué es el SEO y por qué lo necesita mi negocio?",
    a: "El SEO es el trabajo que hace que tu página aparezca en Google cuando alguien busca lo que vendes. Sin SEO, tu web existe pero casi nadie la ve. Con SEO, te encuentran clientes que ya están buscando tu producto o servicio.",
  },
  {
    q: "¿Mi página web se verá bien en el celular?",
    a: "Sí. Diseñamos primero para celular, porque la mayoría de tus clientes te buscan desde ahí. Tu página carga rápido y se ve bien en celular, tablet y computador.",
  },
  {
    q: "¿Cuánto cuesta una página web con SEO?",
    a: "Depende de lo que necesite tu negocio. Responde las preguntas del formulario y te enviamos una propuesta con el precio exacto y lo que incluye.",
  },
];

export const SERVICES = [
  {
    name: "Diseño de páginas web",
    description: "Páginas web rápidas, modernas y adaptadas a celular para negocios en Colombia y negocios hispanos en Estados Unidos.",
  },
  {
    name: "Posicionamiento SEO en Google",
    description: "Optimización para que tu negocio aparezca en Google cuando buscan lo que vendes.",
  },
  {
    name: "Posicionamiento en Google Maps",
    description: "Creación y optimización del Perfil de Empresa en Google para atraer clientes cercanos.",
  },
  {
    name: "Visibilidad en buscadores de IA",
    description: "Preparamos tu negocio para aparecer en las respuestas de ChatGPT, Gemini y otras IAs.",
  },
];
