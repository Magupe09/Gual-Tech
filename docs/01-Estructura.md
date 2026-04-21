# 1.1 - Estructura del Proyecto

## Objetivo
Ver qué archivos existen en Javi Control y para qué sirve cada uno. Sin teoría compleja — solo saber dónde está cada cosa.

---

## Vista rápida de carpetas

```
javi-control/
├── src/                          ← Acá está todo el código
│   ├── pages/                    ← Las pantallas de la app
│   ├── components/               ← Piezas reutilizables
│   ├── services/                ← Conexión con servicios externos
│   ├── types/                   ← Definiciones de TypeScript
│   ├── styles/                  ← Estilos globales
│   ├── assets/                  ← Imágenes, iconos, etc.
│   ├── main.tsx                 ← Punto de entrada
│   └── App.tsx                  ← Configuración de rutas
├── public/                       ← Archivos públicos (imágenes)
├── docs/                        ← Esta documentación
├── package.json                 ← Dependencias del proyecto
├── vite.config.ts               ← Configuración de Vite
└── tailwind.config.js           ← Configuración de Tailwind
```

---

## src/ — Aquí pasa la magia

### pages/ — Las pantallas

Cada archivo es una **pantalla** completa de la app:

| Archivo | ¿Qué hace? |
|---------|------------|
| `Login.tsx` | Pantalla de inicio de sesión |
| `Dashboard.tsx` | Panel principal donde ves las máquinas |
| `MachineDetail.tsx` | Detalle de una máquina específica |
| `AddMachine.tsx` | Formulario para agregar una máquina nueva |
| `AddReport.tsx` | Formulario para agregar un reporte |

**Documentación detallada:**

- [[1a-Login]] — Análisis completo de la página de login
- [[2b-Dashboard]] — Análisis completo del dashboard
- [[2c-MachineDetail]] — Análisis completo del detalle de máquina
- [[2d-AddMachine]] — Análisis completo del formulario de agregar máquina
- [[2e-AddReport]] — Análisis completo del formulario de agregar informe

---

### components/ — Pieces reusable

Son pedazos de código que se pueden usar en varias páginas:

| Archivo | ¿Qué hace? |
|---------|------------|
| `Layout.tsx` | El marco común de la app (menú, header) |

**Nota:** Por ahora hay solo uno, pero en apps grandes hay muchos más (botones, cards, etc.).

---

### services/ — Conexión con el exterior

Archivos que se conectan con servicios externos:

| Archivo | ¿Qué hace? |
|---------|------------|
| `supabase.ts` | Configuración para conectar con la base de datos |
| `demoData.ts` | Datos de prueba (para desarrollo sin backend) |

**Ejemplo:** Cuando necesitás traer datos de Supabase, usás lo que está en `supabase.ts`.

---

### types/ — Definiciones de datos

Acá se define qué forma tienen los datos:

| Archivo | ¿Qué hace? |
|---------|------------|
| `index.ts` | Define los tipos (Machine, Report, User, etc.) |
| `assets.d.ts` | Declara tipos para imágenes |

**Ejemplo:** Si querés saber qué campos tiene una "Machine", mirás `index.ts`.

---

### styles/ — Estilos

| Archivo | ¿Qué hace? |
|---------|------------|
| `globals.css` | Estilos globales + configuración de Tailwind |

---

### assets/ — Recursos estáticos

Imágenes y archivos que no cambian:

| Contenido | ¿Qué es? |
|-----------|----------|
| `logojavi.PNG` | Logo de la app |

---

## Archivos importantes del raíz

### main.tsx — El punto de entrada

Es lo primero que se ejecuta cuando iniciás la app:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**Lo que hace:**
1. Busca el elemento con id="root" en el HTML
2. Renderiza el componente `App` dentro de ese elemento
3. Envuelve todo con `BrowserRouter` (para poder usar rutas)

---

### App.tsx — Las rutas

Acá se define qué página se muestra según la URL:

```tsx
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MachineDetail from './pages/MachineDetail'
import AddMachine from './pages/AddMachine'
import AddReport from './pages/AddReport'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/machine/:id" element={<Layout><MachineDetail /></Layout>} />
      <Route path="/add-machine" element={<Layout><AddMachine /></Layout>} />
      <Route path="/machine/:id/add-report" element={<Layout><AddReport /></Layout>} />
    </Routes>
  )
}

export default App
```

**Lo que hace:**
- Si vas a `/`, muestra `Login`
- Si vas a `/dashboard`, muestra `Dashboard` dentro del `Layout`
- Si vas a `/machine/123`, muestra el detalle de la máquina con id 123
- Etc.

---

## package.json — Las dependencias

Acá están las librerías que usa el proyecto. Las más importantes:

| Librería | Para qué |
|----------|----------|
| `react` | Framework principal |
| `react-router-dom` | Manejo de rutas |
| `zustand` | Manejo de estado global |
| `@supabase/supabase-js` | Conexión con Supabase |
| `tailwindcss` | Estilos |
| `vite` | Servidor de desarrollo |

---

## ¿Cómo seguir?

Ahora que sabés dónde está cada cosa, vamos a lo concreto:

1. **Primero:** Vamos a abrir `Login.tsx` y ver qué hace cada línea
2. **Segundo:** Vamos a entender qué pasa cuando hacés click en "Iniciar Sesión"
3. **Tercero:** Vamos a ver cómo se conecta con Supabase

→ [Siguiente: Entendiendo Login.tsx](./1.2-login-code.md)
