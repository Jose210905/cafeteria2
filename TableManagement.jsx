import { useState, useEffect } from 'react'

function TableManagement({ onSelectTable }) {
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('dbloom_tables')
    return saved ? JSON.parse(saved) : [
      { id: 1, status: 'available', capacity: 4, occupiedTime: null, amount: 0, customerName: '', order: null },
      { id: 2, status: 'available', capacity: 4, occupiedTime: null, amount: 0, customerName: '', order: null },
      { id: 3, status: 'available', capacity: 2, occupiedTime: null, amount: 0, customerName: '', order: null },
      { id: 4, status: 'available', capacity: 6, occupiedTime: null, amount: 0, customerName: '', order: null },
      { id: 5, status: 'available', capacity: 4, occupiedTime: null, amount: 0, customerName: '', order: null },
      { id: 6, status: 'available', capacity: 2, occupiedTime: null, amount: 0, customerName: '', order: null }
    ]
  })
  
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [selectedTableForOccupy, setSelectedTableForOccupy] = useState(null)
  const [selectedTableForPayment, setSelectedTableForPayment] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [newTable, setNewTable] = useState({ capacity: 4 })
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [paymentMethod, setPaymentMethod] = useState('')

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('dbloom_tables', JSON.stringify(tables))
  }, [tables])

  // Calcular tiempo transcurrido
  const getElapsedTime = (occupiedTime) => {
    if (!occupiedTime) return ''
    const elapsed = Math.floor((currentTime - new Date(occupiedTime).getTime()) / 1000 / 60)
    if (elapsed < 60) return `${elapsed} min`
    const hours = Math.floor(elapsed / 60)
    const mins = elapsed % 60
    return `${hours}h ${mins}m`
  }

  // Filtrar mesas
  const filteredTables = tables.filter(table => {
    if (filter === 'all') return true
    if (filter === 'available') return table.status === 'available'
    if (filter === 'occupied') return table.status === 'occupied'
    if (filter === 'preparing') return table.status === 'preparing'
    if (filter === 'served') return table.status === 'served'
    if (filter === 'pending') return table.status === 'pending'
    return true
  })

  // Estadísticas
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    preparing: tables.filter(t => t.status === 'preparing').length,
    served: tables.filter(t => t.status === 'served').length,
    pending: tables.filter(t => t.status === 'pending').length
  }

  // Ocupar mesa
  const handleOccupyTable = (tableId) => {
    setSelectedTableForOccupy(tableId)
    setCustomerName('')
    setShowCustomerModal(true)
  }

  const confirmOccupyTable = () => {
    setTables(prevTables => prevTables.map(table => {
      if (table.id === selectedTableForOccupy) {
        return {
          ...table,
          status: 'occupied',
          occupiedTime: new Date().toISOString(),
          customerName: customerName || 'Cliente sin nombre'
        }
      }
      return table
    }))
    setShowCustomerModal(false)
    // Ir directo a tomar orden
    onSelectTable(selectedTableForOccupy)
  }

  // Tomar orden de mesa ocupada
  const handleTakeOrder = (tableId) => {
    onSelectTable(tableId)
  }

  // Marcar como servida
  const handleMarkAsServed = (tableId) => {
    setTables(prevTables => prevTables.map(table => {
      if (table.id === tableId) {
        return { ...table, status: 'served' }
      }
      return table
    }))
  }

  // Solicitar cuenta
  const handleRequestBill = (tableId) => {
    setTables(prevTables => prevTables.map(table => {
      if (table.id === tableId) {
        return { ...table, status: 'pending' }
      }
      return table
    }))
  }

  // Procesar pago
  const handleProcessPayment = (tableId) => {
    const table = tables.find(t => t.id === tableId)
    setSelectedTableForPayment(table)
    setPaymentMethod('')
    setShowPaymentModal(true)
  }

  const confirmPayment = () => {
    if (!paymentMethod) {
      alert('Por favor seleccione un método de pago')
      return
    }

    // Imprimir factura (simulado)
    if (selectedTableForPayment) {
      printInvoice(selectedTableForPayment)
    }

    // Liberar mesa
    setTables(prevTables => prevTables.map(table => {
      if (table.id === selectedTableForPayment.id) {
        return {
          ...table,
          status: 'available',
          occupiedTime: null,
          customerName: '',
          amount: 0,
          order: null
        }
      }
      return table
    }))

    setShowPaymentModal(false)
    alert(`Pago procesado exitosamente con ${paymentMethod}. Mesa liberada.`)
  }

  // Imprimir factura
  const printInvoice = (table) => {
    const printWindow = window.open('', '', 'width=400,height=600')
    const date = new Date().toLocaleString('es-CR')
    
    let itemsHtml = ''
    if (table.order && table.order.items) {
      itemsHtml = table.order.items.map(item => `
        <tr>
          <td>${item.quantity}x ${item.name}</td>
          <td style="text-align: right">₡${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura Mesa ${table.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h2, h3 { text-align: center; margin: 10px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; }
            .totals { margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
          </style>
        </head>
        <body>
          <h2>D'bloom Memories</h2>
          <h3>FACTURA</h3>
          <div class="divider"></div>
          <p><strong>Mesa:</strong> ${table.id}</p>
          <p><strong>Cliente:</strong> ${table.customerName || 'Sin nombre'}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Método de pago:</strong> ${paymentMethod}</p>
          <div class="divider"></div>
          <h3>DETALLE</h3>
          <table>
            ${itemsHtml}
          </table>
          <div class="divider"></div>
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₡${(table.order?.subtotal || 0).toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>IVA (13%):</span>
              <span>₡${(table.order?.iva || 0).toLocaleString()}</span>
            </div>
            <div class="final-total total-row">
              <span>TOTAL:</span>
              <span>₡${(table.amount || 0).toLocaleString()}</span>
            </div>
          </div>
          <div class="divider"></div>
          <p style="text-align: center; margin-top: 30px;">¡Gracias por su visita!</p>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  // Agregar mesa
  const handleAddTable = () => {
    const maxId = Math.max(...tables.map(t => t.id), 0)
    const newTableData = {
      id: maxId + 1,
      status: 'available',
      capacity: parseInt(newTable.capacity),
      occupiedTime: null,
      amount: 0,
      customerName: '',
      order: null
    }
    setTables([...tables, newTableData])
    setShowAddModal(false)
    setNewTable({ capacity: 4 })
  }

  // Editar mesa
  const handleEditTable = (table) => {
    setEditingTable({ ...table })
    setShowEditModal(true)
  }

  const saveEditTable = () => {
    setTables(prevTables => prevTables.map(table => 
      table.id === editingTable.id ? editingTable : table
    ))
    setShowEditModal(false)
  }

  // Eliminar mesa
  const handleDeleteTable = (tableId) => {
    if (confirm('¿Está seguro de eliminar esta mesa?')) {
      setTables(tables.filter(t => t.id !== tableId))
    }
  }

  // Obtener clase CSS según estado
  const getTableClass = (status) => {
    return `table-card ${status}`
  }

  // Obtener botón de acción según estado
  const getActionButton = (table) => {
    switch(table.status) {
      case 'available':
        return (
          <button className="btn-action btn-occupy" onClick={() => handleOccupyTable(table.id)}>
            Ocupar Mesa
          </button>
        )
      case 'occupied':
        return (
          <button className="btn-action btn-take-order" onClick={() => handleTakeOrder(table.id)}>
            Tomar Orden
          </button>
        )
      case 'preparing':
        return (
          <button className="btn-action btn-mark-served" onClick={() => handleMarkAsServed(table.id)}>
            Marcar como Servida
          </button>
        )
      case 'served':
        return (
          <button className="btn-action btn-request-bill" onClick={() => handleRequestBill(table.id)}>
            Solicitar Cuenta
          </button>
        )
      case 'pending':
        return (
          <button className="btn-action btn-process-payment" onClick={() => handleProcessPayment(table.id)}>
            Procesar Pago y Liberar
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="table-management">
      {/* Header */}
      <div className="table-header">
        <h2>Gestión de Mesas</h2>
        <button className="btn-add-table" onClick={() => setShowAddModal(true)}>
          + Agregar Mesa
        </button>
      </div>

      {/* Estadísticas */}
      <div className="table-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-title">Total Mesas</div>
        </div>
        <div className="stat-card stat-available">
          <div className="stat-number">{stats.available}</div>
          <div className="stat-title">Disponibles</div>
        </div>
        <div className="stat-card stat-occupied">
          <div className="stat-number">{stats.occupied}</div>
          <div className="stat-title">Ocupadas</div>
        </div>
        <div className="stat-card stat-preparing">
          <div className="stat-number">{stats.preparing}</div>
          <div className="stat-title">Preparando</div>
        </div>
        <div className="stat-card stat-served">
          <div className="stat-number">{stats.served}</div>
          <div className="stat-title">Servidas</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-title">Por Pagar</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="table-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({stats.total})
        </button>
        <button 
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Disponibles ({stats.available})
        </button>
        <button 
          className={`filter-btn ${filter === 'occupied' ? 'active' : ''}`}
          onClick={() => setFilter('occupied')}
        >
          Ocupadas ({stats.occupied})
        </button>
        <button 
          className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilter('preparing')}
        >
          Preparando ({stats.preparing})
        </button>
        <button 
          className={`filter-btn ${filter === 'served' ? 'active' : ''}`}
          onClick={() => setFilter('served')}
        >
          Servidas ({stats.served})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Por Pagar ({stats.pending})
        </button>
      </div>

      {/* Grid de Mesas */}
      <div className="tables-grid">
        {filteredTables.map(table => (
          <div key={table.id} className={getTableClass(table.status)}>
            {/* Botones de editar/eliminar */}
            <div className="table-actions">
              <button className="btn-edit-table" onClick={() => handleEditTable(table)}>
                ✏️
              </button>
              <button className="btn-delete-table" onClick={() => handleDeleteTable(table.id)}>
                🗑️
              </button>
            </div>

            {/* Número de mesa */}
            <div className="table-number">Mesa {table.id}</div>
            
            {/* Estado visual */}
            <div className={`table-status-badge status-${table.status}`}>
              {table.status === 'available' && 'DISPONIBLE'}
              {table.status === 'occupied' && 'OCUPADA'}
              {table.status === 'preparing' && '🍳 PREPARANDO'}
              {table.status === 'served' && '✓ SERVIDA'}
              {table.status === 'pending' && '💰 POR PAGAR'}
            </div>

            {/* Información adicional */}
            <div className="table-details">
              <div className="table-capacity">
                👥 Capacidad: {table.capacity}
              </div>
              
              {table.customerName && (
                <div className="table-customer">
                  👤 {table.customerName}
                </div>
              )}
              
              {table.occupiedTime && (
                <div className="table-time">
                  ⏱️ {getElapsedTime(table.occupiedTime)}
                </div>
              )}
              
              {table.amount > 0 && (
                <div className="table-amount">
                  ₡{table.amount.toLocaleString()}
                </div>
              )}
            </div>

            {/* Botón de acción */}
            {getActionButton(table)}
          </div>
        ))}
      </div>

      {/* Modal Agregar Mesa */}
      {showAddModal && (
        <div className="modal active">
          <div className="modal-content">
            <h2>Agregar Nueva Mesa</h2>
            
            <div className="form-group">
              <label>Capacidad de personas:</label>
              <select 
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
              >
                <option value="2">2 personas</option>
                <option value="4">4 personas</option>
                <option value="6">6 personas</option>
                <option value="8">8 personas</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleAddTable}>
                Agregar Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Mesa */}
      {showEditModal && editingTable && (
        <div className="modal active">
          <div className="modal-content">
            <h2>Editar Mesa {editingTable.id}</h2>
            
            <div className="form-group">
              <label>Capacidad:</label>
              <select 
                value={editingTable.capacity}
                onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
              >
                <option value="2">2 personas</option>
                <option value="4">4 personas</option>
                <option value="6">6 personas</option>
                <option value="8">8 personas</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={saveEditTable}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cliente */}
      {showCustomerModal && (
        <div className="modal active">
          <div className="modal-content">
            <h2>Ocupar Mesa {selectedTableForOccupy}</h2>
            
            <div className="form-group">
              <label>Nombre del Cliente (opcional):</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ingrese nombre del cliente"
                autoFocus
              />
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCustomerModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={confirmOccupyTable}>
                Ocupar y Tomar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedTableForPayment && (
        <div className="modal active">
          <div className="modal-content">
            <h2>Procesar Pago - Mesa {selectedTableForPayment.id}</h2>
            
            <div className="payment-summary">
              <h3>Resumen de Cuenta</h3>
              <div className="payment-detail">
                <span>Cliente:</span>
                <span>{selectedTableForPayment.customerName || 'Sin nombre'}</span>
              </div>
              <div className="payment-detail">
                <span>Total a Pagar:</span>
                <span className="payment-total">₡{(selectedTableForPayment.amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Método de Pago:</label>
              <div className="payment-methods">
                <button 
                  className={`payment-method ${paymentMethod === 'Efectivo' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Efectivo')}
                >
                  💵 Efectivo
                </button>
                <button 
                  className={`payment-method ${paymentMethod === 'Tarjeta' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Tarjeta')}
                >
                  💳 Tarjeta
                </button>
                <button 
                  className={`payment-method ${paymentMethod === 'SINPE' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('SINPE')}
                >
                  📱 SINPE Móvil
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </button>
              <button 
                className="btn-save" 
                onClick={confirmPayment}
                disabled={!paymentMethod}
              >
                Confirmar Pago e Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableManagement