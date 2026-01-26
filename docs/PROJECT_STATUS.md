# US2 - Estado del Proyecto

> **Última actualización**: 26 Enero 2026
> **Estado general**: Listo para testing con parejas reales

---

## Resumen Ejecutivo

US2 es una webapp para parejas que visualiza la distribución de carga mental en el hogar. La app está completamente funcional en español e inglés, con sistema de emails automatizados y gamificación.

---

## Arquitectura

### Frontend
- **Stack**: HTML + Tailwind CSS + Vanilla JS
- **Hosting**: Vercel (auto-deploy desde GitHub)
- **Archivos principales**:
  - `index.html` - App principal (ES/EN)
  - `en/index.html` - Landing SEO en inglés

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Anónimo con pair_id
- **Edge Functions**: Deno/TypeScript en Supabase
- **Emails**: Resend API

### Tablas Supabase
| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `pairs` | Datos de pareja, shared_context | ✅ |
| `users` | Info usuarios (nombre, email) | ✅ |
| `tests` | Resultados de tests | ✅ |
| `achievements` | Logros semanales | ✅ |
| `newsletter_subscribers` | Suscripciones email | ✅ |

---

## Features Implementadas

### Core
- [x] Test de carga mental (9 categorías, 15 preguntas)
- [x] Visualización comparativa (radar chart)
- [x] Gap analysis con sugerencias personalizadas
- [x] Sistema de invitación por link (preserva idioma)
- [x] Soporte bilingüe ES/EN completo

### Gamificación
- [x] Sistema de logros semanales
- [x] Badges desbloqueables
- [x] Niveles de equipo
- [x] Celebraciones con confetti

### Emails Automatizados
- [x] Recordatorio de retest (7 días sin test)
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
- [x] Sin credenciales expuestas
- [x] Sin vulnerabilidades XSS

---

## Pendientes / Próximos Pasos

### Corto plazo
- [x] ~~Confirmar indexación de sitemap en Search Console~~ (2 páginas indexadas)
- [ ] Testear con 2-3 parejas reales
- [ ] Monitorear errores en producción
- [ ] Optimizar peso de OG images (~7MB → <500KB)

### SEO (Fase 2) - Blog EN ✅ COMPLETADO
- [x] Crear `/en/blog/` index
- [x] Escribir blog EN: "Mental Load" (`/en/blog/mental-load.html`)
- [x] Escribir blog EN: "50/50 Myth" (`/en/blog/50-50-myth.html`)
- [ ] Backlink outreach a blogs de relaciones (futuro)

### Email Marketing (mejoras futuras)
- [ ] Email de bienvenida cuando ambos completan
- [ ] Email de racha (7 días consecutivos)
- [ ] Email de inactividad (14 días)
- [ ] Dashboard interno de métricas

### Features futuras (ideas)
- [ ] Sugerencias de logros basadas en gaps
- [ ] Modal de novedades al partner
- [ ] Push notifications (PWA)
- [ ] Sistema de reviews para aggregateRating

---

## Configuración Requerida

### Variables de entorno (en Supabase)
```
RESEND_API_KEY=re_xxx...
```

### Cron Jobs (pg_cron en Supabase)
```sql
-- Ejecuta diariamente a las 9:00 UTC (6:00 Argentina)
-- Job name: daily-email-check
-- Schedule: 0 9 * * *
```

### Google
- Search Console verificado
- Analytics (G-6QS2DBQV30) en ambas páginas

---

## Cómo Retomar

1. **Para cambios de código**: Editar archivos, push a GitHub → auto-deploy en Vercel

2. **Para ver emails programados**:
   ```sql
   SELECT * FROM pairs
   WHERE shared_context->>'scheduled_emails' IS NOT NULL;
   ```

3. **Para debuggear emails**: Ver logs en Supabase Dashboard → Edge Functions → Logs

4. **Para SEO**: Revisar Search Console → Sitemaps y verificar indexación

---

## Contactos / Recursos

- **Repo**: https://github.com/gmelzner/us2
- **Producción**: https://us2.fun
- **Supabase**: Dashboard en supabase.com
- **Vercel**: Dashboard en vercel.com
- **Emails**: Resend dashboard

---

*Documento actualizado: 26 Enero 2026*
