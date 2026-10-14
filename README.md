# US2 - Somos un equipo

> Visualiza y equilibra la distribucion de tareas en pareja

**Live**: https://us2.fun

---

## Que es US2?

US2 es una herramienta gratuita para parejas que ayuda a visualizar la "carga mental" - esa gestion invisible de recordar, planificar y organizar las tareas del hogar que muchas veces recae de forma desigual.

### Como funciona

1. **Hace el test**: 15 preguntas sobre quien gestiona que en casa
2. **Invita a tu pareja**: Un link unico para que complete su version
3. **Ven los resultados juntos**: Grafico radar comparativo + tips personalizados

---

## Stack

- **Frontend**: HTML5 + Tailwind CSS (CDN) + Vanilla JS
- **Backend**: Postgres propio en el VPS (contenedor `portfolio-postgres`, base `us2`) + una función de Vercel (`api/db.js`)
- **Charts**: Chart.js
- **Hosting**: Vercel
- **Analytics**: Google Analytics 4

---

## Estructura

```
US2/
├── index.html          # App principal ES
├── en/index.html       # Landing EN
├── about.html          # Sobre nosotros
├── privacy.html        # Politica de privacidad
├── contact.html        # Contacto + FAQ
├── blog/               # Articulos SEO (6 posts)
│   ├── index.html
│   ├── carga-mental.html
│   ├── 5-conversaciones-clave.html
│   ├── mito-50-50.html
│   ├── como-usar-us2.html
│   ├── hola-guapa-micromachismos.html
│   └── no-me-di-cuenta.html
├── api/db.js           # Única puerta a la base: operaciones permitidas, siempre por pareja
├── api/health.js       # ¿Llega a la base? (lo usa el chequeo diario del VPS)
├── lib/db.js           # Conexión a Postgres (TLS con la CA propia)
├── db/migrations/      # Estructura de la base (npm run db:migrate)
├── tests/              # npm test: reglas de api/db.js
├── supabase/functions/ # Mails de la versión anterior (referencia para la etapa 2)
├── docs/               # Documentacion interna
├── manifest.json       # PWA
├── sw.js               # Service Worker
├── sitemap.xml         # SEO + hreflang
└── og-image*.png       # Social sharing images
```

---

## Base de datos

Hasta 2026 la página le hablaba directo a Supabase desde el navegador. Ese proyecto se borró (sin datos para recuperar) y en octubre de 2026 US2 pasó a un Postgres propio:

- La página manda cada operación a `/api/db` con la misma forma que usaba con Supabase (`supabaseClient.from(...).select().eq()...`), así que el resto del código no cambió.
- `api/db.js` acepta solo las tablas, columnas y acciones que usa la app, y toda lectura o cambio tiene que nombrar su pareja (`pair_id`). Nadie puede listar una tabla entera.
- Variables en Vercel: `DATABASE_URL` y `DATABASE_CA_CERTIFICATE_BASE64` (no poner `sslmode` en la URL).
- Backup diario 04:40 y respaldo externo 05:00 junto con Mis Estrellas y Padel; chequeo diario 09:05 de `/api/health`.

## Desarrollo

```bash
# Clonar
git clone https://github.com/gmelzner/us2.git
cd us2

# No hay build step. La página es estática; la base se usa a través de /api,
# así que para probar con datos hace falta correr las funciones (vercel dev).
npm install
cp .env.example .env.local   # completar con los valores reales
npm run db:migrate           # aplica db/migrations/ (no hace nada si ya están)
npm test

# Deploy (automatico via Vercel)
git push origin main
```

---

## Features

- [x] Test de carga mental (15 preguntas, 9 categorias)
- [x] Sincronizacion de pareja en tiempo real
- [x] Dashboard con radar chart
- [x] Sistema de badges (19 badges)
- [x] Badges estacionales (Valentine, Christmas, etc)
- [x] PWA (funciona offline)
- [x] i18n completo (ES/EN)
- [x] Blog con 6 articulos SEO
- [ ] Emails automatizados: pausados desde 2026-10 (se borró Supabase, que los mandaba). Etapa 2: rehacerlos con Resend desde una función de Vercel
- [x] SEO internacional (hreflang, Schema.org, OG images)

---

## Contacto

- Email: hola@us2.fun
- GitHub: [@gmelzner](https://github.com/gmelzner)

---

## Licencia

Todos los derechos reservados © 2026 US2
