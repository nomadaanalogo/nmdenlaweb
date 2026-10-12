/**
 * nmdenlaweb · Formulario "Cuéntanos de tu negocio"
 *
 * Recibe las respuestas del formulario de la web, las guarda en esta hoja de cálculo
 * y envía dos correos:
 *   1. Respuesta automática al cliente.
 *   2. Aviso a nmdenlaweb@gmail.com con todos los datos.
 *
 * Instalación: ver apps-script/README.md
 */

// ---------- Configuración ----------
const CONFIG = {
  STUDIO_NAME: "nmdenlaweb",
  NOTIFY_EMAIL: "nmdenlaweb@gmail.com",
  // Número de WhatsApp del estudio, formato internacional sin "+" (ej: 573001234567).
  STUDIO_WHATSAPP: "573154483584",
  // Indicativo que se agrega a los números de 10 dígitos que escriben los clientes.
  COUNTRY_CODE: "57",
  SHEET_NAME: "Solicitudes",
  // Anti-bots
  MIN_FILL_MS: 4000, // Envíos más rápidos que esto se descartan.
  MAX_PER_HOUR: 30, // Máximo de solicitudes aceptadas por hora en total.
  REPEAT_WINDOW_SECONDS: 600, // Mismo correo/WhatsApp: 1 envío cada 10 minutos.
  MAIL_QUOTA_RESERVE: 10, // Correos diarios reservados para los avisos a nmdenlaweb@gmail.com.
};

const HEADERS = [
  "Fecha",
  "Nombre",
  "WhatsApp",
  "Correo",
  "Página web",
  "Google Maps",
  "Tipo de negocio",
  "Sobre su negocio",
  "Estado",
];

// ---------- Endpoints ----------

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // ---------- Anti-bots ----------
    // 1. Campo trampa: si viene lleno es un bot. Respondemos ok para no darle pistas.
    if (data.website) return jsonResponse({ ok: true });

    // 2. Trampa de tiempo: una persona tarda varios segundos en responder 5 pasos.
    // (Si no viene el tiempo, también se descarta: Number(undefined) es NaN.)
    if (!(Number(data.elapsed) >= CONFIG.MIN_FILL_MS)) return jsonResponse({ ok: true });

    // 3. Límite global por hora, para frenar ataques masivos.
    if (!underGlobalLimit()) {
      return jsonResponse({ ok: false, error: "Demasiadas solicitudes en este momento. Intenta en unos minutos." });
    }

    const lead = {
      nombre: cleanLine(data.nombre, 80),
      whatsapp: cleanLine(data.whatsapp, 30),
      correo: cleanLine(data.correo, 160).toLowerCase(),
      web: cleanLine(data.web, 120),
      maps: cleanLine(data.maps, 120),
      local: cleanLine(data.local, 120),
      negocio: clean(data.negocio, 2000),
    };

    if (!lead.nombre || lead.whatsapp.replace(/\D/g, "").length < 7) {
      return jsonResponse({ ok: false, error: "Faltan el nombre o el WhatsApp." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.correo)) {
      return jsonResponse({ ok: false, error: "El correo no es válido." });
    }

    // Un nombre con enlaces es spam: así evitamos que usen el correo automático para mandar links.
    if (/https?:|www\.|:\/\/|\.(com|net|org|ru|xyz|top)\b/i.test(lead.nombre)) {
      return jsonResponse({ ok: true });
    }

    // 4. Un mismo correo o WhatsApp solo una vez cada 10 minutos (evita duplicados y spam repetido).
    if (isRepeated(lead)) return jsonResponse({ ok: true });

    saveLead(lead);

    // Los correos no deben impedir que la solicitud quede guardada.
    try {
      if (MailApp.getRemainingDailyQuota() > CONFIG.MAIL_QUOTA_RESERVE) sendAutoReply(lead);
    } catch (err) {
      console.error("Error enviando respuesta automática", err);
    }
    try {
      notifyStudio(lead);
    } catch (err) {
      console.error("Error enviando aviso al estudio", err);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: "Error interno." });
  } finally {
    lock.releaseLock();
  }
}

