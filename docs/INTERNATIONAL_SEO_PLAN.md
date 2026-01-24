# US2 - Plan de SEO Internacional (EN)

> Estrategia para posicionar US2 en mercados de habla inglesa.
> **Estado**: FASE 1 COMPLETADA ✅
> **Aprobado**: Enero 2026
> **Última actualización**: 24 Enero 2026

---

## 1. Visión General

### Objetivo
Capturar tráfico orgánico de EEUU, UK, Canadá y Australia mediante contenido en inglés optimizado para SEO.

### Por qué tiene sentido
- El tema "mental load" es trending en parejas anglosajonas
- Poca competencia de herramientas interactivas de calidad
- La app ya tiene traducciones en inglés
- Dominio .fun es neutral internacionalmente

### Principios
1. **Calidad sobre cantidad** - Mejor 2 páginas excelentes que 10 mediocres
2. **Contenido nativo** - No auto-traducir, escribir para audiencia EN
3. **Implementación técnica correcta** - hreflang desde el día 1
4. **Monitorear y ajustar** - Usar Search Console para decisiones

---

## 2. Estructura de URLs

```
us2.fun/                    → Landing ES (default)
us2.fun/en/                 → Landing EN ✅
us2.fun/blog/               → Blog ES
us2.fun/en/blog/            → Blog EN (futuro)
us2.fun/en/blog/[slug].html → Posts EN
```

### Convenciones
- Subdirectorio `/en/` (no subdominio)
- Mismo slug style pero en inglés
- Canonical apunta a sí mismo
- hreflang conecta versiones ES ↔ EN

---

## 3. Roadmap de Implementación

### Fase 1: Foundation ✅ COMPLETADA (24 Enero 2026)
- [x] Documentar plan
- [x] Crear `/en/index.html` (landing en inglés)
- [x] Agregar hreflang tags a ambas landings
- [x] Actualizar sitemap.xml con hreflang
- [x] Deploy y verificar en Search Console (pendiente indexación)
- [x] Flujo completo ES↔EN funcionando (parámetro `?lang=`)
- [x] Link de invitación conserva idioma
- [x] Social sharing usa OG tags correctos por idioma

### Fase 2: Primer Contenido (Semanas 2-3) - PENDIENTE
- [ ] Escribir 1er blog post pilar EN:
  - "The Mental Load Test: See How You Really Split Household Work"
  - ~1500 palabras, bien investigado
  - Incluir estadísticas de estudios (Pew Research, etc.)
- [ ] Crear `/en/blog/index.html`
- [ ] Actualizar sitemap

### Fase 3: Expansión (Semanas 4-6) - PENDIENTE
- [ ] 2do blog post EN:
  - "5 Signs of Unequal Mental Load in Your Relationship"
- [ ] 3er blog post EN:
  - "How to Talk to Your Partner About Mental Load (Without Fighting)"
- [ ] Evaluar métricas y decidir siguiente paso

### Fase 4: Optimización (Mes 2+) - PENDIENTE
- [ ] Analizar qué keywords están traccionando
- [ ] Crear contenido adicional basado en datos
- [ ] Considerar backlink outreach (blogs de relaciones, etc.)
- [ ] A/B test de títulos y meta descriptions

---

## 4. Especificaciones Técnicas

### hreflang Implementation ✅

En `index.html` (ES):
```html
<link rel="alternate" hreflang="es" href="https://us2.fun/">
<link rel="alternate" hreflang="en" href="https://us2.fun/en/">
<link rel="alternate" hreflang="x-default" href="https://us2.fun/">
```

En `/en/index.html` (EN):
```html
<link rel="alternate" hreflang="es" href="https://us2.fun/">
<link rel="alternate" hreflang="en" href="https://us2.fun/en/">
<link rel="alternate" hreflang="x-default" href="https://us2.fun/">
```

### Sitemap ✅

```xml
<!-- Homepage ES -->
<url>
    <loc>https://us2.fun/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://us2.fun/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://us2.fun/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://us2.fun/"/>
</url>

<!-- Homepage EN -->
<url>
    <loc>https://us2.fun/en/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://us2.fun/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://us2.fun/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://us2.fun/"/>
</url>
```

### Meta Tags EN ✅

```html
<meta name="description" content="Free mental load test for couples. See how you really divide household responsibilities and have better conversations about balance.">
<meta property="og:title" content="US2 - Mental Load Test for Couples">
<meta property="og:description" content="Visualize how you split the invisible work at home. Free, anonymous, takes 3 minutes.">
```

---

## 5. Contenido Planeado

### Landing EN ✅ - Key Messages
- **Hero**: "See how you really split the mental load"
- **Value prop**: Free, anonymous, 3 minutes
- **Social proof**: "Join X couples who've improved their balance"
- **CTA**: "Start the Test"

### Blog Posts EN (Ideas priorizadas) - PENDIENTE

| Prioridad | Título | Keywords Target |
|-----------|--------|-----------------|
| 1 | The Mental Load Test: See How You Really Split Household Work | mental load test, household labor quiz |
| 2 | 5 Signs of Unequal Mental Load in Your Relationship | signs of mental load, unfair housework |
| 3 | How to Talk to Your Partner About Mental Load | mental load conversation, discuss chores |
| 4 | Mental Load vs Physical Labor: Why Both Matter | mental load explained |
| 5 | The 50/50 Myth: Why Equal Isn't Always Fair | equal housework myth |

---

## 6. Métricas de Éxito

### KPIs a 30 días
- Landing EN indexada en Google
- Al menos 1 keyword EN en top 100
- 50+ sesiones orgánicas EN

### KPIs a 90 días
- 500+ sesiones orgánicas EN/mes
- 3+ keywords EN en top 50
- 10%+ de tests completados desde EN

### Herramientas
- Google Search Console (verificar ambas versiones)
- Google Analytics (filtrar por idioma/país)
- Ahrefs/SEMrush (opcional, para keyword research)

---

## 7. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Contenido de baja calidad | Escribir nativo, no traducir |
| Duplicate content penalty | hreflang + canonicals correctos ✅ |
| Canibalización de keywords | Diferentes keywords por idioma |
| Dilución de esfuerzo | Empezar pequeño, escalar con datos |

---

## 8. Checklist Pre-Launch ✅ COMPLETADO

- [x] hreflang en ambas páginas
- [x] Canonicals correctos
- [x] Meta tags únicos (no copiados)
- [x] OG tags para social sharing
- [x] Sitemap actualizado
- [x] robots.txt permite /en/
- [x] Verificar en Google Search Console (reenviado 24/01)
- [x] Test de mobile-friendly
- [ ] Test de velocidad (PageSpeed) - opcional

---

*Documento creado: Enero 2026*
*Fase 1 completada: 24 Enero 2026*
*Próxima revisión: Febrero 2026*
