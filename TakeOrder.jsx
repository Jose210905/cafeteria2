import { useState, useEffect } from 'react'

function TakeOrder({ tableId, onBack }) {
  const [table, setTable] = useState(null)
  const [cart, setCart] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  // Cargar productos y categorías
  useEffect(() => {
    const savedProducts = localStorage.getItem('dbloom_products')
    const savedCategories = localStorage.getItem('dbloom_categories')
    
    if (savedProducts) {
      const allProducts = JSON.parse(savedProducts)
      setProducts(allProducts.filter(p => p.active))
    } else {
      // Productos por defecto
      setProducts([
        { id: 101, name: 'Café Americano', price: 1800, category: 'Bebidas', active: true },
        { id: 102, name: 'Café Latte', price: 2500, category: 'Bebidas', active: true },
        { id: 103, name: 'Cappuccino', price: 2800, category: 'Bebidas', active: true },
        { id: 104, name: 'Chocolate Caliente', price: 2200, category: 'Bebidas', active: true },
        { id: 201, name: 'Club de Sandwiches', price: 4500, category: 'Comidas', active: true },
        { id: 202, name: 'Empanada', price: 1800, category: 'Comidas', active: true },
        { id: 203, name: 'Croissant de Jamón y Queso', price: 3200, category: 'Comidas', active: true },
        { id: 301, name: 'Tarta de queso', price: 3500, category: 'Postres', active: true },
        { id: 302, name: 'Brownie con helado', price: 3200, category: 'Postres', active: true }
      ])
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      setCategories(['Bebidas', 'Comidas', 'Postres', 'Extras'])
    }
  }, [])

  // Cargar datos de la mesa
  useEffect(() => {
    const tables = JSON.parse(localStorage.getItem('dbloom_tables') || '[]')
    const currentTable = tables.find(t => t.id === tableId)
    
    if (currentTable) {
      setTable(currentTable)
      
      // Solo cargar orden existente si está en preparación o servida
      if ((currentTable.status === 'preparing' || 
           currentTable.status === 'served' || 
           currentTable.status === 'pending') && 
           currentTable.order && 
           currentTable.order.items) {
        setCart(currentTable.order.items)
        setNotes(currentTable.order.notes || '')
      } else {
        // Mesa recién ocupada - carrito vacío
        setCart([])
        setNotes('')
      }
    }
  }, [tableId])

  // Función para calcular subtotal
  const getSubtotal = () => {
    let total = 0
    cart.forEach(item => {
      const price = item.price || 0
      const quantity = item.quantity || 1
      total += price * quantity
    })
    return total
  }

  // Función para calcular IVA
  const getIVA = () => {
    return Math.round(getSubtotal() * 0.13)
  }

  // Función para calcular total
  const getTotal = () => {
    return getSubtotal() + getIVA()
  }

  // Filtrar productos por categoría
  const getFilteredProducts = () => {
    if (selectedCategory === 'all') return products
    return products.filter(p => p.category === selectedCategory)
  }

  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      const updatedCart = cart.map(item => {
        if (item.id === product.id) {
          return { ...item, quantity: (item.quantity || 1) + 1 }
        }
        return item
      })
      setCart(updatedCart)
    } else {
      // Si no existe, agregar nuevo
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1
      }
      setCart([...cart, newItem])
    }
  }

  // Actualizar cantidad
  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = (item.quantity || 1) + change
        if (newQuantity <= 0) return null
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean)
    
    setCart(updatedCart)
  }

  // Eliminar del carrito
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  // Limpiar orden
  const clearOrder = () => {
    if (confirm('¿Seguro que desea limpiar toda la orden?')) {
      setCart([])
      setNotes('')
    }
  }

  // Enviar a cocina
  const sendToKitchen = () => {
    if (cart.length === 0) {
      alert('No hay productos en la orden')
      return
    }

    const subtotal = getSubtotal()
    const iva = getIVA()
    const total = getTotal()

    // Actualizar mesa con la orden
    const tables = JSON.parse(localStorage.getItem('dbloom_tables') || '[]')
    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'preparing',
          order: {
            items: cart,
            notes: notes,
            time: new Date().toISOString(),
            subtotal: subtotal,
            iva: iva,
            total: total
          },
          amount: total
        }
      }
      return t
    })

    localStorage.setItem('dbloom_tables', JSON.stringify(updatedTables))
    setShowPrintModal(true)
  }

  // Imprimir comanda
  const printComanda = () => {
    const printWindow = window.open('', '', 'width=400,height=600')
    const date = new Date().toLocaleString('es-CR')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda Mesa ${table?.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h2, h3 { text-align: center; margin: 10px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .notes { margin-top: 20px; padding: 10px; border: 1px solid #000; }
            .total { font-weight: bold; margin-top: 20px; font-size: 18px; }
          </style>
        </head>
        <body>
          <h2>D'bloom Memories</h2>
          <h3>COMANDA DE COCINA</h3>
          <div class="divider"></div>
          <p><strong>Mesa:</strong> ${table?.id}</p>
          <p><strong>Cliente:</strong> ${table?.customerName || 'Sin nombre'}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <div class="divider"></div>
          <h3>PRODUCTOS</h3>
          ${cart.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
              <span>₡${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
          ${notes ? `
            <div class="notes">
              <strong>NOTAS:</strong><br>
              ${notes}
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="total">TOTAL: ₡${getTotal().toLocaleString()}</div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    setShowPrintModal(false)
    onBack()
  }

  if (!table) {
    return <div>Cargando...</div>
  }

  // Calcular valores actuales
  const subtotal = getSubtotal()
  const iva = getIVA()
  const total = getTotal()
  const filteredProducts = getFilteredProducts()

  return (
    <div className="take-order">
      {/* Header */}
      <div className="order-header-bar">
        <button className="btn-back" onClick={onBack}>
          ← Volver a Mesas
        </button>
        <h2>Mesa {table.id} - {table.customerName || 'Sin cliente'}</h2>
        <div className="order-status">
          Estado: {
            table.status === 'available' ? 'Disponible' :
            table.status === 'occupied' ? 'Ocupada' :
            table.status === 'preparing' ? 'Preparando' :
            table.status === 'served' ? 'Servida' :
            table.status === 'pending' ? 'Por Pagar' : 
            'Desconocido'
          }
        </div>
      </div>

      <div className="order-content">
        {/* Productos */}
        <div className="products-section">
          <h3>Productos</h3>
          
          {/* Categorías */}
          <div className="category-tabs-order">
            <button 
              className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de productos */}
          <div className="products-grid-order">
            {filteredProducts.length === 0 ? (
              <div className="empty-products">
                <p>No hay productos disponibles</p>
                <p className="empty-hint">Agregue productos desde Gestión de Productos</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card-order"
                  onClick={() => addToCart(product)}
                >
                  <div className="product-name">{product.name}</div>
                  {product.description && (
                    <div className="product-desc">{product.description}</div>
                  )}
                  <div className="product-price">₡ {product.price.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orden */}
        <div className="order-section">
          <h3>Orden Actual</h3>
          
          <div className="cart-items-order">
            {cart.length === 0 ? (
              <div className="empty-order">
                <p>No hay productos en la orden</p>
                <p className="empty-hint">Seleccione productos del menú</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={`cart-${item.id}-${Date.now()}`} className="order-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">₡{(item.price || 0).toLocaleString()} c/u</div>
                    <div className="item-subtotal">
                      Subtotal: ₡{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                  <div className="item-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity || 1}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <button 
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notas */}
          <div className="order-notes">
            <label>Notas especiales:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, extra salsa..."
              rows="3"
            />
          </div>

          {/* Totales */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Total parcial:</span>
              <span>₡ {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>IVA (13%):</span>
              <span>₡ {iva.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>TOTAL:</span>
              <span>₡ {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="order-actions">
            <button 
              className="btn-clear-order"
              onClick={clearOrder}
              disabled={cart.length === 0}
            >
              Limpiar
            </button>
            <button 
              className="btn-send-kitchen"
              onClick={sendToKitchen}
              disabled={cart.length === 0}
            >
              Enviar a Cocina
            </button>
          </div>
        </div>
      </div>

      {/* Modal de impresión */}
      {showPrintModal && (
        <div className="modal active">
          <div className="modal-content modal-print">
            <h2>Comanda Lista para Imprimir</h2>
            <div className="comanda-preview">
              <div className="comanda-header">
                <h3>D'bloom Memories</h3>
                <p>COMANDA DE COCINA</p>
              </div>
              <div className="comanda-info">
                <p><strong>Mesa:</strong> {table.id}</p>
                <p><strong>Cliente:</strong> {table.customerName || 'Sin nombre'}</p>
                <p><strong>Fecha:</strong> {new Date().toLocaleString('es-CR')}</p>
              </div>
              <div className="comanda-items">
                <h4>PRODUCTOS:</h4>
                {cart.map((item, index) => (
                  <div key={index} className="comanda-item">
                    <span className="item-qty-comanda">{item.quantity}x</span>
                    <span className="item-name-comanda">{item.name}</span>
                    <span>₡{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {notes && (
                <div className="comanda-notes">
                  <strong>NOTAS:</strong> {notes}
                </div>
              )}
              <div className="comanda-totals">
                <p><strong>Subtotal: ₡{subtotal.toLocaleString()}</strong></p>
                <p><strong>IVA: ₡{iva.toLocaleString()}</strong></p>
                <p><strong>TOTAL: ₡{total.toLocaleString()}</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowPrintModal(false)
                  onBack()
                }}
              >
                Omitir Impresión
              </button>
              <button className="btn-print" onClick={printComanda}>
                Imprimir Comanda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TakeOrder