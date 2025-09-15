
# **Resumen General del Proyecto Lawyer (con Prisma + Supabase)**

## **1. Descripción General**

**Lawyer** es una plataforma web **Full Stack Serverless** que combina **inteligencia artificial aplicada al ámbito legal** con la interacción en tiempo real entre usuarios y abogados.  
Su propósito es brindar un servicio **seguro, confiable y escalable**, donde los usuarios puedan acceder a un agente legal de IA y, cuando lo requieran, interactuar con abogados humanos certificados.

El sistema integra un modelo de **licencias temporales por horas**, pagos electrónicos a través de **Wompi**, gestión granular de roles, y una infraestructura **moderna con Prisma como ORM** y **Supabase (PostgreSQL) como base de datos**.

---

## **2. Roles y Permisos**

Se implementan **cuatro roles principales**, con jerarquía y permisos administrables dinámicamente:

- **SuperAdmin**
    
    - Autoridad máxima en el sistema.
        
    - Puede crear, modificar y revocar administradores.
        
    - Control sobre los permisos asignados a cada rol.
        
    - Acceso a todas las métricas, reportes y gestión global.
        
- **Admin**
    
    - Permisos amplios en gestión de usuarios, abogados, licencias y reportes.
        
    - No puede revocar otros administradores.
        
    - Puede intervenir directamente en conversaciones en curso.
        
- **Abogado**
    
    - Acceso al chat de usuarios.
        
    - Puede responder consultas, subir documentos para verificación, recibir calificaciones y manejar un estado (activo/inactivo).
        
    - Sus datos adicionales son opcionales: especialidad, experiencia, certificaciones y documentos adjuntos.
        
- **Usuario**
    
    - Acceso básico al **chat de IA legal**.
        
    - Puede iniciar un **trial** con tiempo limitado.
        
    - Al expirar el trial, debe adquirir una licencia activa mediante pago.
        
    - Acceso al chat con abogados solo con licencia válida.
        

---

## **3. Licencias y Control de Acceso**

El modelo de negocio gira en torno a **licencias temporales basadas en horas de consumo**, que habilitan acceso a:

- Chat con IA legal.
    
- Chat con abogados.
    
- O ambos, dependiendo del plan adquirido.
    

### Características clave:

- **Trial inicial** con límite de horas para nuevos usuarios.
    
- **Licencias de pago** con horas definidas y plazo máximo de consumo.
    
- **Expiración automática** al agotar horas o cumplirse el plazo.
    
- Solo puede existir **una licencia activa por usuario**.
    
- Registro del **saldo de horas restantes** para control en tiempo real.
    

---

## **4. Pasarela de Pago (Wompi)**

La plataforma se integra con **Wompi**, pasarela de pagos en **COP**.

### Funcionalidades:

- Gestión dinámica de precios.
    
- Soporte para **cupones y descuentos**.
    
- Registro de **facturas** y métodos de pago usados.
    
- Métricas de conversión de trial → pago.
    
- Historial de transacciones visible solo para administradores.
    

---

## **5. Chat y Comunicación**

El chat es el corazón de la plataforma, combinando **IA + interacción con abogados**.

### Características principales:

- **Acceso solo con licencia activa o trial.**
    
- **Mensajes por turnos tradicionales.**
    
- Estados de mensajes: enviado, leído, moderado.
    
- **Moderación automática** para filtrar lenguaje indebido y datos sensibles.
    
- **Resúmenes y metadatos** almacenados en lugar de mensajes completos (para privacidad).
    
- **Participación multiusuario**:
    
    - Usuario ↔ Abogado.
        
    - Usuario ↔ IA.
        
    - Admin puede intervenir en cualquier conversación.
        
- **No se permiten mensajes anónimos.**
    
- **No incluye llamadas ni videollamadas.**
    

---

## **6. Seguridad**

La seguridad es prioritaria, considerando la sensibilidad de los datos legales.

### Implementaciones:

- Autenticación básica: correo y contraseña.
    
- Registro de **intentos fallidos de login** y **bloqueo automático** tras múltiples intentos.
    
- **Logs de actividad** para auditoría y estadísticas.
    
- **Consentimientos obligatorios**: términos, políticas y versiones aceptadas.
    
- Estados en usuarios y abogados: activo, inactivo, suspendido, bloqueado.
    
- **Permisos dinámicos** gestionados por SuperAdmin.
    

---

## **7. Estadísticas y Reportes**

El sistema genera métricas en tiempo real, exportables y accesibles a nivel administrativo.

### Métricas contempladas:

- **Usuarios**: registros, retención, uso de trial, conversiones.
    
- **Abogados**: actividad en chat, calificaciones, documentos.
    
- **Ventas**: ingresos, métodos de pago, volumen mensual.
    
- **Conversiones**: trial → pago.
    

### Reportes:

- Exportación en CSV y PDF.
    
- Dashboards interactivos para análisis rápido.
    

---

## **8. Base de Datos (Supabase + Prisma + PostgreSQL)**

La plataforma se soporta en **Supabase (PostgreSQL)**, pero gestionada con **Prisma ORM**.

- Prisma actúa como **capa de acceso a datos tipada** en TypeScript.
    
- **Migraciones versionadas** con `prisma migrate`.
    
- **Prisma Studio** como panel de administración gratuito.
    

### Diseño:

- **Usuarios** con avatar, estado y perfil básico.
    
- **Roles dinámicos** con permisos configurables.
    
- **Abogados** con datos opcionales y documentos verificados.
    
- **Licencias** con saldo de horas, expiración y tipo.
    
- **Pagos** con facturas, descuentos y cupones.
    
- **Chats** con resúmenes y estados de mensajes.
    
- **Seguridad**: intentos de login, logs y consentimientos.
    
- **Estadísticas** listas para dashboards.
    

---

## **9. Stack Tecnológico**

- **Frontend:**
    
    - Remix (SSR + React).
        
    - TailwindCSS (UI rápida y responsiva).
        
    - Framer Motion (animaciones).
        
- **Backend Serverless:**
    
    - Prisma (ORM, modelo de datos, migraciones).
        
    - Supabase (Postgres, auth, storage).
        
    - Edge Functions para validaciones críticas (pagos, licencias).
        
- **Infraestructura:**
    
    - 100% serverless para escalabilidad automática.
        
    - Integración directa con Wompi.
        
    - Encriptación de datos sensibles en reposo y tránsito.
        

---

## **10. Proyección y Alcance**

- **MVP inicial:**
    
    - Roles, autenticación, licencias, integración con Wompi, chat IA + abogados, métricas básicas.
        
- **Escalabilidad futura:**
    
    - Nuevas pasarelas de pago internacionales.
        
    - IA especializada por rama legal (laboral, penal, civil, etc.).
        
    - Blockchain para trazabilidad de documentos legales.
        

---

## **Conclusión**

**Lawyer** es una plataforma disruptiva que mezcla la **eficiencia de la IA legal** con la **autoridad de abogados humanos**, en un entorno seguro y escalable.

El uso de **Prisma + Supabase** garantiza un modelo de datos sólido, flexible y versionado, con **tipado estricto en el código y migraciones confiables**.  
El diseño considera **seguridad avanzada, monetización clara, control de roles, métricas en tiempo real y una arquitectura moderna serverless**, lo que posiciona a Lawyer como una solución preparada para crecer en el mercado legal digital.