# 🤖 Sistema Avanzado de IA Legal

## 📚 Arquitectura del Conocimiento

### Estructura de Base de Datos

El sistema utiliza una arquitectura jerárquica para organizar el conocimiento legal:

```
Áreas de Derecho
  └── Subáreas de Derecho
      ├── Normas (Principales y Complementarias)
      └── Conceptos Jurídicos
```

### Ventana de Contexto

Sistema de conversaciones con **ventana deslizante de 20 mensajes**:
- Mantiene contexto relevante sin saturar la IA
- Elimina automáticamente mensajes antiguos
- Optimiza performance y costos de API

## 🔧 Configuración Multi-Modelo

### Modelos Soportados

1. **Gemini 2.0 Flash** (Recomendado)
   - Modelo más reciente de Google
   - Mejor balance precio/performance
   - Especializado en español

2. **OpenAI GPT-4** (Próximamente)
   - Alta calidad de respuestas
   - Excelente comprensión contextual

3. **Anthropic Claude** (Próximamente)
   - Respuestas detalladas
   - Fuerte en razonamiento legal

### Cambiar Modelo Activo

Desde el panel admin (`/admin/ia`):
1. Navegar a "Configuración IA"
2. Seleccionar modelo deseado
3. Configurar parámetros (temperatura, tokens)
4. Guardar cambios

Los cambios aplican **inmediatamente** para todos los usuarios.

## 📖 Gestión del Conocimiento

### Agregar Áreas de Derecho

```typescript
// Desde panel admin o API
await createArea({
  nombre: "Derecho Tributario",
  descripcion: "Regula los impuestos y obligaciones fiscales"
});
```

### Agregar Normas

```typescript
await createNorma({
  tipo: "Principal",
  nombre: "Estatuto Tributario",
  anio: 1989,
  descripcion: "Decreto 624 de 1989, regula el sistema tributario colombiano"
});
```

### Asignar Normas a Subáreas

```typescript
await assignNormaToSubarea(subareaId, normaId);
```

### Agregar Conceptos Jurídicos

```typescript
await createConcepto({
  subareaId: "uuid",
  concepto: "Renta Líquida Gravable",
  definicion: "Base sobre la cual se calcula el impuesto de renta",
  fuente: "Estatuto Tributario, Artículo 26"
});
```

## 🔍 Búsqueda Inteligente de Contexto

El sistema busca automáticamente contexto relevante:

```typescript
const context = await getContextForQuery("¿Cómo se calculan las cesantías?");
```

Resultado:
- Áreas relevantes
- Normas aplicables
- Conceptos jurídicos relacionados
- Todo formateado para la IA

## 💬 Flujo de Conversación

```
Usuario: "¿Cómo demando a mi empleador?"
  ↓
Sistema busca contexto legal (Laboral)
  ↓
Recupera últimos 20 mensajes de conversación
  ↓
Envía a IA con contexto + historial
  ↓
IA genera respuesta especializada
  ↓
Guarda respuesta en conversación
  ↓
Usuario recibe respuesta contextualizada
```

## 🎯 Mejores Prácticas

### Para Administradores

1. **Organizar jerárquicamente**: Área → Subárea → Normas/Conceptos
2. **Actualizar regularmente**: Agregar nuevas leyes y jurisprudencia
3. **Revisar calidad**: Monitorear respuestas de la IA
4. **Optimizar temperatura**: Ajustar según tipo de consultas

### Para Desarrollo

1. **No almacenar jurisprudencia**: La IA ya está entrenada
2. **Cache inteligente**: Respuestas frecuentes
3. **Límite de ventana**: No exceder 20 mensajes
4. **Logging completo**: Para debugging y mejora continua

## 📊 Métricas del Sistema

- **Hit rate de cache**: % de respuestas desde cache
- **Tiempo de respuesta**: Promedio por consulta
- **Áreas más consultadas**: Top 10
- **Satisfacción**: Rating de usuarios

## 🔄 Mantenimiento

### Limpieza de Conversaciones

Las conversaciones mantienen automáticamente solo los últimos 20 mensajes.

### Actualización de Conocimiento

1. Agregar nuevas normas cuando se promulguen
2. Actualizar conceptos si cambian definiciones
3. Revisar y mejorar descripciones de áreas

### Monitoreo de IA

```bash
# Ver logs de la IA
grep "Gemini\|🤖" logs/

# Métricas de uso
SELECT modelo_activo, COUNT(*) 
FROM legal_consultations 
GROUP BY modelo_activo;
```

## 🚀 Escalabilidad

El sistema está diseñado para escalar:
- ✅ Agregar infinitas áreas y subáreas
- ✅ Cambiar modelo de IA sin downtime
- ✅ Caché para reducir costos
- ✅ Ventana de contexto optimizada

## 🛡️ Seguridad

- API keys encriptadas en BD
- Validación de consultas
- Rate limiting por usuario
- Logging de todas las interacciones
- Disclaimers legales obligatorios

## 📝 Ejemplo Completo

```typescript
// 1. Crear área
const area = await createArea({
  nombre: "Derecho Comercial",
  descripcion: "Regula actos de comercio y empresas"
});

// 2. Crear subárea
const subarea = await createSubarea({
  areaId: area.id,
  nombre: "Sociedades Comerciales",
  descripcion: "Tipos de sociedades y su constitución"
});

// 3. Crear norma
const norma = await createNorma({
  tipo: "Principal",
  nombre: "Código de Comercio",
  anio: 1971,
  descripcion: "Decreto 410 de 1971"
});

// 4. Asignar norma a subárea
await assignNormaToSubarea(subarea.id, norma.id);

// 5. Agregar concepto
await createConcepto({
  subareaId: subarea.id,
  concepto: "Sociedad Anónima",
  definicion: "Sociedad de capital dividido en acciones",
  fuente: "Código de Comercio, Artículo 373"
});

// ¡Listo! La IA ahora puede consultar sobre este tema.
```

---

**Desarrollado para ofrecer asesoría legal especializada en derecho colombiano** 🇨🇴⚖️
