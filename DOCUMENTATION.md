# Javi Control - Proyecto de Gestión de Máquinas Industriales

## 📋 Documentación del Proyecto

### 1. Información General

**Nombre del Proyecto:** Javi Control  
**Tipo:** Single Page Application (SPA)  
**Stack:** React + Vite + Supabase  
**Propósito:** Gestionar información y trazabilidad de actualizaciones de 200 máquinas industriales

---

### 2. Requerimientos del MVP

### 2.1 Gestión de Máquinas
- [x] Agregar máquina con todos los campos
- [x] Listar todas las máquinas
- [x] Filtrar/Buscar por reference, serial o nombre
- [x] Ver detalle de máquina

### 2.2 Gestión de Informes
- [x] Crear informe con todos los campos
- [x] Subir fotos con optimización automática
- [x] Generar y descargar PDF
- [x] Guardado automático a DB
- [x] Ver historial de informes (inmutable)

---

### 3. Modelo de Datos

### Tabla: machines
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK auto-generado |
| reference | string | Código único |
| serial_number | string | Número de serie |
| name | string | Nombre descriptivo |
| brand | string | Marca |
| model | string | Modelo |
| year | integer | Año de fabricación |
| location | string | Ubicación |
| status | enum | activo, inactivo, mantenimiento |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Última actualización |

### Tabla: reports
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK auto-generado |
| machine_id | uuid | FK → machines |
| report_date | date | Fecha del informe |
| maintenance_type | enum | preventivo, correctivo, predictivo |
| technician | string | Técnico responsable |
| parts_changed | jsonb | Array de piezas |
| notes | text | Notas adicionales |
| cost | decimal | Costo |
| photos | array | URLs de fotos |
| pdf_url | string | URL del PDF |
| created_at | timestamp | Fecha de creación |

---

### 4. Estructura del Proyecto

```
javi-control/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas de la app
│   │   ├── Login.tsx     # Login/auth
│   │   ├── Dashboard.tsx # Panel principal
│   │   ├── AddMachine.tsx# Agregar máquina
│   │   ├── MachineDetail.tsx # Detalle + historial
│   │   └── AddReport.tsx # Crear informe
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios (Supabase client)
│   ├── utils/           # Utilidades
│   ├── styles/          # Estilos globales
│   ├── types/           # Tipos TypeScript
│   ├── App.tsx          # Router principal
│   └── main.tsx         # Entry point
├── public/              # Assets públicos
├── index.html           # HTML entry
├── vite.config.ts       # Config Vite
├── tailwind.config.js   # Config Tailwind
└── package.json         # Dependencias
```

---

### 5. Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo oscuro | `#3E216B` | Background principal |
| Primary | `#532D8C` | Botones, acentos |
| Accent | `#7B5CC9` | Resaltados, hover |
| Surface | `#2D1647` | Cards, containers |
| Surface Light | `#4A3375` | Elementos hover |
| Text | `#F5F5F5` | Texto principal |
| Text Muted | `#B8B8B8` | Texto secundario |

---

### 6. Flujo de Usuario

```
[Landing/Login]
    ↓
[Panel Principal] → Lista máquinas + Search
    ├── [+ Agregar Máquina] → Form → Guardar
    │
    └── [Filtrar] → [Seleccionar Máquina]
                       ├── [Ver Detalle] → Historial
                       └── [+ Nuevo Informe] → Form + Fotos
                                              ├── [Descargar PDF]
                                              └── [Guardar]
```

---

### 7. Dependencias

**Producción:**
- `react` ^19.x - Framework UI
- `react-dom` ^19.x - DOM rendering
- `react-router-dom` ^7.x - Routing
- `zustand` ^5.x - State management
- `@supabase/supabase-js` ^2.x - Supabase client
- `browser-image-compression` ^2.x - Optimización imágenes
- `jspdf` ^4.x - Generación PDF
- `lucide-react` ^1.x - Iconos

**Desarrollo:**
- `vite` ^8.x - Build tool
- `typescript` ^6.x - Type safety
- `tailwindcss` ^4.x - Estilos
- `@vitejs/plugin-react` - React plugin

---

### 8. Setup Supabase

1. Crear proyecto en supabase.com
2. Crear tablas: `machines` y `reports`
3. Configurar RLS policies
4. Crear buckets: `machine-photos` y `machine-pdfs`
5. Obtener URL y ANON_KEY
6. Crear archivo `.env.local`

---

### 9. Comandos

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build producción
npm run build
```

---

### 10. Decisiones de Diseño

1. **Tailwind v4** - Usamos configuración legacy por compatibilidad
2. **Zustand** - State simple para 1-2 usuarios (más simple que Redux)
3. **jspdf** - Generación PDF cliente (más simple que edge functions)
4. **browser-image-compression** - Compresión cliente antes de subir
5. **Auth integrada Supabase** - No reinventamos la wheel

---

## 📝 Notas para el Desarrollador

- Este proyecto está diseñado para aprender React paso a paso
- Cada página tiene una responsabilidad clara
- El flujo de datos es: UI → Zustand/State → Supabase
- Los formularios validan antes de enviar
- Las imágenes se comprimen ANTES de subir a Supabase
- Los PDFs se generan automáticamente al crear informes
