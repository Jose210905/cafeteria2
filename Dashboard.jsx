function Dashboard({ currentUser, currentView, onViewChange, onLogout, children }) {
  const menuItems = [
    { id: 'tables', label: 'Mesas', icon: '🪑' },
    { id: 'products', label: 'Productos', icon: '📦' },
    { id: 'reports', label: 'Reportes', icon: '📊' },
  ]

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>D'bloom Memories - POS</h1>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {currentUser?.username}</span>
          <span className="datetime">{new Date().toLocaleString('es-CR')}</span>
          <button className="btn-logout" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Dashboard