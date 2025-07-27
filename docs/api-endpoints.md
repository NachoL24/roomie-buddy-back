# Roomie Buddy API - Documentación Completa de Endpoints

## 🔐 Autenticación
Todos los endpoints requieren autenticación JWT, excepto donde se indique lo contrario.

**Headers requeridos:**
```bash
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 📂 Estructura de la API

### Base URL
```
http://localhost:3000
```

---

## 🏠 **House Management (Casas)**

### 1. Obtener casa por ID
```http
GET /houses/:id
```
**Descripción:** Obtiene los detalles de una casa específica con sus miembros.

**Respuesta:**
```json
{
  "id": 1,
  "name": "Casa Familiar",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "members": [
    {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez",
      "payRatio": 0.6
    }
  ]
}
```

### 2. Obtener casas por roomie
```http
GET /houses/roomie/:roomieId
```
**Descripción:** Lista todas las casas donde el roomie es miembro.

### 3. Crear nueva casa
```http
POST /houses
```
**Body:**
```json
{
  "name": "Mi Casa Nueva"
}
```

### 4. Actualizar ratios de pago
```http
PUT /houses/:houseId/pay-ratios
```
**Body:**
```json
{
  "payRatios": [
    {
      "roomieId": 1,
      "payRatio": 0.6
    },
    {
      "roomieId": 2,
      "payRatio": 0.4
    }
  ]
}
```

### 5. Actualizar nombre de casa
```http
PUT /houses/:houseId/name
```
**Body:**
```json
{
  "name": "Nuevo Nombre Casa"
}
```

### 6. Salir de una casa
```http
DELETE /houses/:houseId/leave
```

### 7. Remover miembro de casa
```http
DELETE /houses/:houseId/members/:roomieId
```

### 8. Eliminar casa
```http
DELETE /houses/:id
```

---

## 👤 **User Management (Usuarios)**

### 1. Obtener o crear usuario
```http
GET /user
```
**Descripción:** Obtiene el usuario actual o lo crea si no existe.

**Respuesta:**
```json
{
  "id": 1,
  "auth0Sub": "auth0|123456789",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

### 2. Actualizar usuario
```http
PUT /user/:id
```
**Body:**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García"
}
```

### 3. Obtener metadata de usuario (Auth0)
```http
GET /user-metadata
```
**Descripción:** Obtiene metadata del usuario desde Auth0.

---

## 📧 **Invitation Management (Invitaciones)**

### 1. Crear invitación
```http
POST /invitations
```
**Body:**
```json
{
  "inviteeEmail": "amigo@example.com",
  "houseId": 1
}
```

### 2. Aceptar invitación
```http
PUT /invitations/:id/accept
```

### 3. Rechazar invitación
```http
PUT /invitations/:id/decline
```

### 4. Cancelar invitación
```http
PUT /invitations/:id/cancel
```

### 5. Mis invitaciones
```http
GET /invitations/my-invitations
```

### 6. Invitaciones enviadas
```http
GET /invitations/my-invitations/sent
```

### 7. Invitaciones recibidas
```http
GET /invitations/my-invitations/received
```

### 8. Resumen de invitaciones
```http
GET /invitations/my-invitations/summary
```
**Respuesta:**
```json
{
  "totalSent": 3,
  "totalReceived": 2,
  "pendingSent": 1,
  "pendingReceived": 1,
  "acceptedSent": 2,
  "acceptedReceived": 1
}
```

### 9. Notificaciones de invitaciones
```http
GET /invitations/notifications
```
**Descripción:** Obtiene invitaciones pendientes para mostrar como notificaciones.

### 10. Invitaciones por casa
```http
GET /invitations/house/:houseId
```

### 11. Invitaciones por usuario (Admin)
```http
GET /invitations/user/:userId
GET /invitations/user/:userId/pending
```

---

## 💰 **Expense Management (Gastos)**

### 1. Crear gasto
```http
POST /expenses
```
**Body:**
```json
{
  "description": "Supermercado semanal",
  "amount": 15000,
  "houseId": 1,
  "paidByRoomieId": 1,
  "expenseShares": [
    {
      "roomieId": 1,
      "shareAmount": 7500
    },
    {
      "roomieId": 2,
      "shareAmount": 7500
    }
  ]
}
```

### 2. Obtener gasto por ID
```http
GET /expenses/:id
```

### 3. Gastos por casa
```http
GET /expenses/house/:houseId
```

### 4. Gastos por casa con filtro de fechas
```http
GET /expenses/house/:houseId?startDate=2025-01-01&endDate=2025-01-31
```

### 5. Gastos por roomie
```http
GET /expenses/roomie/:roomieId
```

### 6. Resumen de gastos por casa
```http
GET /expenses/house/:houseId/summary
```

### 7. Actualizar gasto
```http
PUT /expenses/:id
```

### 8. Eliminar gasto
```http
DELETE /expenses/:id
```

---

## 💵 **Income Management (Ingresos)**

### 1. Crear ingreso
```http
POST /incomes
```
**Body:**
```json
{
  "description": "Sueldo Software Developer - Enero 2025",
  "amount": 150000,
  "houseId": 1,
  "isRecurring": true,
  "recurrenceFrequency": "MONTHLY",
  "earnedAt": "2025-01-15T00:00:00.000Z"
}
```

**Frecuencias disponibles:**
- `WEEKLY`: Semanal
- `BIWEEKLY`: Quincenal
- `MONTHLY`: Mensual
- `QUARTERLY`: Trimestral
- `YEARLY`: Anual

### 2. Ingresos por casa
```http
GET /incomes/house/:houseId
```

### 3. Ingresos por casa con filtro de fechas
```http
GET /incomes/house/:houseId/date-range?startDate=2025-01-01&endDate=2025-01-31
```

### 4. Mis ingresos
```http
GET /incomes/my-incomes
```

### 5. 📊 **Resumen Financiero (★ Endpoint Principal)**
```http
GET /incomes/financial-summary/:houseId?period=MONTHLY&startDate=...&endDate=...
```

**Parámetros:**
- `period`: `MONTHLY` | `QUARTERLY` | `YEARLY` | `CUSTOM`
- `startDate`: Para período personalizado (formato: YYYY-MM-DD)
- `endDate`: Para período personalizado (formato: YYYY-MM-DD)

**Respuesta:**
```json
{
  "totalIncome": 275000,
  "totalExpenses": 85000,
  "netBalance": 190000,
  "savingsRate": 69.09,
  "periodType": "MONTHLY",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "topIncomeDescriptions": [
    {
      "description": "Sueldo Software Developer - Enero 2025",
      "amount": 150000
    },
    {
      "description": "Venta MacBook Pro 2019",
      "amount": 80000
    },
    {
      "description": "Proyecto web cliente XYZ - Landing Page",
      "amount": 45000
    }
  ],
  "topExpenseDescriptions": [
    {
      "description": "Supermercado semanal",
      "amount": 35000
    },
    {
      "description": "Luz + Gas + Internet",
      "amount": 25000
    },
    {
      "description": "Transporte público",
      "amount": 25000
    }
  ]
}
```

### 6. Actualizar ingreso
```http
PUT /incomes/:id
```

### 7. Eliminar ingreso
```http
DELETE /incomes/:id
```

---

## 🧾 **Settlement Management (Liquidaciones)**

### 1. Crear liquidación/pago
```http
POST /settlements
```
**Body:**
```json
{
  "fromRoomieId": 2,
  "toRoomieId": 1,
  "amount": 5000,
  "houseId": 1,
  "description": "Pago parte supermercado"
}
```

### 2. Liquidaciones por casa
```http
GET /settlements/house/:houseId
```

### 3. Resumen de balances
```http
GET /settlements/balance/:houseId
```
**Descripción:** Muestra cuánto debe/le deben a cada roomie.

**Respuesta:**
```json
{
  "houseId": 1,
  "balances": [
    {
      "roomieId": 1,
      "roomieName": "Juan",
      "totalOwed": 5000,
      "totalOwing": 0,
      "netBalance": 5000
    },
    {
      "roomieId": 2,
      "roomieName": "María",
      "totalOwed": 0,
      "totalOwing": 5000,
      "netBalance": -5000
    }
  ]
}
```

---

## 🔧 **System Endpoints**

### 1. Health Check
```http
GET /
```
**Descripción:** Endpoint público para verificar que la API está funcionando.

**Respuesta:**
```json
{
  "message": "Hello World!"
}
```

---

## 📋 **Ejemplos de Uso Completos**

### 🏡 **Caso 1: Usuario Solo - Control Financiero Personal**

```bash
# 1. Crear casa personal
POST /houses
{
  "name": "Mi Departamento"
}

