import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import TableManagement from './components/TableManagement'
import TakeOrder from './components/TakeOrder'
import ProductManagement from './components/ProductManagement'
import Reports from './components/Reports'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('tables')
  const [selectedTable, setSelectedTable] = useState(null)

  const handleLogin = (username) => {
    setIsAuthenticated(true)
    setCurrentUser({ username, role: 'Cajero' })
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCurrentView('tables')
  }

  const handleSelectTable = (tableId) => {
    setSelectedTable(tableId)
    setCurrentView('order')
  }

  const handleBackToTables = () => {
    setSelectedTable(null)
    setCurrentView('tables')
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Dashboard 
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      >
        {currentView === 'tables' && (
          <TableManagement onSelectTable={handleSelectTable} />
        )}
        
        {currentView === 'order' && selectedTable && (
          <TakeOrder 
            tableId={selectedTable} 
            onBack={handleBackToTables}
          />
        )}
        
        {currentView === 'products' && (
          <ProductManagement />
        )}
        
        {currentView === 'reports' && (
          <Reports />
        )}
      </Dashboard>
    </div>
  )
}

export default App