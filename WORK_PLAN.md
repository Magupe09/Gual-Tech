# Plan de Trabajo - Javi Control

## 🎯 Objetivo del Proyecto
Construir una **SPA para gestionar 200 máquinas industriales** con trazabilidad de mantenimiento, usando **React + Supabase**, aprendiendo React de forma estructurada.

---

## 📅 Fases de Desarrollo

### Fase 1: Fundamentos (Sesión 1-2)
> **Objetivo:** Entender cómo funciona React por debajo

| # | Tarea | Descripción | Archivo Clave |
|---|-------|-------------|---------------|
| 1.1 | Entender el flujo de datos | Cómo fluye la info desde el HTML hasta Supabase | `src/main.tsx` → `App.tsx` → `pages/Login.tsx` |
| 1.2 | Entender el routing | Cómo React Router decide qué página mostrar | `src/App.tsx` (Routes) |
| 1.3 | Entender el state | Cómo React managea datos locales (useState, useEffect) | `src/pages/Dashboard.tsx` |
| 1.4 | Entender types | Cómo TypeScript ayuda a evitar errores | `src/types/index.ts` |

---

### Fase 2: Autenticación (Sesión 3)
> **Objetivo:** Login funcional con Supabase Auth

| # | Tarea | Descripción | Aprendiendo |
|---|-------|-------------|-------------|
| 2.1 | Configurar Supabase client | Conectar la app con la DB | `src/services/supabase.ts` |
| 2.2 | Crear login | Form que authentica contra Supabase | `src/pages/Login.tsx` |
| 2.3 | Proteger rutas | Solo usuarios logueados ven el dashboard | `src/App.tsx` (future: auth guard) |

---

### Fase 3: Gestión de Máquinas (Sesión 4-5)
> **Objetivo:** CRUD completo de máquinas

| # | Tarea | Descripción | Flujo |
|---|-------|-------------|-------|
| 3.1 | Dashboard - Listar | Traer todas las máquinas de Supabase | `useEffect` → `supabase.select()` → render |
| 3.2 | Dashboard - Buscar | Filtrar máquinas por reference | `filter()` en memoria vs query DB |
| 3.3 | Agregar Máquina | Form → Supabase insert | `src/pages/AddMachine.tsx` |
| 3.4 | Ver detalle | Una máquina específica + sus informes | `src/pages/MachineDetail.tsx` |

---

### Fase 4: Gestión de Informes (Sesión 6-7)
> **Objetivo:** Crear informes con fotos y PDF

| # | Tarea | Descripción | Aprendiendo |
|---|-------|-------------|-------------|
| 4.1 | Formulario de informe | Campos del modelo + submit | `src/pages/AddReport.tsx` |
| 4.2 | Subir fotos | Input file → compress → upload | `browser-image-compression` + Supabase Storage |
| 4.3 | Generar PDF | Crear PDF desde datos del form | `jspdf` |
| 4.4 | Guardado automático | Insert a DB + upload archivos | Transacciones implícitas |

---

### Fase 5: Mejoras y Polish (Sesión 8+)
> **Objetivo:** Mejoras visuales y UX

| # | Tarea | Descripción |
|---|-------|-------------|
| 5.1 | Validación de forms | Campos requeridos, tipos correctos |
| 5.2 | Loading states | Spinners mientras cargan datos |
| 5.3 | Manejo de errores | Try/catch, mensajes al usuario |
| 5.4 | Diseño responsive | Adaptar a móvil |

---

## 🔗 Conexión entre Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     src/main.tsx                            │
│                    (Entry Point)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       src/App.tsx                           │
│              (Routes: /, /dashboard, /machine/:id)          │
└──────┬──────────────────┬──────────────────┬───────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
│ Login.tsx   │   │Dashboard.tsx│   │MachineDetail.tsx│
│             │   │             │   │                 │
│• supabase   │   │• useState   │   │• fetch machine  │
│  .auth      │   │• useEffect  │   │• fetch reports  │
│             │   │• filter     │   │                 │
└─────────────┘   └──────┬──────┘   └────────┬────────┘
                         │                    │
                         ▼                    ▼
                  ┌─────────────┐    ┌─────────────────┐
                  │AddMachine.tsx    │AddReport.tsx    │
                  │             │    │                 │
                  │• form state│    │• form state     │
                  │• insert    │    │• jspdf          │
                  │  to DB     │    │• image compress │
                  └─────────────┘    │• upload photos  │
                                   │• insert to DB   │
                                   └─────────────────┘
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │  src/services/      │
                                   │  supabase.ts        │
                                   │                     │
                                   │• createClient       │
                                   │• tables: machines,  │
                                   │  reports            │
                                   │• buckets: photos,   │
                                   │  pdfs               │
                                   └─────────────────────┘
```

---

## 📚 Archivos Clave y Su Propósito

| Archivo | Propósito | Lo que enseña |
|---------|-----------|----------------|
| `src/main.tsx` | Punto de entrada, mount del DOM | Cómo React entra al HTML |
| `src/App.tsx` | Router principal | Cómo manejar páginas |
| `src/pages/Login.tsx` | Autenticación | Async/await, eventos |
| `src/pages/Dashboard.tsx` | Lista máquinas | useState, useEffect, render |
| `src/pages/AddMachine.tsx` | Crear registro | Formularios, validación |
| `src/pages/AddReport.tsx` | Informe completo | Archivos, PDF, múltiples uploads |
| `src/services/supabase.ts` | Cliente DB | Integración con API externa |
| `src/types/index.ts` | TypeScript types | Type safety |
| `src/styles/globals.css` | Tailwind + variables | Estilos globales |

---

## 🎓 Conceptos a Dominar (Learning Checklist)

- [ ] **JSX**: HTML dentro de JavaScript
- [ ] **useState**: Datos que cambian en un componente
- [ ] **useEffect**: Código que corre en momentos específicos
- [ ] **Props**: Pasar datos de padre a hijo
- [ ] **Event Handlers**: onClick, onSubmit, onChange
- [ ] **Async/Await**: Llamadas asíncronas
- [ ] **Conditional Rendering**: Mostrar cosas según estado
- [ ] **Lists/Keys**: Renderizar arrays
- [ ] **Forms**: Inputs controlados
- [ ] **TypeScript**: Tipado de datos

---

## 🚀 Próximo Paso Inmediato

1. **Abrir el proyecto en VS Code**
2. **Ejecutar** `npm run dev` 
3. **Entender** cómo se conecta `main.tsx` → `App.tsx` → `Login.tsx`
4. **Hacer cambios simples** (cambiar colores, textos) para ver cómo funciona

---

*Documento generado para control del proyecto Javi Control*
