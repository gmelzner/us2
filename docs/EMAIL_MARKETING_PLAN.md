# US2 - Sistema de Email Marketing

> Documentación del sistema de emails automatizados.
> **Estado**: IMPLEMENTADO Y OPERATIVO
> **Última actualización**: Enero 2026

---

## 1. Infraestructura Implementada

### Servicios Configurados

| Servicio | Propósito | Estado |
|----------|-----------|--------|
| **Zoho Mail** | Recibir emails en hola@us2.fun | Operativo |
| **Resend** | Enviar emails transaccionales | Operativo |
| **Supabase Edge Function** | Procesar y enviar emails | Desplegada |
| **pg_cron** | Ejecutar checks diarios | Configurado (9:00 UTC) |

### Credenciales y Endpoints

- **Edge Function URL**: `https://lcmooxztnwdvhmnhfwyu.supabase.co/functions/v1/send-scheduled-emails`
- **Remitente**: `US2 <hola@us2.fun>`
- **Cron Schedule**: Todos los días a las 9:00 UTC (6:00 Argentina)

---

## 2. Datos en Supabase

### Tabla `newsletter_subscribers`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único |
| `email` | text | Email del usuario |
| `source` | text | Origen (pdf_capture, waiting_notification, modal) |
| `pair_id` | text | ID de la pareja (si aplica) |
| `created_at` | timestamp | Fecha de suscripción |

### Tabla `pairs` - `shared_context` (JSONB)

Campos relevantes para emails:

```javascript
{
  // Email de User A para notificaciones
  userA_email: "email@example.com",
  userA_returnLink: "https://us2.fun?pairID=xxx&user=A",

  // Historial de tests (para retest reminders)
  testHistory: [
    {
      userA: { score: 32, timestamp: "ISO date" },
      userB: { score: 28, timestamp: "ISO date" },
      savedAt: "ISO date"
    }
  ],

  // Seguimientos programados (para followup reminders)
  scheduledReevals: {
    "cat_limpieza": {
      scheduledAt: "ISO date",
      category: "cat_limpieza",
      reminderSent: false
    }
  },

  // Aniversario (para anniversary reminders)
  anniversary: {
    month: 6,
    day: 14
  },

  // Tracking de emails enviados
  lastRetestReminderSent: "ISO date",
  lastAnniversaryReminderYear: 2026
}
```

---

## 3. Emails Implementados

### 3.1 Emails Automáticos (Cron Diario)

| Trigger | Template | Cuándo se envía |
|---------|----------|-----------------|
| **Retest Reminder** | `retest_reminder` | 7 días después del último test |
| **Scheduled Followup** | `scheduled_followup` | Cuando llega la fecha programada |
| **Anniversary** | `anniversary` | 7 días antes del aniversario |

### 3.2 Emails Inmediatos (Event-driven)

| Trigger | Template | Cuándo se envía |
|---------|----------|-----------------|
| **Partner Completed** | `partner_completed` | Cuando User B completa y User A dejó email |

---

## 4. Cómo Funciona

### Flujo de Captura de Email

1. **User A completa test** → Ve pantalla de espera
2. **User A ingresa email** → Se guarda en:
   - `newsletter_subscribers` (con source: `waiting_notification`)
   - `pairs.shared_context.userA_email`
3. **User B completa test** → Se dispara:
   - Email automático a User A (si dejó email)
   - Modal sugiriendo notificar por WhatsApp

### Flujo del Cron Job (Diario 9:00 UTC)

```
pg_cron → HTTP POST → Edge Function
                          ↓
              ┌───────────┴───────────┐
              ↓           ↓           ↓
        checkRetest  checkFollowup  checkAnniversary
              ↓           ↓           ↓
         Resend API  Resend API  Resend API
```

---

## 5. Templates de Email

### retest_reminder
- **Subject**: 📊 ¿Cómo va el equilibrio? Es hora de re-evaluar
- **Contenido**: Invitación a hacer el test de seguimiento después de 7 días

### scheduled_followup
- **Subject**: 🔔 Recordatorio: Seguimiento programado de {category}
- **Contenido**: Recordatorio de la re-evaluación que programaron

### anniversary
- **Subject**: 💕 ¡Su aniversario se acerca! Un regalo especial
- **Contenido**: Felicitación y sugerencia de revisar progreso juntos

### partner_completed
- **Subject**: 🎉 ¡Tu pareja completó el test! Vean los resultados juntos
- **Contenido**: Notificación con link directo a resultados

---

## 6. Comandos Útiles

### Enviar email de prueba
```bash
curl -X POST 'https://lcmooxztnwdvhmnhfwyu.supabase.co/functions/v1/send-scheduled-emails' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "manual",
    "email": "destino@email.com",
    "data": {
      "template": "retest_reminder",
      "returnLink": "https://us2.fun"
    }
  }'
```

### Ejecutar cron manualmente
```bash
curl -X POST 'https://lcmooxztnwdvhmnhfwyu.supabase.co/functions/v1/send-scheduled-emails' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"type": "cron"}'
```

### Ver cron jobs configurados
```sql
SELECT * FROM cron.job;
```

### Ver historial de ejecuciones
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 7. Métricas a Trackear (Futuro)

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| Open rate | % que abre emails | > 25% |
| Click rate | % que hace clic | > 5% |
| Reactivación | Dormidos que vuelven | > 10% |
| Retest rate | % que hace segundo test | > 30% |

---

## 8. Pendientes para Futuras Mejoras

- [ ] Agregar tracking de opens/clicks (Resend lo soporta)
- [ ] Email de bienvenida cuando ambos completan primer test
- [ ] Email de racha (streak de 7 días)
- [ ] Email de inactividad (14 días sin actividad)
- [ ] Dashboard de métricas de email
- [ ] Unsubscribe automático

---

## 9. Archivos Relacionados

- **Edge Function**: `/supabase/functions/send-scheduled-emails/index.ts`
- **Frontend (captura email)**: `/index.html` → `saveWaitingEmail()`
- **Frontend (notificación)**: `/index.html` → `sendPartnerCompletedEmail()`

---

*Documento actualizado: Enero 2026*
*Sistema implementado y operativo*
