'use strict';
const express = require('express');

const SKU_router = require("./routers/SKU_router");
const SKUItem_router = require("./routers/SKUItem_router");
const Position_router = require("./routers/Position_router");
const TestDescriptor_router = require("./routers/TestDescriptor_router");
const TestResult_router = require("./routers/TestResult_router");
const User_router = require("./routers/User_router");
const RestockOrder_router = require("./routers/RestockOrder_router");
const ReturnOrder_router = require("./routers/ReturnOrder_router");
const InternalOrder_router = require("./routers/InternalOrder_router");
const Item_router = require("./routers/Item_router");

// init express
const app = new express();
const port = 3001;

app.use(express.json());

// set up routers
app.use("/api", SKU_router);
app.use("/api", SKUItem_router);
app.use("/api", Position_router);
app.use("/api", TestDescriptor_router);
app.use("/api", TestResult_router);
app.use("/api", User_router);
app.use("/api", RestockOrder_router);
app.use("/api", ReturnOrder_router);
app.use("/api", InternalOrder_router);
app.use("/api", Item_router);

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
