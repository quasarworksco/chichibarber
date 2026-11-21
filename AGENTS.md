# AGENTS.md — Chichi Barber · Sistema de citas

## Este proyecto
- Sistema de reservas de citas para barbería.
- Backend: Google Apps Script + Google Sheets (panel en `admin.html`).
- Usa `LockService` para evitar reservas dobles; no quitarlo.
- Banner en tiempo real de "atendiendo ahora".
- Frontend de lujo oscuro/dorado.

## Sobre mí
- Soy Andres, de **DGP Group USA**, agencia de marketing digital bilingüe (español/inglés) con sede en Florida. Clientes de EE. UU. y Europa.
- Respóndeme siempre en **español** salvo que pida otra cosa.

## Stack (por defecto)
- HTML/CSS/JS **vanilla**, normalmente en **un solo archivo HTML**.
- Backend: **Google Apps Script (GAS)**. Base de datos: **Google Sheets**. Archivos: **Google Drive**.
- Contacto con clientes finales: **WhatsApp** (wa.me, notificaciones vía CallMeBot).
- Hosting: **GitHub Pages**. También uso **Supabase**.

## Lecciones ya resueltas (no repetir errores)
- Imágenes de Drive: usar `https://lh3.googleusercontent.com/d/[ID]` con `crossorigin="anonymous"`.
- Reservas concurrentes en GAS: usar `LockService`.
- No usar auto-refresh de CSV cacheado (`fetchCSV`); leer/escribir con POST al Web App de GAS.

## Diseño
- Estilo **audaz y premium**: temas oscuros de lujo (negro/dorado, negro/amarillo).
- Títulos en **Bebas Neue**. Elementos visuales grandes y con impacto. Mobile-first siempre.

## Cómo trabajar
- Entrega archivos completos y funcionales cuando el cambio sea grande.
- Respeta el stack salvo que pida otra cosa.
- Avísame antes de borrar o sobrescribir datos en Sheets o Supabase.
