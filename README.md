# ⚖️ Lawyer Platform - Plataforma Legal con IA

## 🎯 Descripción General

**Lawyer** es una plataforma web **Full Stack Serverless** que combina **inteligencia artificial aplicada al ámbito legal** con la interacción en tiempo real entre usuarios y abogados certificados.

Su propósito es brindar un servicio **seguro, confiable y escalable**, donde los usuarios puedan acceder a un agente legal de IA especializado en derecho colombiano y, cuando lo requieran, interactuar con abogados humanos.

## 🚀 Estado del Proyecto

### ✅ Fases Completadas (1-5)

**Progreso actual: 83% del Core MVP completado**

- ✅ **Fase 1: Fundación** - Prisma + Supabase + Autenticación básica
- ✅ **Fase 2: Roles y Usuarios** - Sistema completo de gestión de usuarios
- ✅ **Fase 3: Licencias** - Trial automático/manual + control de horas
- ✅ **Fase 4: Chat Básico** - Chat funcional con estados y persistencia
- ✅ **Fase 5: IA Legal** - Gemini AI especializado en derecho colombiano

### 🔄 En Desarrollo

- 🔄 **Fase 6: Pagos y Facturación** - Integración con Wompi (Próxima)

### ⏳ Pendientes

- ⏳ **Fase 7: Seguridad y Moderación**
- ⏳ **Fase 8: Métricas y Reportes**
- ⏳ **Fase 9: Optimización y Deploy**

## 🌟 Características Principales

### 🤖 Asistente Legal con IA (Gemini 2.5 Flash)
- **20 áreas del derecho colombiano** cubiertas
- **Cache inteligente** para respuestas rápidas
- **Identificación automática** del área legal
- **Disclaimers legales** siempre incluidos
- **Contexto especializado** por tipo de consulta

### 👥 Sistema de Roles Completo
- **SuperAdmin**: Control total del sistema
- **Admin**: Gestión de usuarios y contenido
- **Abogado**: Atención de consultas con verificación
- **Usuario**: Acceso básico y chat

### 📜 Gestión de Licencias
- **Trial automático**: 2 horas gratis al registrarse
- **Trial manual**: Opción para reclamar si falla auto-asignación
- **Control de horas**: Tracking en tiempo real
- **Expiración automática**: Por tiempo o horas agotadas
- **Una licencia activa** por usuario

### 💬 Sistema de Chat Avanzado
- **Chat con IA**: Respuestas instantáneas con contexto legal
- **Chat con abogados**: Asignación automática de profesionales
- **Estados de mensaje**: Enviado, entregado, leído
- **Persistencia completa**: Todos los mensajes en BD
- **Control de acceso**: Solo con licencia válida

### 🛡️ Seguridad
- **Autenticación robusta**: Email + contraseña con bcrypt
- **Roles y permisos**: Control granular de acceso
- **Logging completo**: Debug y monitoreo del sistema
- **Row Level Security**: Políticas en Supabase
- **Validación en capas**: Cliente + servidor + BD

## 💻 Stack Tecnológico

### Frontend
- **Remix** - Framework React con SSR
- **React 18** - Componentes UI
- **TypeScript** - Tipado estático
- **TailwindCSS** - Styling utility-first
- **Framer Motion** - Animaciones fluidas
- **Heroicons** - Iconografía SVG

### Backend
- **Prisma** - ORM y gestión de BD
- **Supabase** - PostgreSQL + Auth + Storage
- **Node.js 20+** - Runtime del servidor
- **bcryptjs** - Hash de contraseñas
- **Zod** - Validación de schemas

### IA y APIs Externas
- **Google Gemini 2.5 Flash** - IA legal especializada
- **Wompi** - Pasarela de pagos COP (próximamente)
- **Axios** - Cliente HTTP

### DevOps
- **Vite** - Build tool y bundling
- **ESLint** - Linting de código
- **Vercel** - Plataforma de deploy

## 📦 Instalación y Setup

### Prerequisitos
- Node.js 20+
- PostgreSQL (o cuenta de Supabase)
- Git

### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd lowyer

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Setup de base de datos
npx prisma generate
npx prisma db push

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Sembrar datos iniciales
npm run db:seed

