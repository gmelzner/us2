# US2 - Estado del Proyecto

> **Última actualización**: 24 Enero 2026
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
- [x] Test de carga mental (11 categorías)
- [x] Visualización comparativa (gráficos)
- [x] Gap analysis con sugerencias
- [x] Sistema de invitación por link
- [x] Soporte bilingüe ES/EN

### Gamificación
- [x] Sistema de logros semanales
- [x] Badges desbloqueables
- [x] Niveles de equipo
- [x] Celebraciones con confetti

### Emails Automatizados
- [x] Recordatorio de retest (14 días)
- [x] Notificación cuando partner completa
- [x] Recordatorio de aniversario
- [x] Recordatorio de cumpleaños
- [x] Emails bilingües (ES/EN según preferencia)

### SEO Internacional
- [x] Landing EN optimizada (`/en/`)
- [x] hreflang tags correctos
- [x] Sitemap con alternates
- [x] OG tags por idioma
- [x] Flujo completo ES↔EN

### Seguridad
- [x] RLS en todas las tablas
- [x] Rate limiting en emails (5/min, 20/día)
- [x] Sin credenciales expuestas
- [x] Sin vulnerabilidades XSS

---

## Pendientes / Próximos Pasos

### Corto plazo
- [ ] Confirmar indexación de sitemap en Search Console
- [ ] Testear con 2-3 parejas reales
- [ ] Monitorear errores en producción

### SEO (Fase 2)
- [ ] Escribir primer blog post EN
- [ ] Crear `/en/blog/` index
- [ ] Backlink outreach

### Features futuras (ideas)
- [ ] Sugerencias de logros basadas en gaps
- [ ] Modal de novedades al partner
- [ ] Celebración cuando ambos aprueban logro
- [ ] Push notifications (PWA)

---

## Configuración Requerida

### Variables de entorno (en Supabase)
```
RESEND_API_KEY=re_xxx...
```

### Cron Jobs (pg_cron en Supabase)
```sql
-- Ejecuta cada hora para enviar emails programados
SELECT cron.schedule('send-emails', '0 * * * *', ...);
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

*Documento actualizado: 24 Enero 2026*
