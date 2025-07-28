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

## 💰 **House Expense Management (Gastos de Casa)**

### 1. Crear gasto de casa
```http
POST /expenses/house
```
**Body:**
```json
{
  "description": "Supermercado semanal",
  "amount": 15000,
  "date": "2025-01-15T10:00:00.000Z",
  "houseId": 1,
  "paidById": 1,
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

**⚠️ Nota:** Si no se especifica `expenseShares`, el gasto se divide automáticamente entre todos los miembros de la casa según su `payRatio`.

### 2. Obtener gasto de casa por ID
```http
GET /expenses/house/:id
```

**Respuesta:**
```json
{
  "id": 1,
  "description": "Supermercado semanal",
  "amount": 15000,
  "date": "2025-01-15T10:00:00.000Z",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": null,
  "paidById": 1,
  "houseId": 1,
  "expenseShares": [
    {
      "id": 1,
      "expenseId": 1,
      "roomieId": 1,
      "shareAmount": 7500
    },
    {
      "id": 2,
      "expenseId": 1,
      "roomieId": 2,
      "shareAmount": 7500
    }
  ]
}
```

### 3. Gastos por casa
```http
GET /expenses/house/by-house/:houseId
```

### 4. Gastos por casa con filtro de fechas
```http
GET /expenses/house/by-house/:houseId?startDate=2025-01-01&endDate=2025-01-31
```

### 5. Gastos por roomie
```http
GET /expenses/house/by-roomie/:roomieId
```
**Descripción:** Obtiene todos los gastos de casa en los que participa un roomie (como pagador o deudor).

### 6. Resumen de gastos por casa
```http
GET /expenses/house/summary/:houseId
```

**Respuesta:**
```json
[
  {
    "roomieId": 1,
    "totalPaid": 25000,
    "totalOwed": 15000,
    "balance": 10000,
    "expenseCount": 3
  },
  {
    "roomieId": 2,
    "totalPaid": 10000,
    "totalOwed": 15000,
    "balance": -5000,
    "expenseCount": 3
  }
]
```

### 7. Actualizar gasto de casa
```http
PUT /expenses/house/:id
```
**Body:**
```json
{
  "description": "Supermercado + farmacia",
  "amount": 18000,
  "date": "2025-01-15T10:00:00.000Z",
  "paidById": 1,
  "expenseShares": [
    {
      "roomieId": 1,
      "shareAmount": 9000
    },
    {
      "roomieId": 2,
      "shareAmount": 9000
    }
  ]
}
```

### 8. Eliminar gasto de casa
```http
DELETE /expenses/house/:id
```

---

## 💳 **Personal Expense Management (Gastos Personales)**

### 1. Crear gasto personal
```http
POST /expenses/personal
```
**Body:**
```json
{
  "description": "Almuerzo trabajo",
  "amount": 1200,
  "date": "2025-01-15T12:00:00.000Z"
}
```

**⚠️ Nota:** El `paidById` se asigna automáticamente al usuario autenticado.

### 2. Obtener mis gastos personales
```http
GET /expenses/personal
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "description": "Almuerzo trabajo",
    "amount": 1200,
    "date": "2025-01-15T12:00:00.000Z",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": null,
    "paidById": 1
  }
]
```

### 3. Obtener gasto personal por ID
```http
GET /expenses/personal/:id
```
**Descripción:** Solo retorna el gasto si pertenece al usuario autenticado.

### 4. Resumen de gastos personales
```http
GET /expenses/personal/summary
```

**Respuesta:**
```json
{
  "totalExpenses": 45600,
  "expenseCount": 12,
  "averageExpense": 3800
}
```

### 5. Gastos personales por rango de fechas
```http
GET /expenses/personal/date-range?startDate=2025-01-01&endDate=2025-01-31
```

### 6. Actualizar gasto personal
```http
PUT /expenses/personal/:id
```
**Body:**
```json
{
  "description": "Almuerzo + café",
  "amount": 1500,
  "date": "2025-01-15T12:00:00.000Z"
}
```

### 7. Eliminar gasto personal
```http
DELETE /expenses/personal/:id
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

# 3. Registrar gastos de casa (servicios compartidos como alquiler)
POST /expenses/house
{
  "description": "Alquiler + Expensas",
  "amount": 45000,
  "houseId": 1,
  "paidById": 1,
  "expenseShares": [{"roomieId": 1, "shareAmount": 45000}]
}

