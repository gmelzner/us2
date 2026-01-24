# US2 - Plan de Email Marketing

> Documento de planificación para campañas de email futuras.
> **Estado**: En planificación (no implementado)
> **Última actualización**: Enero 2026

---

## 1. Datos Disponibles en Supabase

### Tabla `newsletter_subscribers`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | string | Email del usuario |
| `source` | string | Origen del registro (pdf_capture, modal, etc.) |
| `created_at` | timestamp | Fecha de suscripción |

### Tabla `pairs`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pair_id` | string | ID único de la pareja |
| `anniversary_date` | string | Fecha de aniversario (MM-DD) |
| `shared_context` | JSONB | Objeto con todos los datos compartidos |
| `created_at` | timestamp | Fecha de creación de la pareja |

### Contenido de `shared_context` (JSONB)

```javascript
{
  // Logros registrados por la pareja
  achievements: [
    {
      id: "uuid",
      text: "Cociné la cena",
      user: "A" | "B",
      category: "hogar",
      status: "pending" | "approved" | "rejected",
      timestamp: "ISO date"
    }
  ],

  // Objetivo actual de pareja
  goals: {
    current: {
      text: "Cocinar juntos 3 veces esta semana",
      proposedBy: "A",
      approvedBy: "B",
      startedAt: "ISO date",
      progress: 0-100
    },
    pending: { ... },
    completed: [{ text, completedAt }]
  },

  // Insignias desbloqueadas (por usuario)
  badges: {
    userA: ["first_test", "streak_7", "balance_master"],
    userB: ["first_test", "communicator"]
  },

  // Historial de tests
  testHistory: [
    {
      userA: { score: 32, timestamp: "ISO date" },
      userB: { score: 28, timestamp: "ISO date" },
      savedAt: "ISO date"
    }
  ],

  // Racha de actividad
  streak: {
    currentStreak: 5,
    lastActiveDate: "YYYY-MM-DD",
    longestStreak: 12
  },

  // Seguimientos agendados por categoría
  scheduledReevals: {
    "cat_limpieza": {
      scheduledAt: "ISO date",
      category: "cat_limpieza",
      scheduledBy: "A"
    }
  },

  // Aniversario
  anniversary: {
    month: 6,
    day: 14
  }
}
```

### Tabla `tests`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pair_id` | string | ID de la pareja |
| `user_role` | "A" \| "B" | Usuario que hizo el test |
| `score` | int | Puntaje total (0-45) |
| `category_scores` | JSONB | Puntajes por categoría |
| `answers` | JSONB | Respuestas individuales |
| `created_at` | timestamp | Fecha del test |

---

## 2. Campañas de Email Propuestas

### 2.1 Emails Transaccionales (Automáticos)

| Trigger | Email | Timing | Datos necesarios |
|---------|-------|--------|------------------|
| Pareja completa primer test | "Bienvenidos a US2" | Inmediato | pair_id, nombres |
| Usuario agenda seguimiento | "Recordatorio de seguimiento" | 14 días después | scheduledReevals |
| Aniversario cercano | "¡Su aniversario se acerca!" | 7 días antes | anniversary_date |
| Racha de 7 días | "¡Felicitaciones por su racha!" | Cuando streak = 7 | streak |
| Sin actividad 14 días | "Los extrañamos" | 14 días inactivo | lastActiveDate |
| Nuevo badge desbloqueado | "¡Nuevo logro!" | Inmediato | badges |

### 2.2 Emails de Nurturing (Secuencia)

**Secuencia post-registro:**
1. **Día 0**: Bienvenida + cómo interpretar resultados
2. **Día 3**: Tips para mejorar la categoría con mayor gap
3. **Día 7**: Invitación a registrar primer logro
4. **Día 14**: Recordatorio de re-evaluar (si agendaron seguimiento)
5. **Día 30**: Resumen mensual de progreso

### 2.3 Emails Estacionales

| Fecha | Campaña | Contenido |
|-------|---------|-----------|
| 14 Feb | San Valentín | "Celebren con una conversación sobre su equipo" |
| Día Madre/Padre | Reconocimiento | "El trabajo invisible que hacen" |
| Fin de año | Retrospectiva | "Su año como equipo en números" |
| Aniversario pareja | Personalizado | "X años juntos - miren cuánto crecieron" |

---

## 3. Segmentación de Audiencia

### Por engagement
- **Activos**: Actividad en últimos 7 días
- **Dormidos**: Sin actividad 14-30 días
- **En riesgo**: Sin actividad 30+ días

### Por resultados del test
- **Equilibrados**: Gap promedio < 0.5
- **En proceso**: Gap promedio 0.5-1.0
- **Necesitan ayuda**: Gap promedio > 1.0

### Por categoría problemática
- Parejas con gap alto en "Limpieza"
- Parejas con gap alto en "Carga emocional"
- etc.

---

## 4. Métricas a Trackear

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| Open rate | % que abre emails | > 25% |
| Click rate | % que hace clic | > 5% |
| Reactivación | Dormidos que vuelven | > 10% |
| Retest rate | % que hace segundo test | > 30% |

---

## 5. Herramientas Sugeridas

| Necesidad | Opciones | Notas |
|-----------|----------|-------|
| Envío de emails | Resend, Postmark, SendGrid | Resend tiene free tier generoso |
| Templates | React Email, MJML | React Email integra bien con Vercel |
| Scheduling | Supabase Edge Functions, Vercel Cron | Ya tenemos Supabase |
| Analytics | Propio en Supabase | Guardar opens/clicks |

---

## 6. Queries SQL Útiles (para cuando implementemos)

```sql
-- Parejas que agendaron seguimiento hace 14+ días
SELECT p.pair_id, p.shared_context->'scheduledReevals' as reevals
FROM pairs p
WHERE p.shared_context->'scheduledReevals' IS NOT NULL
AND EXISTS (
  SELECT 1 FROM jsonb_each(p.shared_context->'scheduledReevals') as r
  WHERE (r.value->>'scheduledAt')::timestamp < NOW() - INTERVAL '14 days'
);

-- Parejas con aniversario en los próximos 7 días
SELECT pair_id, anniversary_date
FROM pairs
WHERE anniversary_date IS NOT NULL
AND (
  TO_DATE(anniversary_date || '-' || EXTRACT(YEAR FROM NOW()), 'MM-DD-YYYY')
  BETWEEN NOW() AND NOW() + INTERVAL '7 days'
);

-- Parejas sin actividad en 14 días
SELECT p.pair_id
FROM pairs p
WHERE (p.shared_context->>'lastGoalsSync')::timestamp < NOW() - INTERVAL '14 days'
OR p.shared_context->>'lastGoalsSync' IS NULL;

-- Top categorías con mayor gap (para contenido)
SELECT
  t.category_scores,
  COUNT(*) as frequency
FROM tests t
GROUP BY t.category_scores
ORDER BY frequency DESC;
```

---

## 7. Próximos Pasos (cuando implementemos)

1. [ ] Elegir proveedor de email (Resend recomendado)
2. [ ] Crear templates base con React Email
3. [ ] Configurar Supabase Edge Function para triggers
4. [ ] Implementar tracking de opens/clicks
5. [ ] Crear dashboard de métricas
6. [ ] A/B testing de subject lines

---

## 8. Consideraciones Legales

- [ ] Agregar checkbox de consentimiento explícito
- [ ] Link de unsubscribe en todos los emails
- [ ] Política de privacidad actualizada
- [ ] Cumplimiento GDPR (si hay usuarios EU)

---

*Documento creado: Enero 2026*
*Para implementar: Cuando tengamos volumen de usuarios suficiente*