// Abre la URL /exec en el navegador para comprobar que la App web está publicada.
function doGet() {
  return ContentService.createTextOutput("nmdenlaweb · formulario activo ✔");
}

// ---------- Hoja de cálculo ----------

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet
      .getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#b954ff")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(8, 360);
  }
  return sheet;
}

function saveLead(lead) {
  const sheet = getSheet();
  sheet.appendRow([
    new Date(),
    safeCell(lead.nombre),
    safeCell(lead.whatsapp),
    safeCell(lead.correo),
    safeCell(lead.web),
    safeCell(lead.maps),
    safeCell(lead.local),
    safeCell(lead.negocio),
    "Nuevo",
  ]);
}

// ---------- Correos ----------

function sendAutoReply(lead) {
  const firstName = lead.nombre.split(" ")[0];
  const waLink = "https://wa.me/" + CONFIG.STUDIO_WHATSAPP;

  const html = `
  <div style="margin:0;padding:32px 16px;background:#f4f1f8;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:#0c0c0f;padding:24px 28px;">
        <span style="font-size:22px;font-weight:bold;color:#ffffff;">nmd<span style="color:#b954ff;">enlaweb</span></span>
      </div>
      <div style="height:4px;background:linear-gradient(90deg,#b954ff,#ff4ecd);background-color:#b954ff;"></div>
      <div style="padding:32px 28px;color:#050506;">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">¡Hola ${escapeHtml(firstName)}! Recibimos tu solicitud 🙌</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;">
          Gracias por contarnos de tu negocio. Ya estamos revisando tus respuestas para preparar
          <strong style="color:#050506;">una propuesta a tu medida</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#3f3f46;">
          Te escribiremos pronto por WhatsApp al <strong style="color:#050506;">${escapeHtml(lead.whatsapp)}</strong>
          y por este correo.
        </p>

        <div style="background:#faf8fd;border:1px solid #ece6f5;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
          <p style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#b954ff;font-weight:bold;">Lo que nos contaste</p>
          ${summaryRow("Página web", lead.web)}
          ${summaryRow("Google Maps", lead.maps)}
          ${summaryRow("Tu negocio es", lead.local)}
        </div>

        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3f3f46;">¿Quieres adelantar la conversación?</p>
        <a href="${waLink}" style="display:inline-block;background:#b954ff;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 26px;border-radius:999px;">
          Escríbenos por WhatsApp
        </a>
      </div>
      <div style="padding:20px 28px;border-top:1px solid #ece6f5;font-size:13px;color:#71717a;">
        ${CONFIG.STUDIO_NAME} · Estudio de diseño web y marketing digital<br>
        Hagamos que tus clientes te encuentren más fácil.
      </div>
    </div>
  </div>`;

  const text =
    `¡Hola ${firstName}! Recibimos tu solicitud.\n\n` +
    `Gracias por contarnos de tu negocio. Ya estamos revisando tus respuestas para preparar una propuesta a tu medida.\n` +
    `Te escribiremos pronto por WhatsApp al ${lead.whatsapp} y por este correo.\n\n` +
    `¿Quieres adelantar la conversación? ${waLink}\n\n` +
    `${CONFIG.STUDIO_NAME} · Estudio de diseño web y marketing digital`;

  MailApp.sendEmail({
    to: lead.correo,
    subject: `Recibimos tu solicitud, ${firstName} · ${CONFIG.STUDIO_NAME}`,
    body: text,
    htmlBody: html,
    name: CONFIG.STUDIO_NAME,
    replyTo: CONFIG.NOTIFY_EMAIL,
  });
}