# 4. Registrar gastos personales
POST /expenses/personal
{
  "description": "Almuerzo trabajo",
  "amount": 1200,
  "date": "2025-01-15T12:00:00.000Z"
}

POST /expenses/personal
{
  "description": "Café + facturas",
  "amount": 800,
  "date": "2025-01-15T15:00:00.000Z"
}

# 5. Ver resumen financiero (casa)
GET /incomes/financial-summary/1?period=MONTHLY

# 6. Ver resumen gastos personales
GET /expenses/personal/summary

# Resultado esperado:
# - Casa: Ingresos altos, gastos fijos bajos, buen balance
# - Personal: Control detallado de gastos diarios
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

POST /invitations
{
  "inviteeEmail": "carlos@example.com",
  "houseId": 1
}

# 3. Configurar ratios de pago (después que acepten)
PUT /houses/1/pay-ratios
{
  "payRatios": [
    {"roomieId": 1, "payRatio": 0.5},
    {"roomieId": 2, "payRatio": 0.3},
    {"roomieId": 3, "payRatio": 0.2}
  ]
}

# 4. Registrar gastos compartidos
POST /expenses/house
{
  "description": "Supermercado familiar",
  "amount": 20000,
  "houseId": 1,
  "paidById": 1
  // Se divide automáticamente según payRatio
}

POST /expenses/house
{
  "description": "Servicios (luz, gas, internet)",
  "amount": 15000,
  "houseId": 1,
  "paidById": 2,
  "expenseShares": [
    {"roomieId": 1, "shareAmount": 7500},
    {"roomieId": 2, "shareAmount": 4500},
    {"roomieId": 3, "shareAmount": 3000}
  ]
}

# 5. Cada uno registra sus gastos personales
POST /expenses/personal
{
  "description": "Almuerzo trabajo",
  "amount": 1500
}

# 6. Ver balances y deudas
GET /settlements/balance/1

# 7. Realizar liquidación
POST /settlements
{
  "fromRoomieId": 3,
  "toRoomieId": 1,
  "amount": 5000,
  "houseId": 1,
  "description": "Pago parte supermercado y servicios"
}
```

### 📊 **Caso 3: Análisis Financiero Completo**

```bash
# 1. Resumen financiero de casa (mensual)
GET /incomes/financial-summary/1?period=MONTHLY

# 2. Resumen gastos personales individuales
GET /expenses/personal/summary

# 3. Análisis por período específico
GET /incomes/financial-summary/1?period=CUSTOM&startDate=2025-01-01&endDate=2025-03-31

# 4. Detalles de gastos de casa por fecha
GET /expenses/house/by-house/1?startDate=2025-01-01&endDate=2025-01-31

# 5. Gastos personales por fecha
GET /expenses/personal/date-range?startDate=2025-01-01&endDate=2025-01-31

# 6. Resumen de balances entre roomies
GET /settlements/balance/1

# 7. Historial de liquidaciones
GET /settlements/house/1
```

---

## 🎯 **DTOs y Modelos para Frontend**

### **House Expense DTOs**
```typescript
// Request DTOs
interface ExpenseCreateRequestDto {
  description?: string;
  amount: number;
  date: Date;
  paidById: number;
  houseId: number;
  expenseShares?: ExpenseShareDto[];
}

interface ExpenseUpdateRequestDto {
  description?: string;
  amount?: number;
  date?: Date;
  paidById?: number;
  expenseShares?: ExpenseShareDto[];
}

interface ExpenseShareDto {
  roomieId: number;
  shareAmount: number;
}

// Response DTOs
interface ExpenseWithSharesResponseDto {
  id: number;
  description?: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt?: Date;
  paidById: number;
  houseId: number;
  expenseShares: ExpenseShareResponseDto[];
}

interface ExpenseShareResponseDto {
  id: number;
  expenseId: number;
  roomieId: number;
  shareAmount: number;
}

interface ExpenseSummaryResponseDto {
  roomieId: number;
  totalPaid: number;
  totalOwed: number;
  balance: number;
  expenseCount: number;
}
```

### **Personal Expense DTOs**
```typescript
// Request DTOs
interface PersonalExpenseCreateRequestDto {
  description?: string;
  amount: number;
  date: Date;
  // paidById se asigna automáticamente
}

