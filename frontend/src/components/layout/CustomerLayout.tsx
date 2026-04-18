import { useLocation, Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function CustomerLayout() {
  const location = useLocation()
  const [visible, setVisible] = useState(true)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setVisible(false)
      const t = setTimeout(() => { setVisible(true); prevPath.current = location.pathname }, 80)
      return () => clearTimeout(t)
    }
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main
        style={{
          flex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
