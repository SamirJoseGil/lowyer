# 🗃️ Guía de Base de Datos - Lawyer Platform

## 📋 Tabla de Contenido
1. [Configuración Inicial](#configuración-inicial)
2. [Migraciones](#migraciones)
3. [Esquema de Base de Datos](#esquema-de-base-de-datos)
4. [Procedimientos de Mantenimiento](#procedimientos-de-mantenimiento)
5. [Troubleshooting](#troubleshooting)
6. [Backup y Recovery](#backup-y-recovery)

## 🚀 Configuración Inicial

### Prerequisitos
- Node.js 20+
- Cuenta de Supabase
- Variables de entorno configuradas

### Setup Paso a Paso

1. **Instalar Dependencias**
```bash
npm install
npm install prisma @prisma/client
```

2. **Configurar Variables de Entorno**
```bash
# .env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/[database]?schema=public"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/[database]?schema=public"
```

3. **Generar Cliente de Prisma**
```bash
npx prisma generate
```

4. **Ejecutar Migraciones**
```bash
npx prisma db push
# o para ambiente de desarrollo
npx prisma migrate dev
```

5. **Verificar Conexión**
```bash
npx prisma studio
```

## 🔄 Migraciones

### Comandos Principales

#### Desarrollo
```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear BD (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status
```

#### Producción
```bash
# Aplicar migraciones pendientes
npx prisma migrate deploy

# Ver diferencias sin aplicar
npx prisma db diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource
```

### Flujo de Trabajo Recomendado

1. **Modificar Schema**
   - Editar `prisma/schema.prisma`
   - Añadir nuevos campos, modelos o relaciones

2. **Crear Migración**
```bash
npx prisma migrate dev --name add_legal_knowledge_tables
```

3. **Revisar Archivos de Migración**
   - Verificar SQL generado en `prisma/migrations/`
   - Hacer ajustes manuales si es necesario

4. **Aplicar en Staging/Producción**
```bash
npx prisma migrate deploy
```

### Migraciones Personalizadas

Para migraciones complejas, crear archivos SQL manuales:

```sql
-- prisma/migrations/20241201000000_custom_migration/migration.sql
-- Agregar índices personalizados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_legal_consultations_created_at 
ON legal_consultations (created_at DESC);

-- Agregar funciones de BD
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ai_response_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Esquema de Base de Datos

### Estructura Principal

```
┌── AUTENTICACIÓN Y USUARIOS
│   ├── users (usuarios del sistema)
│   ├── profiles (información personal)
│   ├── roles (tipos de usuario)
│   ├── permissions (permisos específicos)
│   └── role_permissions (relación roles-permisos)
│
├── SISTEMA LEGAL
│   ├── lawyers (abogados verificados)
│   ├── lawyer_documents (documentos de verificación)
│   ├── lawyer_reviews (calificaciones)
│   └── lawyer_metrics (estadísticas de abogados)
│
├── LICENCIAS Y PAGOS
│   ├── licenses (tipos de licencia disponibles)
│   ├── user_licenses (licencias activas de usuarios)
│   ├── purchases (historial de compras)
│   ├── invoices (facturas generadas)
│   └── discounts (cupones y descuentos)
│
├── CONOCIMIENTO LEGAL Y IA
│   ├── legal_areas (áreas del derecho colombiano)
│   ├── legal_complementary_laws (leyes complementarias)
│   ├── ai_response_cache (cache de respuestas IA)
│   └── legal_consultations (log de consultas)
│
├── COMUNICACIÓN
│   ├── chat_sessions (sesiones de chat)
│   ├── messages (mensajes del chat)
│   └── message_moderation (moderación de contenido)
│
└── AUDITORÍA Y MÉTRICAS
    ├── audit_logs (log de actividades)
    ├── login_attempts (intentos de login)
    ├── consents (consentimientos legales)
    ├── user_metrics (métricas por usuario)
    └── sales_metrics (métricas de ventas)
```

### Relaciones Importantes

#### Usuario → Licencias
```sql
User (1) ←→ (N) UserLicense ←→ (1) License
```

#### Chat → Participantes
```sql
User (1) ←→ (N) ChatSession ←→ (0..1) Lawyer
ChatSession (1) ←→ (N) Message
```

#### Conocimiento Legal
```sql
LegalArea (1) ←→ (N) LegalComplementaryLaw
LegalArea (1) ←→ (N) AiResponseCache
LegalArea (1) ←→ (N) LegalConsultation
```

## 🛠️ Procedimientos de Mantenimiento

### Limpieza Automática

#### 1. Cache de IA Expirado
```sql
-- Ejecutar diariamente
DELETE FROM ai_response_cache 
WHERE expires_at < NOW();
```

#### 2. Sesiones de Chat Antiguas
```sql
-- Limpiar sesiones inactivas de más de 30 días
UPDATE chat_sessions 
SET status = 'expired'
WHERE status = 'active' 
  AND started_at < NOW() - INTERVAL '30 days';
```

#### 3. Logs de Auditoría
```sql
-- Mantener solo últimos 90 días
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Scripts de Mantenimiento

#### maintenance/cleanup.sql
```sql
-- Script de limpieza semanal
DO $$
BEGIN
    -- Limpiar cache expirado
    DELETE FROM ai_response_cache WHERE expires_at < NOW();
    
    -- Actualizar métricas de usuarios
    UPDATE user_metrics 
    SET hours_used_total = (
        SELECT COALESCE(SUM(hours_consumed), 0)
        FROM chat_sessions cs
        WHERE cs.user_id = user_metrics.user_id
          AND cs.status = 'closed'
    );
    
    -- Log de limpieza
    INSERT INTO audit_logs (action, meta, created_at)
    VALUES ('system_cleanup', '{"automated": true}', NOW());
END $$;
```

### Optimización de Performance

#### Índices Recomendados
```sql
-- Consultas frecuentes de usuarios
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON users (email) WHERE status = 'active';

-- Búsquedas de licencias activas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_licenses_active 
ON user_licenses (user_id, status) WHERE status = 'active';

-- Mensajes de chat por sesión
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_session_time 
ON messages (chat_session_id, created_at DESC);

-- Cache de IA por hash
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_cache_hash_valid 
ON ai_response_cache (query_hash) WHERE expires_at > NOW();
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión
```bash
Error: P1001: Can't reach database server
```
**Solución:**
- Verificar variables de entorno
- Comprobar conectividad de red
- Validar credenciales de Supabase

#### 2. Conflicto de Migraciones
```bash
Error: P3005: The database schema is not in sync
```
**Solución:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

#### 3. Lock de Migración
```bash
Error: Migration engine is already running
```
**Solución:**
```bash
# Eliminar archivo de lock
rm prisma/migrations/migration_lock.toml
npx prisma migrate status
```

#### 4. Schema Drift
```bash
npx prisma db diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource
```

### Logs de Debug

#### Habilitar Logs de Prisma
```bash
# En desarrollo
DEBUG="prisma:*" npm run dev

# Solo queries
DEBUG="prisma:query" npm run dev
```

#### Verificar Estado de BD
```bash
# Ver tablas existentes
npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

# Ver migraciones aplicadas
npx prisma migrate status
```

## 💾 Backup y Recovery

### Backup Automático (Supabase)

Supabase maneja backups automáticos, pero para backups manuales:

```bash
# Backup completo
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo datos
pg_dump --data-only $DATABASE_URL > data_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo esquema
pg_dump --schema-only $DATABASE_URL > schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

```bash
# Restore completo
psql $DATABASE_URL < backup_20241201_120000.sql

# Restore solo datos (esquema debe existir)
psql $DATABASE_URL < data_backup_20241201_120000.sql
```

### Backup de Datos Críticos

#### Script de Backup Esencial
```sql
-- backup_critical_data.sql
COPY (
    SELECT u.email, u.status, u.created_at,
           p.first_name, p.last_name,
           ul.hours_remaining, ul.status as license_status
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN user_licenses ul ON u.id = ul.user_id AND ul.status = 'active'
    WHERE u.status = 'active'
) TO '/tmp/users_backup.csv' WITH CSV HEADER;
```

### Recovery Procedures

#### 1. Recovery Completo
```bash
# 1. Crear nueva BD
createdb lawyer_recovery

# 2. Restore backup
psql lawyer_recovery < backup_completo.sql

# 3. Actualizar connection string
# 4. Verificar integridad
npx prisma migrate status
```

#### 2. Recovery Parcial
```sql
-- Restore solo usuarios críticos
INSERT INTO users (email, role_id, status, created_at)
SELECT email, role_id, status, created_at
FROM backup_users
WHERE status = 'active' AND email LIKE '%@lawyer.com';
```

## 📈 Monitoreo de Performance

### Queries Críticas a Monitorear

```sql
-- 1. Usuarios activos con licencias válidas
EXPLAIN ANALYZE
SELECT u.email, ul.hours_remaining
FROM users u
JOIN user_licenses ul ON u.id = ul.user_id
WHERE u.status = 'active' AND ul.status = 'active';

-- 2. Cache hit rate de IA
SELECT 
    COUNT(*) as total_queries,
    SUM(hit_count) as total_hits,
    ROUND(AVG(hit_count), 2) as avg_hits_per_query
FROM ai_response_cache
WHERE created_at > NOW() - INTERVAL '7 days';

-- 3. Sesiones de chat activas
SELECT COUNT(*) as active_sessions
FROM chat_sessions
WHERE status = 'active'
  AND started_at > NOW() - INTERVAL '24 hours';
```

### Alertas Recomendadas

1. **Conexiones BD > 80%**
2. **Queries lentas > 1 segundo**
3. **Cache hit rate < 60%**
4. **Espacio en disco > 90%**
5. **Sesiones colgadas > 1 hora**

---

## 📞 Contacto y Soporte

Para problemas específicos de BD:
1. Revisar logs de Prisma
2. Consultar documentación de Supabase
3. Verificar estado del servicio
4. Contactar soporte técnico

**Última actualización:** Diciembre 2024
**Versión del documento:** 1.0
