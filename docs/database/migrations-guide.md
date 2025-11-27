# 🔄 Guía de Migraciones - Lawyer Platform

## 📋 Índice
1. [Conceptos Básicos](#conceptos-básicos)
2. [Flujo de Trabajo](#flujo-de-trabajo)
3. [Tipos de Migraciones](#tipos-de-migraciones)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Casos de Uso Comunes](#casos-de-uso-comunes)
6. [Rollback y Recovery](#rollback-y-recovery)

## 🎯 Conceptos Básicos

### ¿Qué son las Migraciones?

Las migraciones son **scripts de base de datos versionados** que permiten:
- Evolucionar el esquema de BD de forma controlada
- Mantener sincronización entre ambientes (dev/staging/prod)
- Registrar historial de cambios
- Permitir rollbacks seguros

### Estructura de Archivos

```
prisma/
├── schema.prisma              # Esquema actual (source of truth)
├── migrations/
│   ├── 20241201120000_init/
│   │   └── migration.sql      # SQL generado automáticamente
│   ├── 20241202130000_add_legal_areas/
│   │   └── migration.sql
│   └── migration_lock.toml    # Lock para evitar conflictos
└── seed.ts                    # Datos iniciales
```

## 🚀 Flujo de Trabajo

### Desarrollo Local

#### 1. Modificar Schema
```prisma
// prisma/schema.prisma
model LegalArea {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @unique
  description String
  mainLaw     String   @map("main_law")
  // Nuevo campo añadido
  isActive    Boolean  @default(true) @map("is_active")
  
  @@map("legal_areas")
}
```

#### 2. Crear Migración
```bash
npx prisma migrate dev --name add_legal_area_status
```

#### 3. Verificar SQL Generado
```sql
-- prisma/migrations/20241201140000_add_legal_area_status/migration.sql
ALTER TABLE "legal_areas" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
```

#### 4. Aplicar y Generar Cliente
```bash
# Ya aplicado automáticamente con migrate dev
npx prisma generate
```

### Staging/Producción

#### 1. Deploy Migraciones
```bash
npx prisma migrate deploy
```

#### 2. Verificar Estado
```bash
npx prisma migrate status
```

## 📝 Tipos de Migraciones

### 1. Migraciones Automáticas (Prisma)

**Cuándo usar:** Cambios simples que Prisma puede generar correctamente.

```prisma
// Añadir campo opcional
model User {
  id        String   @id
  email     String   @unique
  // Nuevo campo
  lastSeen  DateTime? @map("last_seen")
}
```

### 2. Migraciones Personalizadas

**Cuándo usar:** Cambios complejos, datos que migrar, índices específicos.

#### Proceso:
1. Crear migración vacía
```bash
npx prisma migrate dev --create-only --name custom_indexes
```

2. Editar SQL manualmente
```sql
-- prisma/migrations/20241201150000_custom_indexes/migration.sql
-- Índices para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_legal_consultations_user_area
ON legal_consultations (user_id, legal_area_id, created_at DESC);

-- Función de limpieza automática
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE chat_sessions 
    SET status = 'expired',
        ended_at = NOW()
    WHERE status = 'active' 
      AND started_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    INSERT INTO audit_logs (action, meta)
    VALUES ('auto_cleanup_sessions', jsonb_build_object('cleaned_count', cleaned_count));
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;
```

3. Aplicar migración
```bash
npx prisma migrate dev
```

### 3. Migraciones de Datos

**Para migrar datos existentes:**

```sql
-- prisma/migrations/20241201160000_migrate_user_data/migration.sql

-- Migrar datos de tabla antigua a nueva estructura
INSERT INTO user_profiles (user_id, full_name, created_at)
SELECT 
    id,
    CONCAT(first_name, ' ', last_name) as full_name,
    created_at
FROM users
WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- Limpiar campos antiguos (opcional, hacer con cuidado)
-- ALTER TABLE users DROP COLUMN first_name;
-- ALTER TABLE users DROP COLUMN last_name;
```

## ✅ Mejores Prácticas

### 1. Naming Conventions

```bash
# Buenos nombres
npx prisma migrate dev --name add_user_preferences
npx prisma migrate dev --name remove_deprecated_fields
npx prisma migrate dev --name fix_user_license_constraint

# Evitar nombres genéricos
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### 2. Cambios Backwards Compatible

#### ✅ Seguros (no rompen código existente)
```sql
-- Añadir campos opcionales
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Añadir tablas nuevas
CREATE TABLE notifications (...);

-- Añadir índices
CREATE INDEX idx_users_email ON users (email);
```

#### ⚠️ Peligrosos (pueden romper código)
```sql
-- Eliminar campos (verificar que no se usen)
ALTER TABLE users DROP COLUMN old_field;

-- Renombrar campos
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Cambiar tipos de datos
ALTER TABLE users ALTER COLUMN age TYPE INTEGER;
```

### 3. Orden de Operaciones

1. **Añadir primero** (campos, tablas, índices)
2. **Migrar datos** si es necesario
3. **Eliminar después** (solo cuando esté seguro)

### 4. Testing de Migraciones

```bash
# 1. Backup antes de migrar
pg_dump $DATABASE_URL > backup_before_migration.sql

# 2. Aplicar en base de prueba
npx prisma migrate dev

# 3. Verificar integridad
npx prisma validate

# 4. Probar queries críticas
psql $DATABASE_URL <<< "SELECT COUNT(*) FROM users WHERE status = 'active';"
```

## 🔧 Casos de Uso Comunes

### 1. Añadir Nueva Funcionalidad

#### Escenario: Sistema de Notificaciones
```prisma
// 1. Añadir al schema
model Notification {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  title     String
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

// 2. Actualizar User model
model User {
  // ...existing fields...
  notifications Notification[]
}
```

```bash
# 3. Crear migración
npx prisma migrate dev --name add_notifications_system
```

### 2. Refactoring de Schema

#### Escenario: Separar datos de perfil
```sql
-- prisma/migrations/20241201170000_separate_user_profiles/migration.sql

-- 1. Crear nueva tabla
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Migrar datos existentes
INSERT INTO user_profiles (user_id, first_name, last_name, created_at)
SELECT id, first_name, last_name, created_at
FROM users
WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- 3. Crear índices
CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);
```

### 3. Performance Optimization

```sql
-- prisma/migrations/20241201180000_optimize_queries/migration.sql

-- Índices compuestos para queries frecuentes
CREATE INDEX CONCURRENTLY idx_chat_sessions_user_status 
ON chat_sessions (user_id, status) 
WHERE status IN ('active', 'pending');

-- Índice parcial para licencias activas
CREATE INDEX CONCURRENTLY idx_user_licenses_active_hours 
ON user_licenses (user_id, hours_remaining) 
WHERE status = 'active' AND hours_remaining > 0;

-- Índice para búsquedas de texto en mensajes (si necesario)
CREATE INDEX CONCURRENTLY idx_messages_content_search 
ON messages USING gin(to_tsvector('spanish', content))
WHERE content IS NOT NULL;
```

### 4. Cleanup y Mantenimiento

```sql
-- prisma/migrations/20241201190000_add_cleanup_procedures/migration.sql

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS TABLE(deleted_count INTEGER) AS $$
BEGIN
    DELETE FROM ai_response_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO audit_logs (action, meta)
    VALUES ('cleanup_expired_cache', jsonb_build_object('deleted_count', deleted_count));
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar métricas automáticamente
CREATE OR REPLACE FUNCTION update_user_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'closed' THEN
        -- Actualizar métricas cuando se cierra una sesión
        INSERT INTO user_metrics (user_id, sessions_count, last_session_at, hours_used_total)
        VALUES (NEW.user_id, 1, NEW.ended_at, COALESCE(NEW.metadata->>'hoursConsumed', '0')::DECIMAL)
        ON CONFLICT (user_id) DO UPDATE SET
            sessions_count = user_metrics.sessions_count + 1,
            last_session_at = NEW.ended_at,
            hours_used_total = user_metrics.hours_used_total + COALESCE(NEW.metadata->>'hoursConsumed', '0')::DECIMAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_metrics
    AFTER UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_metrics();
```

## 🔙 Rollback y Recovery

### Rollback de Migraciones

#### ⚠️ Prisma NO soporta rollback automático

**Opciones para rollback:**

#### 1. Reset Completo (DESARROLLO SOLAMENTE)
```bash
npx prisma migrate reset
# ⚠️ BORRA TODOS LOS DATOS
```

#### 2. Rollback Manual (PRODUCCIÓN)

1. **Identificar migración problemática**
```bash
npx prisma migrate status
```

2. **Crear migración de rollback**
```sql
-- prisma/migrations/20241201200000_rollback_notifications/migration.sql
-- Rollback de add_notifications_system

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_user_metrics ON chat_sessions;
DROP FUNCTION IF EXISTS update_user_metrics();

-- Eliminar tabla
DROP TABLE IF EXISTS notifications;

-- Eliminar columna de User si se añadió
-- ALTER TABLE users DROP COLUMN IF EXISTS notification_preferences;
```

3. **Aplicar rollback**
```bash
npx prisma migrate dev --name rollback_notifications
```

### Recovery de Emergencia

#### 1. Backup Point-in-Time
```bash
# Restore a timestamp específico (si Supabase lo soporta)
# O usar backup más reciente
psql $DATABASE_URL < backup_before_migration.sql
```

#### 2. Migración de Reparación
```sql
-- prisma/migrations/20241201210000_emergency_fix/migration.sql
-- Reparar datos inconsistentes

-- Ejemplo: Reparar foreign keys rotos
UPDATE user_licenses 
SET license_id = (SELECT id FROM licenses WHERE type = 'trial' LIMIT 1)
WHERE license_id NOT IN (SELECT id FROM licenses);

-- Eliminar registros huérfanos
DELETE FROM chat_sessions 
WHERE user_id NOT IN (SELECT id FROM users);
```

### Validación Post-Migración

```bash
# Verificar integridad
npx prisma validate

# Verificar constraints
psql $DATABASE_URL <<< "
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE NOT convalidated;
"

# Verificar datos críticos
psql $DATABASE_URL <<< "
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(DISTINCT id) as unique_users
FROM users;
"
```

## 📋 Checklist de Migración

### Pre-Migración
- [ ] Backup de BD realizado
- [ ] Migración probada en ambiente de staging
- [ ] Código dependiente actualizado
- [ ] Plan de rollback documentado
- [ ] Ventana de mantenimiento comunicada

### Durante Migración
- [ ] Verificar estado inicial: `npx prisma migrate status`
- [ ] Aplicar migración: `npx prisma migrate deploy`
- [ ] Verificar aplicación exitosa
- [ ] Generar cliente: `npx prisma generate`
- [ ] Ejecutar tests críticos

### Post-Migración
- [ ] Verificar integridad de datos
- [ ] Probar funcionalidades críticas
- [ ] Monitorear performance
- [ ] Verificar logs de error
- [ ] Actualizar documentación

---

## 🆘 Comandos de Emergencia

```bash
# Ver migraciones aplicadas
npx prisma migrate status

# Ver diferencias entre schema y BD
npx prisma db diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource

# Regenerar cliente sin migrar
npx prisma generate

# Push schema directamente (desarrollo)
npx prisma db push

# Introspect BD existente
npx prisma db pull
```

**Última actualización:** Diciembre 2024
**Versión:** 1.0