interface PersonalExpenseUpdateRequestDto {
  description?: string;
  amount?: number;
  date?: Date;
}

// Response DTOs
interface PersonalExpenseResponseDto {
  id: number;
  description?: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt?: Date;
  paidById: number;
}

interface PersonalExpenseSummaryResponseDto {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
}
```

### **Income DTOs**
```typescript
interface IncomeCreateRequestDto {
  description: string;
  amount: number;
  houseId?: number;
  isRecurring?: boolean;
  recurrenceFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  earnedAt?: Date;
}

interface IncomeResponseDto {
  id: number;
  description: string;
  amount: number;
  earnedById: number;
  houseId?: number;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  nextRecurrenceDate?: Date;
  earnedAt: Date;
  createdAt: Date;
}

interface FinancialSummaryResponseDto {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  periodType: string;
  startDate: Date;
  endDate: Date;
  topIncomeDescriptions: TopItemDto[];
  topExpenseDescriptions: TopItemDto[];
}

interface TopItemDto {
  description: string;
  amount: number;
}
```

### **Settlement DTOs**
```typescript
interface SettlementCreateRequestDto {
  fromRoomieId: number;
  toRoomieId: number;
  amount: number;
  houseId: number;
  description?: string;
}

interface SettlementResponseDto {
  id: number;
  fromRoomieId: number;
  toRoomieId: number;
  amount: number;
  houseId: number;
  description?: string;
  createdAt: Date;
}

interface BalanceResponseDto {
  houseId: number;
  balances: RoomieBalanceDto[];
}

interface RoomieBalanceDto {
  roomieId: number;
  roomieName: string;
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
}
```

### **House DTOs**
```typescript
interface HouseCreateRequestDto {
  name: string;
}

interface HouseResponseDto {
  id: number;
  name: string;
  createdAt: Date;
  members: HouseMemberDto[];
}

interface HouseMemberDto {
  id: number;
  firstName: string;
  lastName: string;
  payRatio: number;
}

interface PayRatioUpdateRequestDto {
  payRatios: PayRatioDto[];
}

interface PayRatioDto {
  roomieId: number;
  payRatio: number;
}
```

### **User DTOs**
```typescript
interface UserResponseDto {
  id: number;
  auth0Sub: string;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt: Date;
}

interface UserUpdateRequestDto {
  firstName?: string;
  lastName?: string;
}
```

### **Invitation DTOs**
```typescript
interface InvitationCreateRequestDto {
  inviteeEmail: string;
  houseId: number;
}

interface InvitationResponseDto {
  id: number;
  inviterRoomieId: number;
  inviteeEmail: string;
  houseId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: Date;
  respondedAt?: Date;
}

interface InvitationSummaryResponseDto {
  totalSent: number;
  totalReceived: number;
  pendingSent: number;
  pendingReceived: number;
  acceptedSent: number;
  acceptedReceived: number;
}
```

---

## 🔄 **REST Client Patterns**

### **Expense Service**
```typescript
class HouseExpenseService {
  async createHouseExpense(data: ExpenseCreateRequestDto): Promise<ExpenseWithSharesResponseDto>
  async getHouseExpenseById(id: number): Promise<ExpenseWithSharesResponseDto>
  async getHouseExpensesByHouse(houseId: number, startDate?: string, endDate?: string): Promise<ExpenseWithSharesResponseDto[]>
  async getHouseExpensesByRoomie(roomieId: number): Promise<ExpenseWithSharesResponseDto[]>
  async getHouseExpenseSummary(houseId: number): Promise<ExpenseSummaryResponseDto[]>
  async updateHouseExpense(id: number, data: ExpenseUpdateRequestDto): Promise<ExpenseWithSharesResponseDto>
  async deleteHouseExpense(id: number): Promise<void>
}

class PersonalExpenseService {
  async createPersonalExpense(data: PersonalExpenseCreateRequestDto): Promise<PersonalExpenseResponseDto>
  async getPersonalExpenses(): Promise<PersonalExpenseResponseDto[]>
  async getPersonalExpenseById(id: number): Promise<PersonalExpenseResponseDto>
  async getPersonalExpenseSummary(): Promise<PersonalExpenseSummaryResponseDto>
  async getPersonalExpensesByDateRange(startDate: string, endDate: string): Promise<PersonalExpenseResponseDto[]>
  async updatePersonalExpense(id: number, data: PersonalExpenseUpdateRequestDto): Promise<PersonalExpenseResponseDto>
  async deletePersonalExpense(id: number): Promise<void>
}
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

