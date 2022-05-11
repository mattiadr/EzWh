'use strict';
const express = require('express');
const Warehouse = require('./components/Warehouse');

// init express
const app = new express();
const port = 3001;

const wh = new Warehouse();

app.use(express.json());

//GET /api/test
app.get('/api/hello', (req, res) => {
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

/*----------------------------SKU-----------------------------------*/

//GET /api/skus
app.get('/api/skus', async (req, res) => {
  let skus = await wh.getSKUs();
  let array = [];
  skus.body.forEach((value, key) => array.push(value))
  return res.status(skus.status).json(array);
});

//GET /api/skus/:id
app.get('/api/skus/:id', async (req, res) => {
  let sku = await wh.getSKUbyId(req.params.id);
  return res.status(sku.status).json(sku.body);
});

//POST /api/sku
app.post('/api/sku', async (req, res) => {
  let result = await wh.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
  return res.status(result.status).json(result.message);
});

//PUT /api/sku/:id
app.put('/api/sku/:id', async (req, res) => {
  let result = await wh.updateSKU(req.params.id, undefined, req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
  return res.status(result.status).json(result.message);
});

//PUT /api/sku/:id/position
app.put('/api/sku/:id/position', async (req, res) => {
  let result = await wh.updateSKU(req.params.id, req.body.position);
  return res.status(result.status).json(result.message);
});

// DELETE /api/sku/:id
app.delete('/api/sku/:id', async (req, res) => {
  let result = await wh.deleteSKU(req.params.id);
  return res.status(result.status).json(result.message);
});

/*--------------------------------SKUItem-----------------------------------*/

//GET /api/skuitems
app.get('/api/skuitems', async (req, res) => {
  let sku_items = await wh.getSKUItems();
  let array = [];
  sku_items.body.forEach((value, key) => array.push(value))
  return res.status(sku_items.status).json(array);
});

//GET /api/skuitems/sku/:id
app.get('/api/skuitems/sku/:id', async (req, res) => {
  let skuitems = await wh.getSKUItemsBySKU(req.params.id);
  return res.status(skuitems.status).json(skuitems.body);
});

//GET /api/skuitems/:rfid
app.get('/api/skuitems/:rfid', async (req, res) => {
  let skuitems = await wh.getSKUItemByRFID(req.params.rfid);
  return res.status(skuitems.status).json(skuitems.body);
});

//POST /api/skuitem
app.post('/api/skuitem', async (req, res) => {
  let result = await wh.createSKUItem(req.body.RFID, req.body.SKUId.toString(), req.body.DateOfStock);
  return res.status(result.status).json(result.message);
});

//PUT /api/skuitems/:rfid
app.put('/api/skuitems/:rfid', async (req, res) => {
  let result = await wh.updateSKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
  return res.status(result.status).json(result.message);
});

//DELETE /api/skuitems/:rfid
app.delete('/api/skuitems/:rfid', async (req, res) => {
  let result = await wh.deleteSKUItems(req.params.rfid);
  return res.status(result.status).json(result.message);
});

/*----------------------------Position------------------------------------*/

//GET /api/positions
app.get('/api/positions', async (req, res) => {
  let positions = await wh.getPositions();
  let array = [];
  positions.body.forEach((value, key) => array.push(value))
  return res.status(positions.status).json(array);
});

//POST /api/position
app.post('/api/position', async (req, res) =>{
  let result = await wh.createPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
  return res.status(result.status).json(result.message);
});

//PUT /api/position/:positionID
app.put('/api/position/:positionID', async (req, res) =>{
  let result = await wh.updatePosition(req.params.positionID, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedValue);
  return res.status(result.status).json(result.message);
});

//PUT /api/position/:positionID/changeID
app.put('/api/position/:positionID/changeID', async (req, res) =>{
  const positionID = req.body.newPositionID;
  if (positionID.length != 12) return req.status(422).json();
  let newAisleID = positionID.slice(0, 4);
  let newRow = positionID.slice(4, 8);
  let newCol = positionID.slice(8, 12);
  let result = await wh.updatePosition(req.params.positionID, newAisleID, newRow, newCol);
  return res.status(result.status).json(result.message);
});

//DELETE /api/position/:positionID
app.delete('/api/position/:positionID', async (req, res) => {
  let result = await wh.deletePosition(req.params.positionID);
  return res.status(result.status).json(result.message);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;