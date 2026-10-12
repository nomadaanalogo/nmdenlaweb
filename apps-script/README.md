# Formulario → Google Sheets + correo automático

Cada vez que alguien llena el formulario de la web:

1. Se agrega una fila en la hoja **Solicitudes** de Google Sheets.
2. El cliente recibe un correo de respuesta automática.
3. `nmdenlaweb@gmail.com` recibe un aviso con los datos y botones para escribirle por WhatsApp o abrir la hoja.

## Instalación (una sola vez, ~5 minutos)

Hazlo con la cuenta **nmdenlaweb@gmail.com**, porque los correos salen desde la cuenta que instala el script.

1. Crea una hoja nueva en [sheets.new](https://sheets.new) y ponle de nombre, por ejemplo, *Solicitudes nmdenlaweb*.
2. En la hoja, ve a **Extensiones → Apps Script**.
3. Borra todo lo que aparece en `Código.gs` y pega el contenido de [`Code.gs`](./Code.gs).
4. En `CONFIG`, cambia `STUDIO_WHATSAPP` por tu número (ej: `573001234567`).
5. Guarda (💾).
6. **Autoriza los permisos:** arriba, elige la función `probarFormulario` y dale **Ejecutar**.
   - Google te pide permiso para usar la hoja y enviar correos. Dale **Revisar permisos → tu cuenta → Configuración avanzada → Ir a … (no seguro) → Permitir**. Sale como "no seguro" porque el script es tuyo y no está verificado por Google; es normal.
   - Revisa que se creó la pestaña **Solicitudes** con una fila de prueba y que te llegaron 2 correos. Puedes borrar esa fila.
7. **Publica:** **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo (nmdenlaweb@gmail.com)**.
   - Quién tiene acceso: **Cualquier persona**.
   - Dale **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
8. Pega esa URL en `FORM_ENDPOINT` dentro de [`src/config.ts`](../src/config.ts).

Para comprobar que quedó publicada, abre la URL `/exec` en el navegador. Debe decir *"nmdenlaweb · formulario activo ✔"*.

## Protección contra bots

El formulario tiene 4 filtros:

| Filtro | Qué hace |
|---|---|
| Campo trampa | Un campo invisible que solo llenan los bots. Se descarta en silencio. |
| Trampa de tiempo | Si alguien completa todo en menos de 4 segundos, se descarta en silencio. |
| Límite por hora | Máximo 30 solicitudes por hora en total (`MAX_PER_HOUR`). |
| Repetidos | El mismo correo o WhatsApp solo se acepta una vez cada 10 minutos. |


Nota: si ejecutas `probarFormulario` dos veces seguidas, la segunda no guarda fila por el filtro de repetidos (mismo correo en menos de 10 minutos).

## Si cambias el código después

Cada cambio en `Code.gs` necesita una nueva versión: **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar**. Así la URL `/exec` sigue siendo la misma.

## Límites

Una cuenta de Gmail gratuita puede enviar unos **100 correos al día** desde Apps Script. Cada solicitud usa 2 (respuesta al cliente y aviso para ti), o sea unas 50 solicitudes diarias. Si alguna vez se pasa del límite, la solicitud igual queda guardada en la hoja.

La columna **Estado** arranca en "Nuevo"; puedes cambiarla a mano (Contactado, Propuesta enviada, Cerrado…) para llevar el seguimiento.