# 2. Registrar ingresos del mes
POST /incomes
{
  "description": "Sueldo Full Stack Developer - Enero 2025",
  "amount": 150000,
  "houseId": 1,
  "isRecurring": true,
  "recurrenceFrequency": "MONTHLY"
}

POST /incomes
{
  "description": "Freelance - Landing Page Cliente ABC",
  "amount": 75000,
  "houseId": 1
}

# 3. Registrar gastos del mes
POST /expenses
{
  "description": "Supermercado + Almacén",
  "amount": 35000,
  "houseId": 1,
  "paidByRoomieId": 1,
  "expenseShares": [{"roomieId": 1, "shareAmount": 35000}]
}

POST /expenses
{
  "description": "Luz + Gas + Internet",
  "amount": 25000,
  "houseId": 1,
  "paidByRoomieId": 1,
  "expenseShares": [{"roomieId": 1, "shareAmount": 25000}]
}

# 4. Ver resumen financiero
GET /incomes/financial-summary/1?period=MONTHLY

# Resultado:
{
  "totalIncome": 225000,
  "totalExpenses": 60000,
  "netBalance": 165000,
  "savingsRate": 73.33
}
```

### 👥 **Caso 2: Casa Compartida - Gestión Grupal**

```bash
# 1. Crear casa compartida
POST /houses
{
  "name": "Casa Los Amigos"
}