### 💰 **Control Financiero de Casa**
- `POST /expenses/house` - Crear gasto compartido
- `GET /expenses/house/by-house/:houseId` - Gastos de casa
- `GET /expenses/house/summary/:houseId` - Resumen gastos
- `GET /settlements/balance/:houseId` - Balances pendientes

### 💳 **Control Financiero Personal**
- `POST /expenses/personal` - Crear gasto personal
- `GET /expenses/personal` - Mis gastos personales
- `GET /expenses/personal/summary` - Resumen personal
- `GET /expenses/personal/date-range` - Gastos por fecha

### 💵 **Gestión de Ingresos**
- `POST /incomes` - Registrar ingreso
- `GET /incomes/my-incomes` - Mis ingresos
- `GET /incomes/financial-summary/:houseId` - **Resumen completo**
- `GET /incomes/house/:houseId` - Ingresos de casa

### 👥 **Colaboración**
- `POST /invitations` - Invitar usuario
- `GET /invitations/notifications` - Ver notificaciones
- `PUT /invitations/:id/accept` - Aceptar invitación

### 📊 **Reportes y Análisis**
- `GET /incomes/financial-summary/:houseId` - Resumen financiero
- `GET /expenses/house/summary/:houseId` - Resumen gastos casa
- `GET /expenses/personal/summary` - Resumen gastos personales
- `GET /settlements/balance/:houseId` - Balances entre roomies

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
2. Separación clara entre gastos de casa (fijos) y personales (variables)
3. Tracking de ingresos vs gastos total
4. Cálculo automático de tasa de ahorro
5. Identificación de patrones de gasto

### ✅ **Para Casa Compartida (Shared House)**
1. Gestión de gastos compartidos con división automática o manual
2. Gastos personales privados de cada roomie
3. División proporcional según payRatio
4. Tracking de deudas entre roomies
5. Sistema de liquidaciones integrado
6. Invitaciones y gestión de miembros

### ✅ **Para Análisis Financiero**
1. Reportes por período (mensual, trimestral, anual)
2. Comparación ingresos vs gastos (casa + personal)
3. Top categorías de gastos e ingresos
4. Tendencias financieras
5. Balances y liquidaciones pendientes

### ✅ **Diferencias Clave: Casa vs Personal**

#### **Gastos de Casa (`/expenses/house`)**
- Requieren `houseId`
- Soportan `expenseShares` (división entre roomies)
- Se sincronizan automáticamente con finanzas personales del pagador
- Validaciones de membresía de casa
- División automática según `payRatio` si no se especifican shares
- Visibles para todos los miembros de la casa

#### **Gastos Personales (`/expenses/personal`)**
- No tienen `houseId`
- No soportan `expenseShares`
- Son directamente gastos personales (no requieren sincronización)
- Solo el propietario puede ver/modificar sus gastos personales
- Más simples y directos
- Privados por usuario

---

## 🔗 **Flujo de Sincronización Financiera**

### **Gastos de Casa → Finanzas Personales**
Cuando se crea un gasto de casa, automáticamente:
1. Se crea un gasto personal para quien pagó (`paidById`)
2. Se registra con `description: "Group expense: [descripción original]"`
3. Se mantiene sincronizado para análisis financiero personal

### **Settlements → Finanzas Personales**
Cuando se crea un settlement:
1. Se crea un gasto personal para quien paga (`fromRoomieId`)
2. Se crea un ingreso personal para quien recibe (`toRoomieId`)
3. Ambos se marcan como transacciones de settlement

---

¡API completa, actualizada y lista para implementación frontend! 🚀

**Cambios Principales vs Versión Anterior:**
- ✅ Separación completa de gastos de casa y personales
- ✅ DTOs específicos para cada tipo de gasto
- ✅ Endpoints más claros y semánticamente correctos
- ✅ Mejor seguridad (gastos personales privados)
- ✅ Sincronización automática entre tipos de gastos
- ✅ Documentación completa para desarrollo frontend
