const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printComanda: (data) => ipcRenderer.invoke('print-comanda', data),
  printFactura: (data) => ipcRenderer.invoke('print-factura', data),
});

contextBridge.exposeInMainWorld('database', {
  getProducts: () => ipcRenderer.invoke('db-get-products'),
  addProduct: (product) => ipcRenderer.invoke('db-add-product', product),
  addSale: (sale) => ipcRenderer.invoke('db-add-sale', sale),
  getDailySales: (date) => ipcRenderer.invoke('db-get-daily-sales', date),
  getDailySummary: (date) => ipcRenderer.invoke('db-get-daily-summary', date),
});