# 2. Invitar roomies
POST /invitations
{
  "inviteeEmail": "maria@example.com",
  "houseId": 1
}

# 3. Configurar ratios de pago (después que acepten)
PUT /houses/1/pay-ratios
{
  "payRatios": [
    {"roomieId": 1, "payRatio": 0.6},
    {"roomieId": 2, "payRatio": 0.4}
  ]
}

# 4. Registrar gasto compartido
POST /expenses
{
  "description": "Supermercado familiar",
  "amount": 20000,
  "houseId": 1,
  "paidByRoomieId": 1,
  "expenseShares": [
    {"roomieId": 1, "shareAmount": 12000},
    {"roomieId": 2, "shareAmount": 8000}
  ]
}

# 5. Ver quién debe a quién
GET /settlements/balance/1
```

### 📊 **Caso 3: Análisis Financiero Avanzado**

```bash
# Resumen mensual
GET /incomes/financial-summary/1?period=MONTHLY

# Resumen trimestral  
GET /incomes/financial-summary/1?period=QUARTERLY

# Período personalizado
GET /incomes/financial-summary/1?period=CUSTOM&startDate=2025-01-01&endDate=2025-03-31

# Gastos detallados por fecha
GET /expenses/house/1?startDate=2025-01-01&endDate=2025-01-31

# Ingresos detallados por fecha
GET /incomes/house/1/date-range?startDate=2025-01-01&endDate=2025-01-31
```

---

## 🚨 **Códigos de Error Comunes**

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Profile not completed"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number",
    "description should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## 🎯 **Endpoints por Funcionalidad**

### 🏠 **Gestión de Casa**
- `GET /houses/:id` - Detalles de casa
- `POST /houses` - Crear casa
- `PUT /houses/:id/name` - Cambiar nombre
- `PUT /houses/:id/pay-ratios` - Actualizar ratios
- `DELETE /houses/:id/leave` - Salir de casa

### 💰 **Control Financiero**
- `POST /incomes` - Registrar ingreso
- `POST /expenses` - Registrar gasto
- `GET /incomes/financial-summary/:houseId` - **Resumen completo**
- `GET /settlements/balance/:houseId` - Balances pendientes

### 👥 **Colaboración**
- `POST /invitations` - Invitar usuario
- `GET /invitations/notifications` - Ver notificaciones
- `PUT /invitations/:id/accept` - Aceptar invitación

### 📊 **Reportes y Análisis**
- `GET /incomes/financial-summary/:houseId` - Resumen financiero
- `GET /expenses/house/:houseId/summary` - Resumen gastos
- `GET /incomes/house/:houseId/date-range` - Ingresos por fecha
- `GET /expenses/house/:houseId?startDate=...` - Gastos por fecha

---

## 🛠️ **Configuración de Desarrollo**

### Variables de Entorno (.env)
```bash
AUTH0_DOMAIN=tu.domain
AUTH0_AUDIENCE=tu.audience
PORT=puerto
DB_HOST=dbhost
DB_USER=usuario
DB_PASS=constraseña
DB_NAME=dbname
DB_PORT=dbport
```

### Iniciar Servidor
```bash
npm run start:dev
```

### Base URL Local
```
http://localhost:puerto
```

---

## 📱 **Casos de Uso Principales**

### ✅ **Para Usuario Solo (Single House)**
1. Control financiero personal completo
2. Tracking de ingresos vs gastos
3. Cálculo automático de tasa de ahorro
4. Identificación de patrones de gasto

### ✅ **Para Casa Compartida (Shared House)**
1. Gestión de gastos compartidos
2. División proporcional de gastos
3. Tracking de deudas entre roomies
4. Sistema de invitaciones

### ✅ **Para Análisis Financiero**
1. Reportes por período (mensual, trimestral, anual)
2. Comparación ingresos vs gastos
3. Top categorías de gastos e ingresos
4. Tendencias financieras

---

¡API completa y lista para usar! 🚀
