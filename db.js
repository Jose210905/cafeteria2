const Database = require('better-sqlite3');
const path = require('path');

// Crear o abrir la base de datos
const dbPath = path.join(__dirname, '../../cafeteria.db');
const db = new Database(dbPath);

// Crear tablas si no existen
function initializeDatabase() {
  // Tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de cierre de caja
  db.exec(`
    CREATE TABLE IF NOT EXISTS cash_register (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      total_cash REAL NOT NULL,
      total_sinpe REAL NOT NULL,
      total_card REAL NOT NULL,
      total_sales REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Base de datos inicializada correctamente');
}

// Funciones de productos
const productQueries = {
  getAll: db.prepare('SELECT * FROM products WHERE active = 1'),
  getById: db.prepare('SELECT * FROM products WHERE id = ?'),
  add: db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)'),
  update: db.prepare('UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?'),
  delete: db.prepare('UPDATE products SET active = 0 WHERE id = ?'),
};

// Funciones de ventas
const saleQueries = {
  add: db.prepare('INSERT INTO sales (total, payment_method, items) VALUES (?, ?, ?)'),
  getByDate: db.prepare(`
    SELECT * FROM sales 
    WHERE DATE(created_at) = DATE(?)
    ORDER BY created_at DESC
  `),
  getByDateRange: db.prepare(`
    SELECT * FROM sales 
    WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    ORDER BY created_at DESC
  `),
  getDailySummary: db.prepare(`
    SELECT 
      payment_method,
      COUNT(*) as count,
      SUM(total) as total
    FROM sales
    WHERE DATE(created_at) = DATE(?)
    GROUP BY payment_method
  `),
};

// Funciones de cierre de caja
const cashRegisterQueries = {
  add: db.prepare(`
    INSERT INTO cash_register (date, total_cash, total_sinpe, total_card, total_sales, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  getByDate: db.prepare('SELECT * FROM cash_register WHERE date = ?'),
};

module.exports = {
  db,
  initializeDatabase,
  productQueries,
  saleQueries,
  cashRegisterQueries,
};