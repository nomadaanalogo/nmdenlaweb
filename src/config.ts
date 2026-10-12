export const STUDIO_NAME = "nmdenlaweb";
// Dominio del sitio (sin "/" al final). Debe coincidir con `site` en astro.config.mjs.
export const SITE_URL = "https://nmdenlaweb.com";
export const EMAIL = "nmdenlaweb@gmail.com";
// TODO: Número en formato internacional, sin "+" ni espacios (ej: 573001234567).
export const WHATSAPP_NUMBER = "00000000000";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// URL de la App web de Google Apps Script (termina en /exec). Ver apps-script/Code.gs.
// Guarda cada solicitud en Google Sheets y envía el correo de respuesta automática.
// Si queda vacío, el formulario abre WhatsApp con las respuestas.
export const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxOJ_hm9LV0Zb9Zv54Mr5XEp1Hmkjfj_4FZgJVHmbh5YrDVL7J31OxeLFMcl7-B60EBoQ/exec";
