import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '200px', width: 'calc(100% - 200px)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
