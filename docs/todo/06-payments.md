# 💳 FASE 6: Pagos y Facturación

## 🎯 Objetivo
Integrar Wompi para compra de licencias, gestión de facturas y control de descuentos.

## ✅ Criterios de Éxito
- [ ] Compra de licencias funcional con Wompi
- [ ] Generación automática de facturas
- [ ] Sistema de cupones y descuentos
- [ ] Historial de transacciones completo
- [ ] Métricas de conversión trial → pago

## 📝 Tareas Específicas

### 6.1 Configuración de Wompi
- [ ] Setup de API keys y webhooks
- [ ] Configuración de métodos de pago (tarjeta, PSE, Nequi)
- [ ] Testing en ambiente sandbox
- [ ] Manejo de respuestas y errores

### 6.2 Flujo de Compra
- [ ] Catálogo de licencias con precios
- [ ] Carrito de compra (una licencia a la vez)
- [ ] Formulario de pago integrado
- [ ] Confirmación y redirección post-pago

### 6.3 Sistema de Facturas
- [ ] Generación automática tras pago exitoso
- [ ] Datos fiscales del usuario (RUT, razón social)
- [ ] PDF de factura descargable
- [ ] Envío automático por email

### 6.4 Cupones y Descuentos
- [ ] Creación de códigos de descuento
- [ ] Validación de vigencia y uso
- [ ] Aplicación de descuentos porcentuales/fijos
- [ ] Límites de uso por cupón

### 6.5 Gestión de Transacciones
- [ ] Webhooks para confirmación de pago
- [ ] Estados de transacción (pending/completed/failed)
- [ ] Reintento automático para pagos fallidos
- [ ] Reembolsos y cancelaciones

## 🔧 Archivos a Crear/Modificar

```
lib/
  ├── payments/
  │   ├── wompi.server.ts       [NUEVO]
  │   ├── invoices.server.ts    [NUEVO]
  │   ├── discounts.server.ts   [NUEVO]
  │   └── webhooks.server.ts    [NUEVO]
  └── pdf/
      └── invoice-generator.ts  [NUEVO]

app/
  ├── components/
  │   ├── Payment/
  │   │   ├── LicenseSelector.tsx [NUEVO]
  │   │   ├── PaymentForm.tsx     [NUEVO]
  │   │   ├── CouponInput.tsx     [NUEVO]
  │   │   └── PaymentStatus.tsx   [NUEVO]
  │   └── InvoiceDownload.tsx     [NUEVO]
  ├── routes/
  │   ├── comprar.tsx             [NUEVO]
  │   ├── pago/
  │   │   ├── exito.tsx          [NUEVO]
  │   │   └── error.tsx          [NUEVO]
  │   ├── factura.$id.tsx        [NUEVO]
  │   └── api/
  │       ├── payments/
  │       │   ├── create.ts      [NUEVO]
  │       │   └── webhook.ts     [NUEVO]
  │       └── invoices/
  │           └── generate.ts    [NUEVO]
  └── styles/
      └── payment.css            [NUEVO]
```

## 🧪 Criterios de Prueba
1. **Pago**: Compra debe activar licencia automáticamente
2. **Webhooks**: Confirmación de Wompi debe actualizar estado
3. **Facturas**: PDF debe generarse con datos correctos
4. **Cupones**: Descuentos deben aplicarse correctamente
5. **Errores**: Pagos fallidos no deben activar licencias

## ⚠️ Notas Importantes
- **Sandbox first** - no usar producción hasta testing completo
- Validar todos los webhooks con firma de Wompi
- Manejar concurrencia en activación de licencias
- Logs detallados para transacciones (sin datos sensibles)

## 💡 Flujo de Pago
```
Usuario sin licencia → Ver catálogo → Seleccionar plan
→ Aplicar cupón (opcional) → Pago con Wompi
→ Webhook confirmación → Activar licencia → Factura PDF
```

## 💰 Planes de Licencias Sugeridos
```
Trial: Gratis, 2 horas, 7 días
Básico: $50,000 COP, 10 horas, 30 días
Estándar: $120,000 COP, 25 horas, 60 días
Premium: $200,000 COP, 50 horas, 90 días
```

## 🧾 Estructura de Factura
- Datos del usuario/empresa
- Detalle de licencia comprada
- Subtotal, descuentos, impuestos
- Total en COP
- Método de pago usado
- Fecha y número de transacción

## 🔄 Siguiente Fase
Una vez completada esta fase → **Fase 7: Seguridad y Moderación**