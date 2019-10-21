/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../functions/model'),
    sha256 = require('./sha256').schema,
    jsSha256 = require('js-sha256'),
    mongoose = require('mongoose'),
    systemFunctions = require('../../functions/system');

  module.exports.schema = {
    id: '/model/user',
    title: "User",
    description: "User information",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      password: {
        type: 'string',
        description: 'Password of the user',
        minimum: 8,
        maximum: 32
      },
      role: {
        type: "string",
        description: "The role of the user",
        enum: ["regular", "manager", "admin"]
      }
    },
    additionalProperties: false
  };

  module.exports.dbSchema = modelFunctions.clone(module.exports.schema, {
    href: "user",
    properties: {
      passwordHash: modelFunctions.clone(sha256, {
        id: "/model/user/passwordHash",
        description: "The SHA-256 hash of the user's password concatenated with the string \"jogging\""
      })
    },
    required: [
      'name',
      'password',
      'passwordHash',
      'role'
    ]
  });

  module.exports.dbSchema = modelFunctions.fixRequired(module.exports.dbSchema);

  module.exports.mongooseSchema = modelFunctions.toMongooseSchema(module.exports.dbSchema);
  module.exports.mongooseSchema.name.unique = true;

  let mongooseSchemaObject = modelFunctions.mongooseSchemaBuilder(module.exports.mongooseSchema);
  /*mongooseObject.index({
      "$**": "text"
  });*/

  let api2db = function (user) {
    user.passwordHash = jsSha256(user.password + "jogging");
    if (!user.role) {
      user.role = "regular";
    }
    return user;
  };
  module.exports.api2db = api2db;
  mongooseSchemaObject.pre("validate", async function () {
    return api2db(this);
  });

  let db2api = function (user) {
    if (user._id) {
      user.id = JSON.parse(JSON.stringify(user._id));
      delete user._id;
    }
    let toObjectBackup = user.toObject;
    user.toObject = function () {
      let object = toObjectBackup.call(this);
      delete object.password;
      delete object.passwordHash;
      return object;
    };
    return user;
  };
  module.exports.db2api = db2api;

  module.exports.mongooseSchemaObject = mongooseSchemaObject;

  module.exports.mongooseModel = mongoose.model(module.exports.dbSchema.href, module.exports.mongooseSchemaObject);

  let admin = {
    name: systemFunctions.env("ADMIN_NAME"),
    password: systemFunctions.env("ADMIN_PASS"),
    role: "admin"
  };

  //module.exports.mongooseModel.findOneAndUpdate({ userName: admin.name }, admin, { upsert: true });
  module.exports.mongooseModel.create(admin);
})();