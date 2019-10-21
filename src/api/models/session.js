/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../functions/model'),
    mongoose = require("mongoose");

  module.exports.schema = {
    id: '/model/session',
    title: "Session",
    description: "String with the token for the logged session",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'string',
    pattern: '^[0-9a-f]{32}$'
  };

  module.exports.dbSchema = modelFunctions.clone(module.exports.schema, {
    href: "session",
    description: "Information about a session",
    type: "object",
    properties: {
      token: modelFunctions.clone(module.exports.schema, {
        id: "/model/session/token",
        title: "Session token"
      }),
      userName: {
        type: 'string'
      },
      time: {
        format: 'date-time',
        description: 'Date and time of the authentication',
        default: () => new Date()
      }
    },
    required: [
      "token",
      "userName",
      "time"
    ]
  });
  delete module.exports.dbSchema.pattern;

  module.exports.mongooseSchema = modelFunctions.toMongooseSchema(module.exports.dbSchema);
  module.exports.mongooseSchema.token.unique = true;

  let mongooseSchemaObject = new mongoose.Schema(module.exports.mongooseSchema);
  /*mongooseObject.index({
      "$**": "text"
  });*/

  let api2db = function (session) {
    if (session && typeof session.time === "undefined") {
      session.time = new Date();
    }
    return session;
  };
  module.exports.api2db = api2db;
  mongooseSchemaObject.pre("validate", async function () {
    return api2db(this);
  });

  let db2api = function (session) {
    session = session.token;
    return session;
  };
  module.exports.db2api = db2api;

  module.exports.mongooseSchemaObject = mongooseSchemaObject;

  module.exports.mongooseModel = mongoose.model(module.exports.dbSchema.href, module.exports.mongooseSchemaObject);
})();