import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, LogOut } from 'lucide-react'
import { supabase } from '../services/supabase'
import { logout } from '../services/auth'
import { Machine } from '../types'

// Custom hook for responsive designs
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])
  
  return matches
}

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    fetchMachines()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const fetchMachines = async () => {
    try {
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

  const filteredMachines = machines.filter(m => 
    m.reference.toLowerCase().includes(search.toLowerCase()) ||
    m.serial_number.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ color: '#532D8C' }}>
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header con logo y logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: isMobile ? '16px' : '24px', 
        paddingBottom: '16px', 
        borderBottom: '2px solid #532D8C', 
        flexShrink: 0,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logojavi.PNG" alt="GUALTECH" style={{ width: isMobile ? '36px' : '48px', height: isMobile ? '36px' : '48px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ color: '#532D8C', fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold' }}>GUALTECH</h1>
            <p style={{ color: '#666666', fontSize: isMobile ? '12px' : '14px' }}>Gestión de Máquinas</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: isMobile ? '6px 12px' : '8px 16px', 
            backgroundColor: 'transparent', 
            border: '1px solid #532D8C', 
            borderRadius: '8px', 
            color: '#532D8C', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          <LogOut size={isMobile ? 14 : 18} />
          {isMobile ? 'Salir' : 'Cerrar Sesión'}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexShrink: 0, flexDirection: isMobile ? 'column' : 'row' }}>
        <Link to="/add-machine" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Agregar Máquina
        </Link>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <Search className="absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#666666', pointerEvents: 'none', zIndex: 10 }} size={18} />
          <input
            type="text"
            placeholder="Buscar por referencia, número de serie o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      {/* Machines List - ocupa el resto del espacio */}
      <div className="card" style={{ flex: 1, overflow: 'auto' }}>
        <h2 style={{ color: '#532D8C', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', marginBottom: '16px' }}>Máquinas</h2>
        
        {filteredMachines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666666' }}>
            {search ? 'No se encontraron máquinas' : 'No hay máquinas agregadas aún'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredMachines.map(machine => (
              <Link
                key={machine.id}
                to={`/machine/${machine.id}`}
                style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  padding: isMobile ? '12px' : '16px',
                  backgroundColor: '#ffffff', 
                  border: '1px solid #532D8C',
                  borderRadius: '8px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <p style={{ color: '#532D8C', fontWeight: '600', fontSize: isMobile ? '14px' : '16px' }}>{machine.reference}</p>
                    <p style={{ color: '#1a1a1a', fontSize: isMobile ? '12px' : '14px' }}>{machine.name}</p>
                    <p style={{ color: '#666666', fontSize: isMobile ? '11px' : '12px' }}>N/S: {machine.serial_number}</p>
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <p style={{ color: '#1a1a1a', fontSize: isMobile ? '12px' : '14px' }}>{machine.brand} {machine.model}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



//Respuestas 
/*
import { useState, useEffect } from 'react'. --   > Importamos los hooks de React para manejar estado y efectos secundarios.   
import { Link, useNavigate } from 'react-router-dom' -- > Importamos componentes de React Router para navegación entre páginas.
import { Plus, Search, LogOut } from 'lucide-react'. -- > Importamos iconos de la biblioteca lucide-react para usarlos en la interfaz.
import { supabase, isDemoMode } from '../services/supabase' -- > Importamos la instancia de Supabase y una variable para verificar si estamos en modo demo.
import { demoMachines } from '../services/demoData'. -- > Importamos datos de ejemplo para el modo demo.
import { Machine } from '../types' -- > Importamos el tipo Machine para tipar nuestras máquinas en TypeScript.

2 :
¿Qué datos guarda este componente en estado con useState y por qué?
const [machines, setMachines] = useState<Machine[]>([]). -- > Guarda la lista de máquinas que se mostrarán en el dashboard. Se inicializa como un array vacío y se llena con los datos traídos de Supabase o del modo demo.
const [loading, setLoading] = useState(true) -- > Guarda el estado de carga mientras se traen los datos. Se inicializa en true y se pone en false una vez que los datos han sido cargados.
const [search, setSearch] = useState('') --> Guarda el texto de búsqueda que el usuario ingresa para filtrar las máquinas. Se inicializa como una cadena vacía y se actualiza a medida que el usuario escribe en el campo de búsqueda.

3 : 
useEffect
¿Qué hace este useEffect y por qué está vacío el array de dependencias?
useEffect(() => {
  fetchMachines()
}, []). -- > Este useEffect se ejecuta una sola vez cuando el componente se monta, debido a que el array de dependencias está vacío. Su función es llamar a la función fetchMachines para traer los datos de las máquinas desde Supabase o el modo demo y actualizar el estado con esos datos.

4:
fetchMachines
**Explicá el flujo completo de `fetchMachines`:**
1. ¿Qué es `isDemoMode` y cómo afecta el flujo? -- > isDemoMode es una variable que indica si la aplicación está en modo demo o no. Si isDemoMode es true, fetchMachines simula una carga de datos usando un setTimeout y luego establece las máquinas con los datos de demoMachines. Si isDemoMode es false, fetchMachines hace una consulta a Supabase para traer las máquinas reales desde la base de datos.
2. ¿Qué pasa en modo demo vs modo real? -- > En modo demo, fetchMachines no hace ninguna consulta a la base de datos, sino que simplemente espera un momento y luego carga los datos de ejemplo. En modo real, fetchMachines hace una consulta a Supabase para obtener las máquinas almacenadas en la base de datos y actualiza el estado con esos datos.
3. ¿Qué hace `.order('created_at', { ascending: false })`? --> Esta parte de la consulta a Supabase ordena los resultados por la columna created_at en orden descendente, lo que significa que las máquinas más recientemente creadas aparecerán primero en la lista.

5: 
 Filtering
¿Qué hace esta línea y dónde se usa?
const filteredMachines = machines.filter(m => -- > Esta línea crea una nueva variable filteredMachines que contiene solo las máquinas que coinciden con el texto de búsqueda ingresado por el usuario. Se usa para mostrar solo las máquinas relevantes en la lista, filtrando por referencia, número de serie o nombre.
  m.reference.toLowerCase().includes(search.toLowerCase()) ||  
  m.serial_number.toLowerCase().includes(search.toLowerCase()) ||
  m.name.toLowerCase().includes(search.toLowerCase())
) 

6: 
Renderizado Condicional
¿Qué representa este bloque?
if (loading) {
  return (
    <div className="flex items-center justify-center" style={{ color: '#532D8C' }}>
      <div className="text-xl">Cargando...</div>
    </div>
  )
} -- > Este bloque representa un renderizado condicional que muestra un mensaje de "Cargando..." mientras los datos de las máquinas están siendo traídos. Si loading es true, se muestra este mensaje en lugar del contenido principal del dashboard. Una vez que loading se establece en false, el componente renderiza el resto de la interfaz con la lista de máquinas y las estadísticas.

7: 
 Keys en Listas
**¿Por qué usamos `key={machine.id}` en el map? ¿Qué pasa si no ponemos key?**
-- > Usamos key={machine.id} para darle a cada elemento de la lista un identificador único. Esto ayuda a React a optimizar el renderizado y a mantener el estado de los componentes correctamente. Si no ponemos key, React mostrará una advertencia en la consola y puede tener problemas para actualizar la lista de manera eficiente, lo que podría llevar a errores o comportamientos inesperados en la interfaz.

8:
Navegación
¿Cómo funciona este Link y hacia dónde lleva?
<Link to="/add-machine" className="btn-primary flex items-center gap-2"> -- > Este Link es un componente de React Router que actúa como un enlace para navegar a la página de agregar máquina. Cuando el usuario hace clic en este enlace, la aplicación cambiará la ruta a "/add-machine", lo que generalmente mostraría un formulario para agregar una nueva máquina al sistema.
Y este otro:
<Link
  key={machine.id}
  to={`/machine/${machine.id}`} -- > Este Link se genera dentro de un map que recorre la lista de máquinas. Cada Link lleva a una ruta específica para esa máquina, utilizando su id. Por ejemplo, si una máquina tiene un id de 123, el Link llevará a "/machine/123", donde se mostrarían los detalles de esa máquina.

  9:
  Conexión con Otros Componentes
**¿Qué pasa cuando el usuario hace click en una máquina de la lista? ¿Qué componente se rendered y cómo recibe los datos?** -- > Cuando el usuario hace click en una máquina de la lista, se activa el Link que lleva a la ruta específica de esa máquina (por ejemplo, "/machine/123"). Esto hará que React Router renderice el componente asociado a esa ruta, que probablemente sea un componente de detalles de máquina. Ese componente puede usar el id de la máquina (obtenido de la URL) para hacer una consulta a Supabase y traer los datos específicos de esa máquina para mostrar al usuario.

10:  Custom Hook
¿Qué hace useMediaQuery y por qué está definido dentro del mismo archivo? -- > useMediaQuery es un custom hook que permite detectar si la pantalla cumple con una consulta de medios específica (por ejemplo, si es móvil, tablet o desktop). Está definido dentro del mismo archivo porque es una función pequeña y específica que solo se utiliza en este componente. Definirlo aquí evita la necesidad de crear un archivo separado para un hook que no se reutiliza en otros lugares, manteniendo el código más organizado y fácil de entender en el contexto de este componente.

*/