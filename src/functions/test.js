/*jshint esversion: 8*/

const fileFunctions = require("../functions/file"),
  mocha = require("mocha"),
  modelFunctions = require("../functions/model"),
  mongoose = require("mongoose");

before(modelFunctions.connectToMongo);

afterEach(async () => {
  for (let modelName in mongoose.models) {
    await mongoose.models[modelName].deleteMany({});
  }
});

after(() => {
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

/*
 * Run all tests sequentially
 */

fileFunctions.walkSync("./", "test.js").forEach(file => {
  require(".." + file.substr(5) + "test");
});