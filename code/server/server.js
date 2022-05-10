'use strict';
const express = require('express');
const Warehouse = require('./components/Warehouse');
// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();
wh.createTables();

app.use(express.json());

//GET /api/test
app.get('/api/hello', (req,res) => {
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

//GET /api/skus
app.get('/api/skus', async (req,res) => {
  let skus = await wh.getSKUs();
  return res.status(skus.status).json(Object.fromEntries(skus.body));
});

//GET /api/skus/:id
app.get('/api/skus/:id', async (req,res) => {
  let sku = await wh.getSKUbyId(req.params.id);
  return res.status(sku.status).json(sku.body);
});

//POST /api/sku
app.post('/api/sku', async (req,res) => {
  let result = await wh.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
  return res.status(result.status).json(result.message);
});

//PUT /api/sku/:id
app.put('/api/sku/:id', async (req,res) => {
  let result = await wh.updateSKU(req.params.id, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
  return res.status(result.status).json(result.message);
});

// DELETE /api/sku/:id
app.delete('/api/sku/:id', async (req,res) => {
  let result = await wh.deleteSKU(req.params.id);
  return res.status(result.status).json(result.message);
});

//GET /api/skuitem
app.get('/api/skuitems', async (req,res) => {
  let sku_items = await wh.getSKUItems();
  return res.status(sku_items.status).json(sku_items.body);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;