function notifyStudio(lead) {
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const waLink = "https://wa.me/" + toWhatsAppNumber(lead.whatsapp);

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#050506;">
    <h2 style="margin:0 0 4px;">Nueva solicitud de propuesta</h2>
    <p style="margin:0 0 20px;color:#71717a;">${new Date().toLocaleString("es-CO")}</p>
    ${summaryRow("Nombre", lead.nombre)}
    ${summaryRow("WhatsApp", lead.whatsapp)}
    ${summaryRow("Correo", lead.correo)}
    ${summaryRow("Página web", lead.web)}
    ${summaryRow("Google Maps", lead.maps)}
    ${summaryRow("Tipo de negocio", lead.local)}
    ${summaryRow("Sobre su negocio", lead.negocio)}
    <p style="margin:24px 0 0;">
      <a href="${waLink}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px;margin-right:8px;">Escribirle por WhatsApp</a>
      <a href="${sheetUrl}" style="display:inline-block;background:#b954ff;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px;">Abrir la hoja</a>
    </p>
  </div>`;

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: `🟣 Nueva solicitud: ${lead.nombre}`,
    body:
      `Nueva solicitud de ${lead.nombre}\n` +
      `WhatsApp: ${lead.whatsapp}\nCorreo: ${lead.correo}\n` +
      `Web: ${lead.web}\nMaps: ${lead.maps}\nTipo: ${lead.local}\n` +
      `Negocio: ${lead.negocio}\n\nHoja: ${sheetUrl}`,
    htmlBody: html,
    name: `${CONFIG.STUDIO_NAME} · Web`,
    replyTo: lead.correo,
  });
}

// ---------- Anti-bots ----------

function underGlobalLimit() {
  const cache = CacheService.getScriptCache();
  const key = "count-" + Utilities.formatDate(new Date(), "UTC", "yyyyMMddHH");
  const count = Number(cache.get(key) || 0);
  if (count >= CONFIG.MAX_PER_HOUR) return false;
  cache.put(key, String(count + 1), 3600);
  return true;
}

function isRepeated(lead) {
  const cache = CacheService.getScriptCache();
  const keys = ["mail-" + lead.correo, "wa-" + lead.whatsapp.replace(/\D/g, "")];
  if (keys.some((k) => cache.get(k))) return true;
  keys.forEach((k) => cache.put(k, "1", CONFIG.REPEAT_WINDOW_SECONDS));
  return false;
}

// ---------- Utilidades ----------

function summaryRow(label, value) {
  if (!value) return "";
  return `<p style="margin:0 0 8px;font-size:15px;line-height:1.5;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function clean(value, maxLength) {
  // Quita caracteres de control (deja saltos de línea y tabs para el texto libre).
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

// Para campos de una sola línea: sin saltos de línea (evita inyección en el asunto del correo).
function cleanLine(value, maxLength) {
  return clean(String(value || "").replace(/\s+/g, " "), maxLength);
}

// Evita que un texto que empieza por = + - @ (o tab/retorno) se ejecute como fórmula en Sheets.
function safeCell(value) {
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

// "300 123 4567" → "573001234567" para el enlace de WhatsApp.
function toWhatsAppNumber(raw) {
  const digits = String(raw).replace(/\D/g, "");
  return digits.length === 10 ? CONFIG.COUNTRY_CODE + digits : digits;
}

// Ejecuta esta función una vez desde el editor para autorizar los permisos
// y comprobar que la hoja y los correos funcionan.
function probarFormulario() {
  const fake = {
    postData: {
      contents: JSON.stringify({
        nombre: "Prueba nmdenlaweb",
        whatsapp: "300 123 4567",
        correo: CONFIG.NOTIFY_EMAIL,
        web: "No tengo página web",
        maps: "Sí, pero no estoy posicionado",
        local: "Local físico",
        negocio: "Esto es una prueba del formulario.",
        elapsed: 60000,
      }),
    },
  };
  console.log(doPost(fake).getContent());
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
