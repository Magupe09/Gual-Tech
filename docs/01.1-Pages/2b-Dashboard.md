# Dashboard

## Resumen

Página principal de Javi Control. Muestra la lista de todas las máquinas registradas con búsqueda, estadísticas y navegación a detalles.

**Archivo:** `src/pages/Dashboard.tsx`
**Líneas:** 234
**Ruta:** `/dashboard`

## Propósito

- Mostrar lista de todas las máquinas
- Filtrar máquinas por búsqueda (reference, serial_number, name)
- Mostrar estadísticas (total, activas, mantenimiento, inactivas)
- Permitir agregar nuevas máquinas
- Permitir ver el detalle de cada máquina
- Permitir cerrar sesión

## Tecnologías Usadas

| Tecnología | Propósito |
|------------|-----------|
| React 19 | Framework UI |
| TypeScript | Tipado (Machine[]) |
| useState | Estados (machines, loading, search) |
| useEffect | Cargar datos al montar |
| useNavigate | Logout |
| Link | Navegación a otras páginas |
| supabase.from() | Query a tabla machines |
| Lucide React | Iconos (Plus, Search, LogOut) |

## Bloques de Lógica

### 1. Custom Hook: useMediaQuery

```tsx
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => { ... }, [matches, query])
  return matches
}
```

Detecta breakpoints:
- `isMobile`: max-width 767px
- `isTablet`: 768px - 1023px
- `isDesktop`: min-width 1024px

---

### 2. Estados

```tsx
const [machines, setMachines] = useState<Machine[]>([])
const [loading, setLoading] = useState(true)
const [search, setSearch] = useState('')
const navigate = useNavigate()
```

| Estado | Tipo inicial | Propósito |
|--------|-------------|-----------|
| `machines` | `[]` (array vacío) | Lista de máquinas |
| `loading` | `true` | Indicar carga de datos |
| `search` | `''` | Texto de búsqueda |

---

### 3. useEffect: Cargar datos

```tsx
useEffect(() => {
  fetchMachines()
}, [])
```

Se ejecuta **una sola vez** al montar el componente (dependency array vacío `[]`).

---

### 4. fetchMachines: Obtener datos

```tsx
const fetchMachines = async () => {
  try {
    // MODO DEMO
    if (isDemoMode || !supabase) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setMachines(demoMachines)
      setLoading(false)
      return
    }

    // MODO REAL
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setMachines(data || [])
  } catch (error) {
    console.error('Error fetching machines:', error)
  } finally {
    setLoading(false)
  }
}
```

**Query Supabase:**
```tsx
.from('machines')
.select('*')
.order('created_at', { ascending: false })
```

---

### 5. Filtrado de máquinas

```tsx
const filteredMachines = machines.filter(m => 
  m.reference.toLowerCase().includes(search.toLowerCase()) ||
  m.serial_number.toLowerCase().includes(search.toLowerCase()) ||
  m.name.toLowerCase().includes(search.toLowerCase())
)
```

**Características:**
- Filtra en memoria (no hace query nueva)
- Busca en 3 campos: reference, serial_number, name
- Ignora mayúsculas/minúsculas con `toLowerCase()`

---

### 6. Helper: getStatusColor

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'activo': return 'bg-green-500'
    case 'inactivo': return 'bg-red-500'
    case 'mantenimiento': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}
```

---

### 7. handleLogout

```tsx
const handleLogout = async () => {
  if (supabase) {
    await supabase.auth.signOut()
  }
  navigate('/')
}
```

---

### 8. Render: Estructura

```
├── Header (logo + logout)
├── Actions (botón agregar + search)
├── Stats (4 cards: total, activas, mant, inact)
└── Lista de máquinas (Link a /machine/:id)
```

---

## edge Cases

1. **Sin máquinas:** Muestra "No hay máquinas agregadas aún"
2. **Sin resultados de búsqueda:** Muestra "No se encontraron máquinas"
3. **Error en query:** Solo hace console.error, no muestra nada al usuario

---

## Conexiones

```
Dashboard → supabase.ts → Supabase (machines table)
Dashboard → demoData.ts → demoMachines
Dashboard → App.tsx (Route /dashboard)
Dashboard → AddMachine (/add-machine)
Dashboard → MachineDetail (/machine/:id)
```

---

## Siguiente: [[2c-MachineDetail]]

---
*Parte del Cerebro: Javi Control | 1.1 Estructura → 1.1.1 Pages → Dashboard*