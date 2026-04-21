# MachineDetail

## Resumen

Página que muestra los detalles de una máquina específica y su historial de informes de mantenimiento.

**Archivo:** `src/pages/MachineDetail.tsx`
**Líneas:** 228
**Ruta:** `/machine/:id`

## Propósito

- Mostrar información completa de una máquina
- Mostrar historial de informes de mantenimiento
- Permitir agregar nuevos informes
- Permitir volver al dashboard

## Tecnologías Usadas

| Tecnología | Propósito |
|------------|-----------|
| React 19 | Framework UI |
| TypeScript | Tipado (Machine, Report) |
| useState | Estados (machine, reports, loading) |
| useEffect | Cargar datos al montar |
| useParams | Capturar :id de la URL |
| useNavigate | Navegación (volver) |
| supabase.from().eq() | Query con filtro por ID |
| Lucide React | Iconos (ArrowLeft, Plus, FileText, Calendar, User, Package) |

## Bloques de Lógica

### 1. Captura de parámetro URL

```tsx
const { id } = useParams<{ id: string }>()
```

**Propósito:** Obtener el ID de la máquina desde la URL

**Ejemplo:**
- URL: `/machine/123`
- Resultado: `id = "123"`

---

### 2. Estados

```tsx
const [machine, setMachine] = useState<Machine | null>(null)
const [reports, setReports] = useState<Report[]>([])
const [loading, setLoading] = useState(true)
```

| Estado | Tipo inicial | Propósito |
|--------|-------------|-----------|
| `machine` | `null` | Datos de la máquina |
| `reports` | `[]` | Lista de informes |
| `loading` | `true` | Indicar carga de datos |

---

### 3. useEffect: Cargar datos

```tsx
useEffect(() => {
  if (id) {
    fetchMachine()
    fetchReports()
  }
}, [id])
```

**Nota:** Se ejecuta cuando cambia el `id`. Si hay id, carga máquina e informes.

---

### 4. fetchMachine: Obtener máquina específica

```tsx
const fetchMachine = async () => {
  try {
    // MODO DEMO
    if (isDemoMode || !supabase) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const found = demoMachines.find(m => m.id === id)
      setMachine(found || null)
      setLoading(false)
      return
    }

    // MODO REAL
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    setMachine(data)
  } catch (error) {
    console.error('Error fetching machine:', error)
  } finally {
    setLoading(false)
  }
}
```

**Query Supabase:**
```tsx
.from('machines')
.select('*')
.eq('id', id)
.single()
```

**Diferencias con Dashboard:**
- `.eq('id', id)` → Filtra por ID específico
- `.single()` → Retorna un solo objeto (no array)

---

### 5. fetchReports: Obtener informes de la máquina

```tsx
const fetchReports = async () => {
  try {
    if (isDemoMode || !supabase) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setReports(demoReports[id || ''] || [])
      return
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('machine_id', id)
      .order('report_date', { ascending: false })

    if (error) throw error
    setReports(data || [])
  } catch (error) {
    console.error('Error fetching reports:', error)
  }
}
```

**Query Supabase:**
```tsx
.from('reports')
.select('*')
.eq('machine_id', id)
.order('report_date', { ascending: false })
```

---

### 6. Helpers de color

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'activo': return 'bg-green-500'
    case 'inactivo': return 'bg-red-500'
    case 'mantenimiento': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}

const getMaintenanceTypeColor = (type: string) => {
  switch (type) {
    case 'preventivo': return 'bg-blue-500'
    case 'correctivo': return 'bg-red-500'
    case 'predictivo': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}
```

---

### 7. Render condicional

```tsx
// Loading
if (loading) {
  return <div>Cargando...</div>
}

// No encontrada
if (!machine) {
  return <div>Máquina no encontrada</div>
}

// Contenido normal
return (
  <div>
    {/* Info máquina */}
    {/* Historial informes */}
  </div>
)
```

---

### 8. Render: Estructura

```
├── Header
│   ├── Botón volver (ArrowLeft)
│   ├── Título (reference + name)
│   └── Botón "Nuevo Informe"
├── Info de la máquina
│   ├── Estado (badge)
│   └── Grid de campos (serial, marca, modelo, año, ubicación)
└── Historial de informes
    ├── Si no hay: mensaje + link para crear
    └── Si hay: lista de informes con:
        ├── Tipo de mantenimiento (badge)
        ├── Fecha
        ├── Costo
        ├── Técnico
        ├── Piezas cambiadas
        ├── Notas
        └── Fotos (thumbnail)
```

---

## edge Cases

1. **Máquina no existe:** Muestra "Máquina no encontrada"
2. **Sin informes:** Muestra "No hay informes registrados" con link para crear
3. **Sin fotos:** No muestra sección de fotos
4. **Sin costo:** No muestra el costo (solo si > 0)
5. **Sin piezas:** No muestra sección de piezas

---

## Conexiones

```
MachineDetail → supabase.ts → Supabase (machines + reports tables)
MachineDetail → demoData.ts → demoMachines + demoReports
MachineDetail → App.tsx (Route /machine/:id)
MachineDetail → AddReport (/machine/:id/add-report)
MachineDetail → Dashboard (/dashboard)
```

---

## Siguiente: [[2d-AddMachine]]

---
*Parte del Cerebro: Javi Control | 1.1 Estructura → 1.1.1 Pages → MachineDetail*


EXAMEN TÉCNICO - MachineDetail.tsx

¿Qué hook nuevo importa MachineDetail que Dashboard no usaba? Explicá para qué sirve:
import { useParams, useNavigate, Link } from 'react-router-dom' 

