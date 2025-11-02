import { useState, useEffect } from 'react'

function ProductManagement() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('dbloom_products')
    return saved ? JSON.parse(saved) : [
      { id: 101, name: 'Café Americano', price: 1800, category: 'Bebidas', active: true },
      { id: 102, name: 'Café Latte', price: 2500, category: 'Bebidas', active: true },
      { id: 103, name: 'Cappuccino', price: 2800, category: 'Bebidas', active: true },
      { id: 104, name: 'Chocolate Caliente', price: 2200, category: 'Bebidas', active: true },
      { id: 201, name: 'Sandwich Club', price: 4500, category: 'Comidas', active: true },
      { id: 202, name: 'Empanada', price: 1800, category: 'Comidas', active: true },
      { id: 203, name: 'Croissant Jamón y Queso', price: 3200, category: 'Comidas', active: true },
      { id: 301, name: 'Cheesecake', price: 3500, category: 'Postres', active: true },
      { id: 302, name: 'Brownie con Helado', price: 3200, category: 'Postres', active: true }
    ]
  })

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('dbloom_categories')
    return saved ? JSON.parse(saved) : ['Bebidas', 'Comidas', 'Postres', 'Extras']
  })

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    active: true
  })

  // Guardar productos en localStorage
  useEffect(() => {
    localStorage.setItem('dbloom_products', JSON.stringify(products))
  }, [products])

  // Guardar categorías en localStorage
  useEffect(() => {
    localStorage.setItem('dbloom_categories', JSON.stringify(categories))
  }, [categories])

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Estadísticas
  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    inactive: products.filter(p => !p.active).length,
    categories: categories.length
  }

  // Abrir modal para nuevo producto
  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: categories[0] || '',
      price: '',
      description: '',
      active: true
    })
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      active: product.active
    })
    setShowModal(true)
  }

  // Guardar producto
  const handleSaveProduct = () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Por favor ingrese un precio válido')
      return
    }

    if (editingProduct) {
      // Editar producto existente
      setProducts(products.map(p => 
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price: price,
              description: formData.description,
              active: formData.active
            }
          : p
      ))
    } else {
      // Crear nuevo producto
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        price: price,
        description: formData.description,
        active: formData.active
      }
      setProducts([...products, newProduct])
    }

    setShowModal(false)
  }

  // Eliminar producto
  const handleDeleteProduct = (id) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  // Toggle activo/inactivo
  const toggleProductStatus = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ))
  }

  // Agregar categoría
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('Por favor ingrese un nombre de categoría')
      return
    }

    if (categories.includes(newCategory)) {
      alert('Esta categoría ya existe')
      return
    }

    setCategories([...categories, newCategory])
    setNewCategory('')
    setShowCategoryModal(false)
  }

  // Eliminar categoría
  const handleDeleteCategory = (category) => {
    if (confirm(`¿Eliminar la categoría "${category}"? Los productos de esta categoría no se eliminarán.`)) {
      setCategories(categories.filter(c => c !== category))
    }
  }

  return (
    <div className="product-management">
      {/* Header */}
      <div className="management-header">
        <h2>Gestión de Productos</h2>
        <div className="header-actions">
          <button className="btn-category" onClick={() => setShowCategoryModal(true)}>
            📁 Categorías
          </button>
          <button className="btn-add-product" onClick={handleNewProduct}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="product-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Productos Totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactivos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-label">Categorías</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="product-filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Todas las Categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tabla de productos */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className={!product.active ? 'inactive-row' : ''}>
                  <td>{product.id}</td>
                  <td>
                    <div className="product-name-cell">
                      {product.name}
                      {product.description && (
                        <div className="product-description">{product.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td className="price-cell">₡{product.price.toLocaleString()}</td>
                  <td>
                    <button
                      className={`status-toggle ${product.active ? 'active' : 'inactive'}`}
                      onClick={() => toggleProductStatus(product.id)}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditProduct(product)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <div className="form-group">
              <label>Nombre del Producto *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Café Latte"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Precio (₡) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="Ej: 2500"
                min="0"
                step="100"
              />
            </div>

            <div className="form-group">
              <label>Descripción (Opcional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción breve del producto..."
                rows="3"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                />
                Producto Activo
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSaveProduct}>
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Categorías */}
      {showCategoryModal && (
        <div className="modal active">
          <div className="modal-content modal-small">
            <h2>Gestión de Categorías</h2>
            
            <div className="categories-list">
              {categories.map(category => (
                <div key={category} className="category-item">
                  <span>{category}</span>
                  <button 
                    className="btn-delete-small"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="add-category-form">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nueva categoría..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button className="btn-add-category" onClick={handleAddCategory}>
                Agregar
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn-save" onClick={() => setShowCategoryModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement