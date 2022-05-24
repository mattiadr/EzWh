/**
 this file is run before api tests, to make sure the database file and tables are created before any test
 */

const DatabaseConnection = require("./database/DatabaseConnection");
DatabaseConnection.getInstance();