# 7. Inicializar roles (solo primera vez)
# Visitar: http://localhost:3000/init-roles

# 8. Inicializar áreas legales (solo primera vez)
# Desde panel admin: http://localhost:3000/admin/ia

# 9. Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas

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

# Environment
NODE_ENV="development"
```

## 🗂️ Estructura del Proyecto

```
lowyer/
├── app/                          # Aplicación principal
│   ├── components/               # Componentes reutilizables
│   │   ├── Chat/                # Sistema de chat completo
│   │   ├── Layout.tsx           # Layout principal
│   │   └── Navbar.tsx           # Navegación
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Lógica de servidor
│   │   ├── auth.server.ts       # Autenticación
│   │   ├── chat.server.ts       # Sistema de chat
│   │   ├── gemini.server.ts     # Integración IA
│   │   ├── licenses.server.ts   # Gestión de licencias
│   │   ├── trial.server.ts      # Sistema de trial
│   │   └── legal-knowledge.server.ts # Base conocimiento
│   ├── routes/                  # Rutas de la aplicación
│   │   ├── _index.tsx          # Página principal
│   │   ├── login.tsx           # Login
│   │   ├── signup.tsx          # Registro
│   │   ├── chat.tsx            # Interfaz de chat
│   │   ├── licencias.tsx       # Gestión de licencias
│   │   └── admin/              # Panel administrativo
│   └── styles/                 # Estilos globales
├── prisma/                     # Schema y migraciones
│   ├── schema.prisma          # Modelo de datos
│   └── migrations/            # Migraciones de BD
├── docs/                      # Documentación completa
│   ├── todo/                  # Roadmap por fases
│   ├── technical/             # Docs técnicas
│   └── database/              # Guías de BD
└── public/                    # Assets estáticos
```

## 🎨 Características de la Interfaz

### Dashboard Diferenciado por Rol
- **Usuario**: Perfil básico + licencias + acceso a chat
- **Abogado**: Perfil profesional + estadísticas + verificación
- **Admin**: Gestión completa + métricas del sistema
- **SuperAdmin**: Control total + configuración avanzada

### Sistema de Chat Intuitivo
- **Selección de tipo**: IA o Abogado
- **Sidebar informativa**: Estado de licencia y horas
- **Mensajes diferenciados**: Visual claro por remitente
- **Empty states**: Mensajes informativos
- **Responsive**: Funciona en móvil y desktop

### Página de Licencias Moderna
- **Tarjeta de licencia activa**: Progreso visual
- **Reclamación de trial**: Botón destacado si aplica
- **Catálogo de planes**: Cards con gradientes por tipo
- **Historial completo**: Timeline de licencias

## 🤖 Sistema de IA Legal

### Gemini 2.5 Flash Integration

**Características:**
- Modelo más reciente y eficiente de Google
- Especializado en derecho colombiano
- Respuestas con contexto legal específico
- Cache inteligente para optimizar consultas

### 20 Áreas Legales Cubiertas

```
1. Derecho Civil            11. Derecho de Familia
2. Derecho Comercial        12. Derecho Laboral
3. Derecho Penal            13. Derecho Tributario
4. Derecho Constitucional   14. Derecho Ambiental
5. Derecho Administrativo   15. Derecho del Consumidor
6. Derecho de Contratos     16. Derecho de Propiedad Intelectual
7. Derecho Sucesoral        17. Derecho Bancario
8. Derecho de Sociedades    18. Derecho de Seguros
9. Derecho Inmobiliario     19. Derecho Público
10. Derecho de Transporte   20. Derecho Privado
```

### Cache Inteligente
- **Hit rate objetivo**: > 60%
- **Expiración**: 7 días por defecto
- **Identificación**: Por hash de consulta
- **Actualización**: Manual desde panel admin

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con HMR

# Build
npm run build           # Compilar para producción

# Base de datos
npm run db:generate     # Generar cliente de Prisma
npm run db:push         # Push schema a BD sin migración
npm run db:migrate      # Ejecutar migraciones
npm run db:studio       # Abrir Prisma Studio
npm run db:seed         # Sembrar datos iniciales

# Otros
npm run typecheck       # Verificar tipos TypeScript
npm run lint           # Linting con ESLint
```

