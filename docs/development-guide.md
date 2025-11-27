# 🚀 Lawyer Platform - Development Guide

## 📋 Índice
- [Setup Inicial](#setup-inicial)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Base de Datos](#base-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Sistema de Licencias](#sistema-de-licencias)
- [Chat e IA Legal](#chat-e-ia-legal)
- [Flujos Principales](#flujos-principales)
- [APIs y Endpoints](#apis-y-endpoints)
- [Componentes Clave](#componentes-clave)
- [Variables de Entorno](#variables-de-entorno)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🛠️ Setup Inicial

### Prerequisitos
- Node.js 20+
- PostgreSQL (o acceso a Supabase)
- Git

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd lowyer

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Setup de base de datos
npx prisma generate
npx prisma db push

# Ejecutar migraciones
npx prisma migrate dev

# Sembrar datos iniciales
npm run db:seed

# Inicializar roles (solo primera vez)
# Visitar: http://localhost:3000/init-roles

# Inicializar áreas legales (solo primera vez)
# Desde panel admin: http://localhost:3000/admin/ia

# Ejecutar en desarrollo
npm run dev
```

### Verificación de Setup
- [ ] Prisma Studio abre sin errores: `npx prisma studio`
- [ ] Login/registro funcional
- [ ] Dashboard por roles funcional
- [ ] Chat con IA responde correctamente
- [ ] Sistema de licencias asigna trial automáticamente

## 🏗️ Arquitectura del Proyecto

### Patron de Arquitectura
- **Frontend**: Server-Side Rendering (SSR) con Remix
- **Backend**: Serverless functions + Edge computing
- **Database**: PostgreSQL con Prisma ORM
- **AI**: Google Gemini integrado
- **Storage**: Supabase Storage para archivos
- **Payments**: Integración con Wompi (Colombia)

### Principios de Diseño
1. **Seguridad primero**: Validación en cliente y servidor
2. **Performance**: Cache inteligente y lazy loading
3. **Escalabilidad**: Arquitectura serverless
4. **UX**: Interface intuitiva y responsive
5. **Compliance**: Cumplimiento legal y RGPD

## 💻 Stack Tecnológico

### Frontend
- **Remix**: Framework React con SSR
- **React 18**: UI Components
- **TypeScript**: Tipado estático
- **TailwindCSS**: Styling utility-first
- **Framer Motion**: Animaciones
- **Heroicons**: Iconografía

### Backend
- **Prisma**: ORM y gestión de BD
- **Supabase**: PostgreSQL + Auth + Storage
- **bcryptjs**: Hash de passwords
- **Zod**: Validación de schemas

### AI & External APIs
- **Google Gemini**: IA legal especializada
- **Wompi**: Pasarela de pagos (COP)
- **Axios**: HTTP client

### DevOps & Tools
- **Vite**: Build tool y bundling
- **ESLint**: Linting
- **TypeScript**: Type checking
- **Vercel**: Deploy platform

## 📁 Estructura de Carpetas

```
lowyer/
├── app/                          # Aplicación principal
│   ├── components/               # Componentes reutilizables
│   │   ├── Chat/                # Sistema de chat
│   │   ├── Layout.tsx           # Layout principal
│   │   ├── Navbar.tsx           # Navegación
│   │   └── ui/                  # Componentes UI base
│   ├── hooks/                   # Custom React hooks
│   │   └── useUser.ts           # Hook para usuario actual
│   ├── lib/                     # Lógica de servidor
│   │   ├── auth.server.ts       # Autenticación
│   │   ├── db.server.ts         # Conexión BD
│   │   ├── session.server.ts    # Gestión de sesiones
│   │   ├── permissions.server.ts # Sistema de permisos
│   │   ├── licenses.server.ts   # Lógica de licencias
│   │   ├── chat.server.ts       # Sistema de chat
│   │   ├── gemini.server.ts     # Integración IA
│   │   ├── legal-knowledge.server.ts # Base conocimiento legal
│   │   ├── ai-cache.server.ts   # Cache de respuestas IA
│   │   └── trial.server.ts      # Sistema de trial
│   ├── routes/                  # Rutas de la aplicación
│   │   ├── _index.tsx          # Página principal
│   │   ├── login.tsx           # Login
│   │   ├── signup.tsx          # Registro
│   │   ├── dashboard.tsx       # Dashboard principal
│   │   ├── chat.tsx            # Interfaz de chat
│   │   ├── licencias.tsx       # Gestión de licencias
│   │   ├── admin/              # Panel administrativo
│   │   │   ├── usuarios.tsx    # Gestión usuarios
│   │   │   ├── abogados.tsx    # Gestión abogados
│   │   │   └── ia.tsx          # Gestión IA y conocimiento legal
│   │   └── api/                # API endpoints
│   │       ├── chat/           # APIs de chat
│   │       └── admin/          # APIs administrativas
│   └── styles/                 # Estilos globales
├── prisma/                     # Schema y migraciones
│   ├── schema.prisma          # Modelo de datos
│   └── migrations/            # Migraciones de BD
├── docs/                      # Documentación
│   ├── todo/                  # Roadmap por fases
│   └── development-guide.md   # Esta guía
├── public/                    # Assets estáticos
└── package.json              # Dependencias y scripts
```

## 🗄️ Base de Datos

### Modelo de Datos Principal

#### Usuarios y Autenticación
- `users`: Información básica de usuario
- `profiles`: Datos personales extendidos
- `roles`: Definición de roles del sistema
- `role_permissions`: Permisos por rol
- `login_attempts`: Tracking de intentos de login

#### Sistema de Licencias
- `licenses`: Planes disponibles (trial, estándar, premium)
- `user_licenses`: Licencias activas por usuario
- `purchases`: Historial de compras
- `invoices`: Facturas generadas

#### Abogados
- `lawyers`: Información profesional
- `lawyer_documents`: Documentos de verificación
- `lawyer_reviews`: Calificaciones de usuarios

#### Chat y Comunicación
- `chat_sessions`: Sesiones de chat activas/cerradas
- `messages`: Mensajes entre participantes
- `message_moderation`: Moderación de contenido

#### IA Legal y Conocimiento
- `legal_areas`: Áreas del derecho colombiano
- `legal_complementary_laws`: Leyes por área
- `ai_response_cache`: Cache de respuestas de IA
- `legal_consultations`: Historial de consultas

#### Auditoría y Compliance
- `audit_logs`: Logs de acciones administrativas
- `consents`: Consentimientos legales
- `legal_holds`: Retención legal de datos

### Relaciones Clave
```sql
User 1:1 Profile
User 1:Many UserLicense
User 1:Many ChatSession
User 1:1 Lawyer (opcional)
ChatSession 1:Many Message
LegalArea 1:Many LegalConsultation
AiResponseCache M:1 LegalArea
```

## 🔐 Autenticación y Autorización

### Roles del Sistema
1. **SuperAdmin**: Control total del sistema
2. **Admin**: Gestión de usuarios y contenido
3. **Abogado**: Atención de consultas
4. **Usuario**: Acceso básico y chat

### Sistema de Permisos
```typescript
// Ejemplo de verificación de permisos
export function hasPermission(user: User, permission: string): boolean {
  return user.role.permissions.some(p => p.name === permission);
}

export function requireAdmin(user: User) {
  if (!isAdmin(user)) {
    throw new Response("Not authorized", { status: 403 });
  }
}
```

### Protección de Rutas
```typescript
// Middleware de autenticación
export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}
```

## 📜 Sistema de Licencias

### Tipos de Licencia
- **Trial**: 2 horas, 7 días, gratuito
- **Estándar**: 10 horas, 30 días, $50,000 COP
- **Premium**: 25 horas, 60 días, $120,000 COP
- **Empresarial**: 50 horas, 90 días, $200,000 COP

### Flujo de Licencias
```typescript
1. Usuario se registra → Trial automático
2. Si falla auto-trial → Reclamación manual
3. Trial se agota → Compra licencia
4. Pago exitoso → Activación automática
5. Licencia activa → Acceso a chat
6. Horas agotadas → Bloqueo hasta renovar
```

### Control de Horas
```typescript
// Descontar horas por actividad
await trackHours(userId, "chat_ia", 0.1); // 6 minutos
await trackHours(userId, "chat_lawyer", 0.25); // 15 minutos
```

## 🤖 Chat e IA Legal

### Arquitectura del Chat
- **Tiempo real**: Polling cada 2 segundos
- **Persistencia**: Todos los mensajes en BD
- **Estados**: sent, delivered, read
- **Participantes**: user, abogado, admin, ia

### Integración con Gemini AI
```typescript
// Configuración de IA legal
const LEGAL_SYSTEM_PROMPT = `
Eres un asistente legal especializado en derecho colombiano.
Siempre incluye disclaimers legales.
Enfócate en información general, no casos específicos.
`;

// Uso con cache inteligente
const response = await getGeminiResponse(query, history, {
  userId,
  sessionId,
  useCache: true
});
```

### Base de Conocimiento Legal
- **20 áreas del derecho** colombiano cubiertas
- **Cache inteligente** para respuestas frecuentes
- **Identificación automática** del área legal
- **Contexto específico** por tipo de consulta

### Funciones Principales del Chat
```typescript
// Crear sesión de chat
await createChatSession(userId, "ia" | "lawyer");

// Enviar mensaje
await sendMessage(sessionId, senderId, content, role);

// Respuesta automática de IA
await getGeminiResponse(query, history, options);

// Cerrar sesión
await closeChatSession(sessionId, userId, summary);
```

## 🔄 Flujos Principales

### Flujo de Registro y Onboarding
```
1. Usuario visita /signup
2. Completa formulario → Validación
3. Cuenta creada → Login automático
4. Trial asignado automáticamente
5. Redirección a dashboard
6. Puede usar chat inmediatamente
```

### Flujo de Chat con IA
```
1. Usuario con licencia válida
2. Accede a /chat → Selecciona "IA"
3. Sistema crea/reanudar sesión
4. Usuario envía consulta
5. IA identifica área legal
6. Busca en cache → Si no existe, genera respuesta
7. Respuesta con disclaimer legal
8. Se guarda en cache para futuras consultas
9. Horas descontadas automáticamente
```

### Flujo de Compra de Licencia
```
1. Usuario sin horas → Ve catálogo
2. Selecciona plan → Aplicar cupón (opcional)
3. Redirección a Wompi → Pago
4. Webhook confirmación → Licencia activada
5. Factura PDF generada → Enviada por email
6. Usuario puede usar chat inmediatamente
```

### Flujo de Verificación de Abogado
```
1. Usuario solicita ser abogado
2. Completa perfil profesional
3. Sube documentos requeridos
4. Admin revisa documentos
5. Aprobación/rechazo → Notificación
6. Si aprobado → Acceso a panel abogado
7. Puede recibir consultas asignadas
```

## 🛠️ APIs y Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Chat
- `POST /api/chat/create` - Crear sesión
- `POST /api/chat/send` - Enviar mensaje
- `GET /api/chat/messages` - Obtener mensajes
- `POST /api/chat/close` - Cerrar sesión

### IA Legal
- `POST /api/ai/query` - Consulta a IA
- `POST /api/ai/escalate` - Escalar a abogado

### Administración
- `POST /api/admin/init-legal-areas` - Inicializar conocimiento legal
- `POST /api/admin/clean-cache` - Limpiar cache expirado
- `GET /api/admin/metrics` - Métricas del sistema

### Licencias
- `POST /api/licenses/claim-trial` - Reclamar trial
- `GET /api/licenses/user/:id` - Licencias de usuario
- `POST /api/licenses/purchase` - Iniciar compra

## 🧩 Componentes Clave

### Layout y Navegación
```typescript
// Layout principal con autenticación
<Layout user={user}>
  <main>{children}</main>
</Layout>

// Navbar responsive con menú de usuario
<Navbar user={user} />
```

### Chat System
```typescript
// Container principal de chat
<ChatContainer sessionId={sessionId} />

// Lista de mensajes con scroll automático
<MessageList messages={messages} />

// Input con validación y contador
<MessageInput onSend={handleSend} />
```

### Sistema de Licencias
```typescript
// Estado de licencia del usuario
<LicenseStatus license={userLicense} />

// Banner de trial con alertas
<TrialBanner license={userLicense} />

// Selector de planes
<LicenseSelector plans={plans} />
```

### Administración
```typescript
// Dashboard con métricas
<AdminDashboard stats={stats} />

// Gestión de usuarios con filtros
<UserManagement users={users} />

// Panel de IA legal
<AIManagement areas={legalAreas} cache={cacheStats} />
```

## 🔧 Variables de Entorno

### Requeridas
```bash
# Base de datos
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# IA
GEMINI_API_KEY="AIza..."

# Sesiones
SESSION_SECRET="random-secret-key"

# Wompi (Producción)
WOMPI_PUBLIC_KEY="pub_prod_..."
WOMPI_PRIVATE_KEY="prv_prod_..."
WOMPI_WEBHOOK_SECRET="webhook_secret"

# Wompi (Test)
WOMPI_PUBLIC_KEY_TEST="pub_test_..."
WOMPI_PRIVATE_KEY_TEST="prv_test_..."
```

### Opcionales
```bash
# Environment
NODE_ENV="development"

# Email (futuro)
SMTP_HOST="smtp...."
SMTP_USER="..."
SMTP_PASS="..."

# Monitoring (futuro)
SENTRY_DSN="https://..."
```

## 🧪 Testing

### Setup de Testing
```bash
# Testing unitario
npm run test

# Testing de integración
npm run test:integration

# Testing E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Casos de Prueba Críticos
- [ ] Registro y login de usuarios
- [ ] Asignación automática de trial
- [ ] Chat con IA responde correctamente
- [ ] Sistema de licencias controla acceso
- [ ] Pagos activan licencias
- [ ] Admin puede gestionar usuarios
- [ ] Abogados pueden ser verificados

## 🚀 Deployment

### Pre-deploy Checklist
- [ ] Tests pasando
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Roles inicializados
- [ ] Áreas legales pobladas
- [ ] SSL configurado

### Deploy a Producción
```bash
# Build del proyecto
npm run build

# Deploy con Vercel
vercel --prod

# Verificar funcionalidad
curl https://lawyer.vercel.app/health
```

### Post-deploy
- [ ] Verificar conexión a BD
- [ ] Confirmar APIs funcionando
- [ ] Testear login/registro
- [ ] Verificar IA responde
- [ ] Confirmar sistema de pagos

## 🐛 Troubleshooting

### Problemas Comunes

#### IA no responde
```bash
# Verificar API key
echo $GEMINI_API_KEY

# Testear conexión
curl -H "x-goog-api-key: $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

#### Base de datos desincronizada
```bash
# Reset completo (CUIDADO: borra datos)
npx prisma migrate reset

# Regenerar cliente
npx prisma generate

# Push schema
npx prisma db push
```

#### Licencias no se asignan
```bash
# Verificar planes en BD
npx prisma studio

# Reinicializar licencias
# Visitar: /init-roles en el navegador
```

#### Cache de IA desactualizado
```bash
# Limpiar desde admin panel
# O directamente en BD:
# DELETE FROM ai_response_cache WHERE expires_at < NOW();
```

### Logs Importantes
```bash
# Logs de autenticación
grep "Login\|Register" logs/

# Logs de IA
grep "Gemini\|🤖" logs/

# Logs de licencias
grep "License\|Trial" logs/

# Logs de errores
grep "ERROR\|💥" logs/
```

### Comandos de Mantenimiento
```bash
# Limpiar cache expirado
npx prisma db execute --sql "DELETE FROM ai_response_cache WHERE expires_at < NOW();"

# Estadísticas de uso
npx prisma db execute --sql "SELECT COUNT(*) FROM legal_consultations WHERE created_at > NOW() - INTERVAL '24 hours';"

# Verificar licencias activas
npx prisma db execute --sql "SELECT COUNT(*) FROM user_licenses WHERE status = 'active';"
```

## 📚 Recursos Adicionales

### Documentación Externa
- [Remix Docs](https://remix.run/docs)
- [Prisma Guide](https://prisma.io/docs)
- [Supabase Docs](https://supabase.io/docs)
- [Gemini AI API](https://ai.google.dev/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

### Estructura Legal Colombiana
- [Código Civil](https://www.alcaldiabogota.gov.co)
- [Código de Comercio](https://www.supersociedades.gov.co)
- [Código Sustantivo del Trabajo](https://www.mintrabajo.gov.co)
- [Constitución Política](https://www.corteconstitucional.gov.co)

### Herramientas de Desarrollo
- **Prisma Studio**: `npx prisma studio`
- **Database Browser**: Interfaz web para BD
- **API Testing**: Thunder Client (VS Code)
- **Logs**: Terminal con filtros por componente

---

## 🎯 Próximos Pasos

### Fase 5: IA Legal Avanzada (COMPLETADA)
- [x] Base de conocimiento legal estructurada
- [x] Cache inteligente para respuestas
- [x] Identificación automática de área legal
- [x] Panel de administración para IA

### Fase 6: Pagos y Facturación
- [ ] Integración completa con Wompi
- [ ] Generación automática de facturas
- [ ] Sistema de cupones y descuentos
- [ ] Métricas de conversión

### Fase 7: Seguridad y Moderación
- [ ] Moderación automática de contenido
- [ ] Rate limiting avanzado
- [ ] Logs de auditoría detallados
- [ ] Cumplimiento RGPD/LOPD

---

**🚀 Esta guía cubre el estado actual del proyecto hasta la Fase 4-5 completada. Actualizar según progreso en fases siguientes.**
