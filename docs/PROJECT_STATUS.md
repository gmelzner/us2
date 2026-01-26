# US2 - Estado del Proyecto

> **Última actualización**: 26 Enero 2026
> **Estado general**: Producción - Operativo

---

## Resumen Ejecutivo

US2 es una webapp para parejas que visualiza la distribución de carga mental en el hogar. La app está completamente funcional en español e inglés, con sistema de emails automatizados, gamificación y CRON job diario.

---

## Arquitectura

### Frontend
- **Stack**: HTML + Tailwind CSS + Vanilla JS
- **Hosting**: Vercel (auto-deploy desde GitHub)
- **Archivos principales**:
  - `index.html` - App principal (ES/EN)
  - `en/index.html` - Landing SEO en inglés
  - `api/cron.js` - Serverless function para CRON

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Anónimo con pair_id
- **Edge Functions**: Deno/TypeScript en Supabase
- **Emails**: Resend API
- **CRON**: Vercel Cron (12:00 UTC diario)

### Tablas Supabase
| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `pairs` | Datos de pareja, shared_context | ✅ |
| `users` | Info usuarios (nombre, email) | ✅ |
| `tests` | Resultados de tests | ✅ |
| `achievements` | Logros semanales | ✅ |
| `newsletter_subscribers` | Suscripciones email | ✅ |

Ver [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) para documentación detallada del esquema.

---

## Features Implementadas

### Core
- [x] Test de carga mental (9 categorías, 15 preguntas)
- [x] Visualización comparativa (radar chart)
- [x] Gap analysis con sugerencias personalizadas
- [x] Sistema de invitación por link (preserva idioma)
- [x] Soporte bilingüe ES/EN completo
- [x] Banner de usuario recurrente ("Ver mis resultados")
- [x] Compartir resultados con URL única

### Gamificación
- [x] Sistema de logros semanales
- [x] Badges desbloqueables (19 badges)
- [x] Niveles de equipo (5 niveles)
- [x] Celebraciones con confetti

### Emails Automatizados
- [x] Recordatorio de retest (14 días sin test)
- [x] Notificación cuando partner completa
- [x] Recordatorio de aniversario (7 días antes)
- [x] Recordatorio de cumpleaños (7 días antes)
- [x] Seguimiento programado por categoría (30 días)
- [x] Resumen mensual de logros (1° de cada mes)
- [x] Emails bilingües (ES/EN según preferencia)
- [x] Click tracking habilitado (Resend)

### SEO Internacional
- [x] Landing EN optimizada (`/en/`)
- [x] hreflang tags correctos (ES/EN/x-default)
- [x] Sitemap con alternates
- [x] OG images por idioma (og-image.png, og-image-en.png)
- [x] Schema.org JSON-LD (WebSite, Organization, WebApplication)
- [x] Flujo completo ES↔EN
- [x] Blog ES con 6 artículos SEO
- [x] Blog EN con 2 artículos (`/en/blog/`)

### Seguridad
- [x] RLS en todas las tablas
- [x] Rate limiting en emails (5/min, 20/día)
- [x] DEBUG flag para console.logs (desactivado en producción)
- [x] Sin vulnerabilidades XSS

---

## Configuración Actual

### Vercel CRON
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 12 * * *"  // 12:00 UTC = 9:00 AM Argentina
  }]
}
```

### Secrets en Supabase Edge Functions
| Secret | Descripción |
|--------|-------------|
| `RESEND_API_KEY` | API key de Resend para enviar emails |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key (público) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (privado) |
| `SUPABASE_DB_URL` | Connection string de la DB |

### Google
- Search Console verificado
- Analytics (G-6QS2DBQV30) en ambas páginas

---

## Archivos de Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/PROJECT_STATUS.md` | Este archivo - estado general |
| `docs/DATABASE_SCHEMA.md` | Esquema de tablas y campos |
| `docs/EMAIL_MARKETING_PLAN.md` | Plan de email marketing |
| `docs/INTERNATIONAL_SEO_PLAN.md` | Estrategia SEO internacional |
| `.env.example` | Template de variables de entorno |
| `CLAUDE.md` | Guía para Claude sobre formato de blog |

---

## Pendientes / Próximos Pasos

### Corto plazo
- [ ] Testear con 2-3 parejas reales
- [ ] Monitorear errores en producción
- [ ] Optimizar peso de OG images (~7MB → <500KB)

### Email Marketing (mejoras futuras)
- [ ] Email de bienvenida cuando ambos completan
- [ ] Email de racha (7 días consecutivos)
- [ ] Dashboard interno de métricas

### Features futuras (ideas)
- [ ] Sugerencias de logros basadas en gaps
- [ ] Push notifications (PWA)
- [ ] Sistema de reviews para aggregateRating

---

## Cómo Retomar

1. **Para cambios de código**: Editar archivos, push a GitHub → auto-deploy en Vercel

2. **Para probar CRON manualmente**:
   ```bash
   curl -X POST "https://us2.fun/api/cron"
   ```

3. **Para ver logs de emails**: Supabase Dashboard → Edge Functions → Logs

4. **Para activar debug logs**: En `index.html`, cambiar `const DEBUG = false;` a `true`

5. **Para SEO**: Revisar Search Console → Sitemaps y verificar indexación

---

## Contactos / Recursos

- **Repo**: https://github.com/gmelzner/us2
- **Producción**: https://us2.fun
- **Supabase**: Dashboard en supabase.com
- **Vercel**: Dashboard en vercel.com
- **Emails**: Resend dashboard

---

*Documento actualizado: 26 Enero 2026*