## 📊 Base de Datos

### Modelo de Datos Principal

**40+ tablas** organizadas en dominios:

#### Autenticación y Usuarios
- `users`, `profiles`, `roles`, `permissions`, `role_permissions`
- `login_attempts`

#### Sistema Legal
- `lawyers`, `lawyer_documents`, `lawyer_reviews`, `lawyer_metrics`

#### Licencias y Pagos
- `licenses`, `user_licenses`, `purchases`, `invoices`, `discounts`

#### Conocimiento Legal y IA
- `legal_areas`, `legal_complementary_laws`
- `ai_response_cache`, `legal_consultations`

#### Comunicación
- `chat_sessions`, `messages`, `message_moderation`

#### Auditoría y Métricas
- `audit_logs`, `consents`, `legal_holds`
- `user_metrics`, `sales_metrics`

## 🧪 Testing

```bash
# Verificación del setup
npm run typecheck        # Verificar tipos
npx prisma validate     # Validar schema
npx prisma studio       # Verificar datos en BD

# Testing de funcionalidades críticas
# - Registro y login de usuarios ✅
# - Asignación automática de trial ✅
# - Chat con IA responde correctamente ✅
# - Sistema de licencias controla acceso ✅
# - Admin puede gestionar usuarios ✅
```

## 📈 Roadmap

Ver documentación completa en: `docs/todo/00-roadmap.md`

### Próximos Hitos
1. **Integración Wompi** - Pagos con COP
2. **Sistema de moderación** - Seguridad avanzada
3. **Dashboard de métricas** - Análisis de negocio
4. **Optimización** - Performance y SEO
5. **Deploy a producción** - Lanzamiento oficial

## 🤝 Contribución

Este es un proyecto privado en desarrollo activo. Para consultas o colaboraciones, contactar al equipo de desarrollo.

## 📝 Licencia

Todos los derechos reservados © 2024 Lawyer Platform

---

## 📚 Documentación Adicional

- **[Guía de Desarrollo](docs/development-guide.md)** - Setup y desarrollo
- **[Arquitectura Técnica](docs/technical/architecture.md)** - Diseño del sistema
- **[Guía de Base de Datos](docs/database/setup-guide.md)** - Gestión de BD
- **[Guía de Migraciones](docs/database/migrations-guide.md)** - Migraciones seguras
- **[Roadmap Completo](docs/todo/00-roadmap.md)** - Plan de desarrollo

## 🆘 Soporte y Troubleshooting

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
# Regenerar cliente
npx prisma generate

# Push schema
npx prisma db push
```

#### Licencias no se asignan
```bash
# Verificar en BD
npx prisma studio

# Reinicializar
# Visitar: http://localhost:3000/init-roles
```

### Logs Importantes
```bash
# Autenticación
grep "Login\|Register" logs/

# IA
grep "Gemini\|🤖" logs/

# Licencias
grep "License\|Trial" logs/
```

## 🎯 Estado Actual

**Versión:** 0.5.0 (MVP en desarrollo)  
**Última actualización:** Diciembre 2024  
**Fases completadas:** 5/9 (55% total, 83% del core MVP)

### ✨ Funcionalidades Destacadas Implementadas

- ✅ Sistema completo de autenticación y autorización
- ✅ Gestión avanzada de usuarios con 4 roles
- ✅ Dashboards específicos por tipo de usuario
- ✅ Sistema de licencias con trial dual (auto/manual)
- ✅ Control de horas en tiempo real
- ✅ Chat avanzado con IA y abogados
- ✅ Gemini 2.5 Flash especializado en derecho colombiano
- ✅ Base de conocimiento legal de 20 áreas
- ✅ Cache inteligente para respuestas de IA
- ✅ Panel de administración completo
- ✅ Verificación de abogados con documentos
- ✅ Logging completo para debugging
- ✅ UI/UX moderna y responsive

### 🚀 Próximamente

- 💳 Integración con Wompi para pagos
- 🛡️ Sistema de moderación avanzado
- 📊 Dashboard de métricas y reportes
- ⚡ Optimización de performance
- 🌐 Deploy a producción

---

**Desarrollado con ❤️ para revolucionar el acceso a servicios legales en Colombia**