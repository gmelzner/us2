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
- **Backend**: Supabase (PostgreSQL)
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
├── supabase/functions/ # Edge Functions (emails)
├── docs/               # Documentacion interna
├── manifest.json       # PWA
├── sw.js               # Service Worker
├── sitemap.xml         # SEO + hreflang
└── og-image*.png       # Social sharing images
```

---

## Desarrollo

```bash
# Clonar
git clone https://github.com/gmelzner/us2.git
cd us2

# No hay build step - abrir index.html en el navegador
# O usar un server local:
npx serve .

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
- [x] Emails automatizados (Resend + Supabase Edge Functions)
- [x] SEO internacional (hreflang, Schema.org, OG images)

---

## Contacto

- Email: hola@us2.fun
- GitHub: [@gmelzner](https://github.com/gmelzner)

---

## Licencia

Todos los derechos reservados © 2026 US2
