# 🤖 FASE 5: Integración IA Legal

## 🎯 Objetivo
Implementar chat con IA especializada en derecho colombiano que funcione dentro del sistema de licencias.

## ✅ Criterios de Éxito
- [ ] IA responde consultas legales básicas
- [ ] Integración seamless con sistema de chat existente
- [ ] Respuestas contextualmente relevantes
- [ ] Control de horas para chat con IA
- [ ] Escalación a abogado humano cuando sea necesario

## 📝 Tareas Específicas

### 5.1 Configuración de IA
- [ ] Integrar API de IA (OpenAI/Claude/local)
- [ ] Crear prompt especializado en derecho colombiano
- [ ] Configurar limitaciones y disclaimers legales
- [ ] Definir casos de escalación a abogado humano

### 5.2 Extensión del Sistema de Chat
- [ ] Modificar chat para soportar sender_role "ia"
- [ ] Lógica para determinar cuándo responde IA vs abogado
- [ ] Interface diferenciada para mensajes de IA
- [ ] Botón para solicitar abogado humano

### 5.3 Procesamiento de Consultas Legales
- [ ] Análisis de tipo de consulta (civil, penal, laboral)
- [ ] Respuestas estructuradas con referencias legales
- [ ] Detección de casos complejos que requieren abogado
- [ ] Límites de responsabilidad claros

### 5.4 Gestión de Contexto
- [ ] Mantener contexto de conversación
- [ ] Historial de consultas del usuario
- [ ] Referencias a leyes específicas colombianas
- [ ] Seguimiento de temas recurrentes

### 5.5 Control de Calidad
- [ ] Validación de respuestas antes de envío
- [ ] Filtros para evitar consejos específicos de casos
- [ ] Logs de interacciones para mejora continua
- [ ] Escalación automática en casos sensibles

## 🔧 Archivos a Crear/Modificar

```
lib/
  ├── ai/
  │   ├── legal-ai.server.ts    [NUEVO]
  │   ├── prompts.ts            [NUEVO]
  │   ├── context-manager.ts    [NUEVO]
  │   └── escalation-rules.ts   [NUEVO]
  └── legal/
      ├── colombian-law.ts      [NUEVO]
      └── legal-references.ts   [NUEVO]

app/
  ├── components/
  │   ├── Chat/
  │   │   ├── AIMessage.tsx     [NUEVO]
  │   │   ├── LawyerRequest.tsx [NUEVO]
  │   │   └── LegalDisclaimer.tsx [NUEVO]
  │   └── AIIndicator.tsx       [NUEVO]
  ├── routes/
  │   └── api/
  │       ├── ai/
  │       │   ├── query.ts      [NUEVO]
  │       │   └── escalate.ts   [NUEVO]
  │       └── chat/
  │           └── send.ts       [MODIFICAR]
  └── data/
      └── legal-knowledge.json  [NUEVO]
```

## 🧪 Criterios de Prueba
1. **Respuestas**: IA debe dar respuestas coherentes sobre derecho colombiano
2. **Escalación**: Casos complejos deben derivarse a abogado
3. **Contexto**: IA debe recordar conversación previa
4. **Límites**: IA debe declinar dar consejos específicos
5. **Horas**: Chat con IA debe consumir horas de licencia

## ⚠️ Notas Importantes
- **Disclaimers legales obligatorios** en cada respuesta
- IA no debe dar consejos específicos, solo información general
- Escalación a humano debe ser fácil y rápida
- Mantener logs para auditoría legal

## 💡 Prompt Base para IA Legal
```
Eres un asistente de información legal general sobre derecho colombiano.
NUNCA des consejos específicos para casos particulares.
Siempre incluye disclaimer de que no sustituye asesoría legal profesional.
En casos complejos, recomienda consultar abogado humano.
Enfócate en: normativa general, procedimientos, derechos básicos.
```

## 🎨 Consideraciones de UX
- Mensajes de IA con icono distintivo
- Disclaimers visibles pero no invasivos
- Botón prominente "Hablar con abogado"
- Indicador claro cuando responde IA vs humano
- Tiempo de respuesta rápido (< 3 segundos)

## 📋 Casos de Escalación Automática
- Consultas sobre casos penales graves
- Solicitudes de representación legal
- Situaciones de emergencia legal
- Consultas muy específicas de procedimientos

## 🔄 Siguiente Fase
Una vez completada esta fase → **Fase 6: Pagos y Facturación**