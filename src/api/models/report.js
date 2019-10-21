/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../functions/model'),
    user = require('./user').schema,
    date = require('./date').schema,
    mongoose = require('mongoose');

  module.exports.schema = {
    id: '/model/report',
    title: "Report",
    description: "Information about a user's runs on a specific week",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      userName: modelFunctions.clone(user.properties.name, {
        description: "Name of the user of this report"
      }),
      firstDate: modelFunctions.clone(date, {
        description: "String with the first date of the week (a sunday)"
      }),
      length: {
        type: "number",
        description: "Length of the user's runs of the week in meters",
        minimum: 0
      },
      duration: {
        type: "number",
        description: "Duration of the user's runs of the week in seconds",
        minimum: 0
      },
      speed: {
        type: "number",
        description: "Average speed of the user's runs of the week in meters per second",
        minimum: 0
      }
    },
    additionalProperties: false
  };

  module.exports.dbSchema = modelFunctions.clone(module.exports.schema, {
    href: "report",
    required: [
      'userName',
      'firstDate',
      "length",
      "duration",
      "speed"
    ]
  });
  delete module.exports.dbSchema.properties.id;

  module.exports.dbSchema = modelFunctions.fixRequired(module.exports.dbSchema);

  module.exports.mongooseSchema = modelFunctions.toMongooseSchema(module.exports.dbSchema);

  let mongooseSchemaObject = modelFunctions.mongooseSchemaBuilder(module.exports.mongooseSchema);
  mongooseSchemaObject.index({
    userName: 1,
    firstDate: 1
  }, {
    unique: true
  });
  /*mongooseObject.index({
      "$**": "text"
  });*/

  module.exports.mongooseSchemaObject = mongooseSchemaObject;

  module.exports.mongooseModel = mongoose.model(module.exports.dbSchema.href, module.exports.mongooseSchemaObject);
})();