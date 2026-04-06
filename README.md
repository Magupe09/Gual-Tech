<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</div>

<br />

<div align="center">
  <h1>🔧 Javi Control</h1>
  <p>Sistema de gestión para máquinas industriales con trazabilidad de mantenimiento</p>
</div>

---

## 🚀 Acerca del Proyecto

**Javi Control** es una aplicación web (SPA) diseñada para gestionar y hacer seguimiento del mantenimiento de hasta 200 máquinas industriales. Permite registrar máquinas, cargar informes detallados con fotos, y generar PDFs automáticamente.

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 📋 **Gestión de Máquinas** | Registro completo de máquinas con referencia, serial, marca, modelo, año, ubicación y estado |
| 📊 **Panel de Control** | Dashboard con estadísticas en tiempo real: total, activas, en mantenimiento, inactivas |
| 🔍 **Búsqueda Inteligente** | Filtrar máquinas por referencia, número de serie o nombre |
| 📝 **Informes de Mantenimiento** | Crear informes con tipo de mantenimiento, técnico, piezas cambiadas, notas y costo |
| 📷 **Gestión de Fotos** | Subir fotos con optimización automática antes de guardar |
| 📄 **Generación de PDF** | Generar y descargar informes en PDF automáticamente |
| 🔐 **Autenticación** | Sistema de login seguro con Supabase Auth |

---

## 🛠️ Tecnologías

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,typescript,tailwind,supabase,postgresql" />
</div>

---

## 📁 Estructura del Proyecto

```
javi-control/
├── src/
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Login.tsx       # Página de autenticación
│   │   ├── Dashboard.tsx  # Panel principal
│   │   ├── AddMachine.tsx # Agregar nueva máquina
│   │   ├── MachineDetail.tsx    # Detalle de máquina + historial
│   │   └── AddReport.tsx  # Crear informe de mantenimiento
│   ├── services/          # Servicios
│   │   ├── supabase.ts    # Cliente de Supabase
│   │   └── demoData.ts    # Datos de ejemplo para modo demo
│   ├── types/             # Tipos TypeScript
│   ├── styles/            # Estilos globales (Tailwind)
│   ├── App.tsx            # Router principal
│   └── main.tsx           # Entry point
├── SUPABASE_TABLES.sql    # SQL para crear tablas en Supabase
├── DOCUMENTATION.md       # Documentación técnica
├── WORK_PLAN.md          # Plan de desarrollo
└── package.json
```

---

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| <span style="display:inline-block;width:12px;height:12px;background:#3E216B;border-radius:50%;"></span> Fondo Oscuro | `#3E216B` | Background principal |
| <span style="display:inline-block;width:12px;height:12px;background:#532D8C;border-radius:50%;"></span> Primary | `#532D8C` | Botones, acentos, logo |
| <span style="display:inline-block;width:12px;height:12px;background:#7B5CC9;border-radius:50%;"></span> Accent | `#7B5CC9` | Resaltados, hover |
| <span style="display:inline-block;width:12px;height:12px;background:#2D1647;border-radius:50%;"></span> Surface | `#2D1647` | Cards, contenedores |
| <span style="display:inline-block;width:12px;height:12px;background:#F5F5F5;border-radius:50%;"></span> Texto | `#F5F5F5` | Texto principal |

---

## 🏁 Comenzar

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Magupe09/Gual-Tech.git

# Entrar al directorio
cd javi-control

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el SQL del archivo `SUPABASE_TABLES.sql` en el SQL Editor
3. Crear los buckets de storage:
   - `machine-photos` (público)
   - `machine-pdfs` (público)
4. Configurar las variables de entorno en `.env.local`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 📱 Modo Demo

La aplicación incluye un **modo demo** que funciona sin necesidad de configurar Supabase. Para activarlo, simplemente no configures las variables de entorno.

En modo demo:
- ✅ Login instantáneo (sin autenticación)
- ✅ Datos de ejemplo precargados
- ✅ Crear máquinas y informes en memoria
- ✅ Generación de PDFs funcional

---

## 🔄 Flujo de Usuario

```
┌─────────────┐
│   Login    │
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ Dashboard   │───▶│Agregar Máquina│
│ (Lista)     │    └─────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│  Máquina    │───▶│Crear Informe│
│  Detalle    │    │+ Fotos      │
└──────┬──────┘    │+ PDF        │
       │          └─────────────┘
       ▼
┌─────────────┐
│  Historial  │
│  de Informes│
└─────────────┘
```

---

## 📄 Modelo de Datos

### Tabla: machines

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| reference | text | Código único de la máquina |
| serial_number | text | Número de serie |
| name | text | Nombre descriptivo |
| brand | text | Marca |
| model | text | Modelo |
| year | integer | Año de fabricación |
| location | text | Ubicación física |
| status | text | Estado (activo/inactivo/mantenimiento) |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Última actualización |

### Tabla: reports

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | Identificador único |
| machine_id | uuid | FK hacia machines |
| report_date | date | Fecha del informe |
| maintenance_type | text | Tipo (preventivo/correctivo/predictivo) |
| technician | text | Técnico responsable |
| parts_changed | jsonb | Array de piezas cambiadas |
| notes | text | Notas adicionales |
| cost | decimal | Costo del mantenimiento |
| photos | text[] | URLs de fotos |
| pdf_url | text | URL del PDF generado |
| created_at | timestamp | Fecha de creación |

---

## 👨‍💻 Contribuir

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commitear cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

---

## 📞 Contacto

- **Desarrollador**: Magu
- **GitHub**: [@Magupe09](https://github.com/Magupe09)

---

<div align="center">
  <p>Construido con ❤️ usando React + Supabase</p>
  <p>© 2024 Javi Control - Gual-Tech</p>
</div>
