# AddMachine

## Resumen

Página de formulario para crear una nueva máquina en el sistema.

**Archivo:** `src/pages/AddMachine.tsx`
**Líneas:** 206
**Ruta:** `/add-machine`

## Propósito

- Crear una nueva máquina con todos sus datos
- Validar campos requeridos
- Guardar en Supabase (demo o real)
- Redireccionar al detalle de la máquina creada

## Tecnologías Usadas

| Tecnología | Propósito |
|------------|-----------|
| React 19 | Framework UI |
| TypeScript | Tipado (MachineFormData) |
| useState | Estados (formData, loading, error) |
| useNavigate | Navegación (volver, ir a detalle) |
| supabase.from().insert() | Insertar en tabla machines |
| Lucide React | Iconos (ArrowLeft, Save) |
| MachineFormData | Tipo del formulario |

## Bloques de Lógica

### 1. Estados

```tsx
const [formData, setFormData] = useState<MachineFormData>({
  reference: '',
  serial_number: '',
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  location: '',
  status: 'activo'
})

const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

| Estado | Tipo inicial | Propósito |
|--------|-------------|-----------|
| `formData` | Objeto con campos vacíos | Datos del formulario |
| `loading` | `false` | Indicar procesamiento |
| `error` | `''` | Mensaje de error |

---

### 2. handleChange: Actualizar campos

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: name === 'year' ? parseInt(value) || 0 : value
  }))
}
```

**Características:**
- Spread operator para mantener campos anteriores
- Convierte `year` a número con `parseInt`
- Funciona para inputs y selects

---

### 3. handleSubmit: Guardar máquina

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // MODO DEMO
    if (isDemoMode || !supabase) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newMachine = {
        ...formData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      demoMachines.push(newMachine as any)
      navigate(`/machine/${newMachine.id}`)
      return
    }

    // MODO REAL
    const { data, error: supabaseError } = await supabase
      .from('machines')
      .insert([formData])
      .select()
      .single()

    if (supabaseError) throw supabaseError
    
    navigate(`/machine/${data.id}`)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al guardar la máquina'
    setError(errorMessage)
  } finally {
    setLoading(false)
  }
}
```

**Flujo:**
1. Evita recarga de página
2. Activa loading
3. **Modo demo:** Crea objeto con ID generado, agrega a demoMachines, navega
4. **Modo real:** Inserta en Supabase, navega al detalle
5. **Error:** Muestra mensaje
6. **Finally:** Desactiva loading

**Query Supabase:**
```tsx
.from('machines')
.insert([formData])
.select()
.single()
```

---

### 4. Render: Estructura del formulario

```
├── Header
│   ├── Botón volver (ArrowLeft)
│   └── Título "Agregar Máquina"
├── Errores (si hay)
├── Campos del formulario
│   ├── Reference * (text)
│   ├── Número de Serie * (text)
│   ├── Nombre * (text)
│   ├── Marca (text)
│   ├── Modelo (text)
│   ├── Año de Fabricación (number)
│   ├── Ubicación (text)
│   └── Estado (select: activo/inactivo/mantenimiento)
└── Botones
    ├── Cancelar
    └── Guardar Máquina
```

---

### 5. Campos del formulario

| Campo | Tipo | Requerido | Default |
|-------|------|-----------|---------|
| reference | text | Sí | '' |
| serial_number | text | Sí | '' |
| name | text | Sí | '' |
| brand | text | No | '' |
| model | text | No | '' |
| year | number | No | Año actual |
| location | text | No | '' |
| status | select | No | 'activo' |

---

## Diferencias con Login y Dashboard

- **No usa useEffect** para cargar datos (es un formulario de creación)
- **Usa un objeto para todos los campos** (no un estado por campo)
- **La navegación es condicional:** va al detalle de la máquina creada
- **El tipo de dato es MachineFormData** (definido en types/index.ts)

---

## edge Cases

1. **Campos vacíos requeridos:** El navegador valida con `required`
2. **Año inválido:** Input tiene `min="1900"` y `max={año actual}`
3. **Error al guardar:** Muestra mensaje de error en rojo
4. **Modo demo:** Los datos se agregan solo a la sesión (no persisten)

---

## Conexiones

```
AddMachine → supabase.ts → Supabase (machines table - insert)
AddMachine → demoData.ts → demoMachines (push)
AddMachine → types/index.ts → MachineFormData
AddMachine → App.tsx (Route /add-machine)
AddMachine → MachineDetail (/machine/:id) tras crear
```

---

## Siguiente: [[2e-AddReport]]

---
*Parte del Cerebro: Javi Control | 1.1 Estructura → 1.1.1 Pages → AddMachine*

Examen

1: Esta tecnica permite crear una copia del array original y asi trabajar con el sin comprometer el original esto nos da mayor control.
2: lo convierte a numero ya que es un string y al hacer la validacion generia error.
3: por defecto el navegador tiene un disparador que recarga la pagina en cada envio o submit. El preventDefault() evita esto.
4: Si o si el loading debe desaparecer independiente de la validacion, por eso lo pusisten finally.
5: No lo se esto es nuevo para mi. 
6: jum no lo se :/ es por que debe tener una forma o typado? 
7: Al tener la opcion de probar las funcionalidades sin un base real podemos hacer pruebas rapidas que permiten explorar la app en funcionamiento sin depender de una base de datos, y simular su uso.
8: Por que estaria apuntando siempre al valor inmediatamente anterior sin actualizar?
9 : El useNavigate permite navegar entre pages, pero el usuario puede hacer en el navegador con las flechas.
10: Jum nisiquiera sabia que es un form debil que puede ser quebrado facil, dime cual es su debilidad y un form fuerte? Obvio  no lo se.