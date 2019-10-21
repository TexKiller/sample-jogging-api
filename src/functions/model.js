/*jshint esversion: 8*/

(() => {
  'use strict';

  const mongoose = require("mongoose"),
    MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer,
    systemFunctions = require("./system");

  /**
   * Function to connect to the Mongo DB
   */
  module.exports.connectToMongo = async () => {
    let serverUri;
    if (typeof global.it === "function" || systemFunctions.env("MONGO_RAM")) {
      const mongoServer = new MongoMemoryServer();
      serverUri = await mongoServer.getConnectionString(systemFunctions.env("MONGO_DB_NAME") || "test");
    } else {
      serverUri = systemFunctions.env("MONGO_URI") +
        (systemFunctions.env("MONGO_DB_NAME") ?
          "/" + systemFunctions.env("MONGO_DB_NAME") :
          "");
    }

    mongoose.Promise = global.Promise;
    let mongooseOptions = {
      auth: {
        authdb: systemFunctions.env("MONGO_AUTHDB")
      },
      user: systemFunctions.env("MONGO_USER"),
      pass: systemFunctions.env("MONGO_PASS"),
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    };
    if (!mongooseOptions.auth.authdb) {
      delete mongooseOptions.auth;
    }
    if (!mongooseOptions.user) {
      delete mongooseOptions.user;
    }
    if (!mongooseOptions.pass) {
      delete mongooseOptions.pass;
    }
    global.mongoConnection = (await (mongoose.connect(serverUri, mongooseOptions))).connection;
  };

  const jsf = require('json-schema-faker');
  jsf.option({
    alwaysFakeOptionals: true
  });
  jsf.option({
    fixedProbabilities: true
  });
  jsf.option({
    optionalsProbability: 1.0
  });

  /**
   * Function to convert all proprieties with the date-time format to Date objects
   */
  function fixDates(data, schema) {
    if (data && schema) {
      switch (schema.type) {
        case "object":
          for (let key in data) {
            data[key] = fixDates(data[key], schema.properties[key]);
          }
          break;
        case "array":
          if (data instanceof Array) {
            data = data.map(d => fixDates(d, schema.items));
          }
          break;
        default:
          if (schema.format === "date-time") {
            data = new Date(data);
          }
      }
    }
    return data;
  }
  module.exports.fixDates = fixDates;

  /**
   * Function that treats the required properties, allowing:
   *  - the use of properties inside other properties
   *    e.g.: ['user.email']
   *  - setting limits for arrays
   *    e.g.: [
   *          {
   *            type: 'array',
   *            path: 'path.to.array',
   *            minItems: <integer>,
   *            maxItems: <integer>
   *          }
   *        ]
   *  - the use of logical operations on required properties
   *    ex: [
   *          {
   *            type: 'logical',
   *            allOf: [<required`s>],
   *            anyOf: [<required`s>],
   *            oneOf: [<required`s>],
   *            onlyOf: [<required`s>],
   *            required: [<required`s>]
   *          }
   *        ]
   */
  exports.fixRequired = function (inSchema) {
    let outSchema = clone(inSchema);
    delete outSchema.required;
    let props = getProperties(outSchema, {});
    if (inSchema.required) {
      inSchema.required.forEach(req => {
        fixRequired(outSchema, req, props);
      });
    }
    if (!outSchema.example) {
      outSchema.example = jsf.generate(clone(outSchema));
    }
    return outSchema;
  };

  /**
   * Function to clone javascript objects
   */
  function clone(obj) {
    if (null === obj || "object" !== typeof obj) {
      return arguments[arguments.length - 1];
    }
    if (obj instanceof Date) {
      return new Date(obj);
    }
    let copy = obj.constructor();
    if (typeof copy !== "undefined") {
      Array.prototype.forEach.call(arguments, obj => {
        if (typeof obj !== "undefined") {
          if (obj instanceof Array) {
            for (let i = 0; i < obj.length; ++i) {
              copy[i] = (copy[i] ?
                clone(copy[i], obj[i]) :
                clone(obj[i]));
            }
          }
          for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) {
              copy[attr] = (typeof copy[attr] !== "undefined" ?
                clone(copy[attr], obj[attr]) :
                clone(obj[attr]));
            }
          }
        }
      });
    } else {
      copy = arguments[arguments.length - 1];
    }
    return copy;
  }
  module.exports.clone = clone;

  const jsonSchemaToMongoose = require("json-schema-to-mongoose");

  /**
   * Function that converts json-schema to mongoose-schema
   */
  module.exports.toMongooseSchema = function (json) {
    let mongooseSchema = jsonSchemaToMongoose({}, json);
    addMongooseId(mongooseSchema);
    return mongooseSchema;
  };

  function addMongooseId(mongooseSchema) {
    if (!mongooseSchema._id) {
      mongooseSchema._id = {
        type: mongoose.Schema.ObjectId,
        auto: true,
        lowercase: true
      };
    }
    for (let key in mongooseSchema) {
      if (mongooseSchema[key] && typeof mongooseSchema[key] === "object" && !mongooseSchema[key].type) {
        addMongooseId(mongooseSchema[key]);
      }
    }
  }

  /**
   * Function that converts json-schema to mongoose-schema
   */
  module.exports.mongooseSchemaBuilder = function (schema) {
    let mongooseSchemaObject = new mongoose.Schema(schema);
    mongooseSchemaObject.post("save", async function () {
      return (db2api(schema))(this);
    });
    mongooseSchemaObject.post("init", db2api(schema));
    return mongooseSchemaObject;
  };

  /**
   * Function that converts database objects to API objects
   */
  function db2api(schema) {
    let removeDB = db => {
      fixDates(db, schema);
      db.toObject = () => {
        let api = JSON.parse(JSON.stringify(db));
        removeDBVersion(api);
        removeDBid(api, schema);
        return api;
      };
      return db;
    };
    return removeDB;
  }
  module.exports.db2api = db2api;

  function removeDBVersion(api) {
    if (api) {
      if (typeof api.__v !== "undefined") {
        delete api.__v;
      }
      Object.keys(api).forEach(key => {
        if (key && typeof api[key] == "object") {
          removeDBVersion(api[key]);
        }
      });
    }
  }

  function removeDBid(api, schema) {
    if (api) {
      if (schema._id && schema._id.lowercase) {
        delete api._id;
      }
      Object.keys(api).forEach(key => {
        if (key && typeof api[key] == "object" && schema[key]) {
          removeDBid(api[key], (schema[key] ? schema[key] : {}));
        }
      });
    }
  }

  /*
   * Function that builds an aggregation pipeline array from filter and pagination
   */
  module.exports.aggregate = function (filter, pagination) {
    let aggregation = [];
    getParenthesis(filter + ")", 0, value => aggregation.push({
      "$match": value
    }));
    aggregation.push({
      "$skip": pagination.start
    });
    aggregation.push({
      "$limit": pagination.amount
    });
    return aggregation;
  };

  function getParenthesis(filter, start, callback) {
    let parts = [];
    let current = 0;
    let objectStart = -1;
    let brackets = 0;
    let quotes = false;
    let doubleQuotes = false;
    let backslashs = false;
    let i;
    for (i = start; i < filter.length; ++i) {
      let char = filter.substr(i, 1);
      if (char === " " && !backslashs && !quotes && !doubleQuotes && brackets === 0) {
        if (objectStart > -1) {
          let part = filter.substring(objectStart, i);
          if (part.toLowerCase() === "not") {
            if (current === 0) {
              ++current;
            }
            parts[current++] = "$not";
          } else {
            try {
              parts[current] = JSON.parse(part);
              if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g.test(parts[current])) {
                parts[current] = new Date(parts[current]);
              }
            } catch (e) {
              parts[current] = "$" + (part.toLowerCase() === "and" || part.toLowerCase() === "or" ? part.toLowerCase() : part);
            }
            ++current;
          }
          objectStart = -1;
        }
      } else {
        if (objectStart === -1) {
          objectStart = i;
        }
        if (char === "\\") {
          backslashs = !backslashs;
        } else {
          switch (char) {
            case "'":
              if (!backslashs) {
                if (quotes) {
                  filter = filter.substr(0, objectStart) + '"' +
                    filter.substring(objectStart + 1, i).replace(/"/g, '\\"') +
                    '"' + filter.substr(i + 1);
                }
                quotes = !quotes;
              }
              break;
            case '"':
              if (!backslashs) {
                doubleQuotes = !doubleQuotes;
              }
              break;
            case "{":
              if (!quotes && !doubleQuotes && !backslashs) {
                ++brackets;
              }
              break;
            case "}":
              if (!quotes && !doubleQuotes && !backslashs) {
                --brackets;
              }
              break;
            case "(":
              if (!quotes && !doubleQuotes && !backslashs) {
                i = getParenthesis(filter, i + 1, value => {
                  parts[current++] = value;
                });
                objectStart = -1;
              }
              break;
            case ")":
              if (!quotes && !doubleQuotes && !backslashs) {
                if (objectStart) {
                  let part = filter.substring(objectStart, i);
                  if (current === 0 && part.toLowerCase() === "not") {
                    parts[current++] = "$not";
                  } else {
                    try {
                      parts[current] = JSON.parse(part);
                      if (/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g.test(parts[current])) {
                        parts[current] = new Date(parts[current]);
                      }
                    } catch (e) {
                      parts[current] = "$" + part;
                    }
                  }
                }
                let object = {};
                switch (parts[1] && parts[1].toLowerCase()) {
                  case "$and":
                  case "$or":
                    let expressions = [parts[0], parts[2]];
                    for (let i = 4; i < parts.length; i += 2) {
                      if (parts[i - 1].toLowerCase() === parts[1].toLowerCase()) {
                        expressions.push(parts[i]);
                      } else {
                        break;
                      }
                    }
                    object[parts[1].toLowerCase()] = expressions;
                    break;
                  case "$not":
                    object.$not = [parts[2]];
                    break;
                  default:
                    object[parts[0] && parts[0].substr(1)] = {};
                    object[parts[0] && parts[0].substr(1)][parts[1]] = parts[2];
                    break;
                }
                callback(object);
                return i;
              }
              break;
          }
          backslashs = false;
        }
      }
    }
    return i;
  }

  function getProperties(object, examples, required, properties, name, schemas) {
    if (!properties) {
      properties = {};
    }
    if (!schemas) {
      schemas = {};
    }
    if (typeof name === "undefined") {
      name = "";
    }
    if (object.required && required) {
      object.required.forEach(r => {
        required.push(name + r);
      });
    }
    if (object.properties) {
      Object.keys(object.properties).forEach(p => {
        let prop = object.properties[p];
        if (typeof prop !== "undefined") {
          if (prop.id) {
            if (schemas[prop.id]) {
              prop = schemas[prop.id];
              object.properties[p] = prop;
            } else {
              schemas[prop.id] = prop;
            }
          }
          while (prop.items) {
            let pro = prop.items;
            if (pro.id) {
              if (schemas[pro.id]) {
                pro = schemas[pro.id];
                prop.items = pro;
              } else {
                schemas[pro.id] = pro;
              }
            }
            prop = pro;
          }
          if (examples && !prop.example) {
            try {
              prop.example = examples[prop.id] || jsf.generate(clone(prop));
              if (prop.id) {
                examples[prop.id] = prop.example;
              }
            } catch (e) {
              //do nothing
            }
          }
          properties[name + p] = clone(prop);
          if (prop.type === "object") {
            getProperties(prop, examples, required, properties, name + p + ".", schemas);
          } else {
            if (prop.type === "array") {
              if (prop.items) {
                getProperties(prop.items, examples, required, properties, name + p + ".", schemas);
              }
            }
          }
        }
      });
    } else {
      if (object.items) {
        getProperties(object.items, examples, required, properties, name, schemas);
      }
    }
    return properties;
  }

  function notIncluded(properties, reqs) {
    reqs.forEach(req => {
      delete properties[req];
    });
    return Object.keys(properties);
  }

  function fixReqs(node, reqs, properties) {
    let op = [];
    reqs.forEach(r => {
      let n = {};
      fixRequired(n, r, properties);
      if (r.path || typeof r === 'string') {
        n.title = (r.path ? r.path : r);
      }
      op.push(n);
    });
    return op;
  }

  function fixRequired(node, req, properties) {
    let reqs;
    let min;
    let max;
    if (typeof req === "string") {
      reqs = req;
    } else {
      if (req.type === "array") {
        reqs = req.path;
        min = req.minItems;
        max = req.maxItems;
      } else {
        if (req.type === "logical") {
          if (req.title) {
            node.title = req.title;
          }
          if (req.allOf) {
            node.allOf = fixReqs(node, req.allOf, properties);
          }
          if (req.anyOf) {
            node.anyOf = fixReqs(node, req.anyOf, properties);
          }
          if (req.oneOf) {
            node.oneOf = fixReqs(node, req.oneOf, properties);
          }
          if (req.not) {
            node.not = fixReqs(node, req.not, properties);
          }
          if (req.onlyOf) {
            node.properties = {};
            node.allOf = fixReqs(node, req.onlyOf, properties);
            node.not = {
              title: 'anything else',
              anyOf: fixReqs(node, notIncluded(properties, req.onlyOf), properties),
              properties: {}
            };
          }
          if (req.required) {
            req.required.forEach(req => {
              fixRequired(node, req, properties);
            });
          }
        }
        return;
      }
    }
    reqs = reqs.split('.');
    for (let r = reqs.shift(); r; r = reqs.shift()) {
      let newNode;
      if (reqs.length === 0) {
        if (req.type === "array") {
          if (!node.properties) {
            node.properties = {};
          }
          newNode = node.properties[r];
          if (!newNode) {
            newNode = {
              type: "array"
            };
            node.properties[r] = newNode;
          }
          newNode.minItems = min || newNode.minItems;
          newNode.maxItems = max || newNode.maxItems;
        } else {
          if (!node.required) {
            node.required = [];
          }
          node.required.push(r);
          if (!node.properties) {
            node.properties = {};
          }
          if (!node.properties[r]) {
            node.properties[r] = {};
          }
        }
        return;
      } else {
        if (!node.properties) {
          node.properties = {};
        }
        newNode = node.properties[r];
        if (!newNode) {
          newNode = {};
          node.properties[r] = newNode;
        }
        if (newNode.type === "array") {
          if (!newNode.items) {
            newNode.items = {};
          }
          while (newNode.items) {
            newNode = newNode.items;
          }
        }
        node = newNode;
        continue;
      }
    }
  }

})();