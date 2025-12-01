#!/bin/bash

echo "🚀 Iniciando migración del sistema avanzado de IA Legal..."

# Generar cliente de Prisma con nuevas tablas
echo "📦 Generando cliente de Prisma..."
npx prisma generate

# Crear migración
echo "🔄 Creando migración de base de datos..."
npx prisma migrate dev --name add_advanced_legal_ai_system

# Verificar migración
echo "✅ Verificando migración..."
npx prisma migrate status

echo "🎉 Migración completada exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Visita /admin/ia para inicializar el conocimiento legal base"
echo "2. Configura el modelo de IA activo (Gemini por defecto)"
echo "3. Comienza a agregar áreas, normas y conceptos jurídicos"
