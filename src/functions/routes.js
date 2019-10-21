/*jshint esversion: 8*/

(() => {

  'use strict';

  const Validator = require('jsonschema').Validator,
    v = new Validator(),
    fileFunctions = require('./file'),
    models = {},
    controllers = {},
    jsf = require('json-schema-faker'),
    systemFunctions = require("./system"),
    modelFunctions = require("./model");

  jsf.option({
    alwaysFakeOptionals: true
  });
  jsf.option({
    fixedProbabilities: true
  });
  jsf.option({
    optionalsProbability: 1.0
  });

  function validate(href, method, requestBody) {
    let model = (models[href] ? models[href][method] : false);
    if (model) {
      modelFunctions.fixDates(requestBody, model.schema);
      return v.validate(requestBody, model.schema);
    } else {
      return {
        "instance": requestBody,
        "propertyPath": "instance",
        "errors": [{
          "property": "instance",
          "message": `model for method ${method} of '${href}' not found`,
          "instance": requestBody
        }],
        "disableFormat": false
      };
    }
  }

  function validateResponse(href, method, requestBody) {
    let model = (models[href] ? models[href][method] : false);
    if (model) {
      if (model.targetSchema) {
        return v.validate(requestBody, model.targetSchema);
      } else {
        return {
          errors: []
        };
      }
    } else {
      return {
        "instance": requestBody,
        "propertyPath": "instance",
        "errors": [{
          "property": "instance",
          "message": `model for the response of method ${method} of '${href}' not found`,
          "instance": requestBody
        }],
        "disableFormat": false
      };
    }
  }

  let handleRequest = function (path) {
    return async (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method.toLowerCase() === "options") {
        return res.status(200).send();
      }

      if (req.body) {
        req.body = JSON.stringify(req.body);
        if (req.body === "{}" && req.query.data) {
          req.body = req.query.data;
        }
        req.body = JSON.parse(req.body);
      } else {
        req.body = {};
      }
      for (let q in req.query) {
        req.body[q] = req.query[q];
      }
      let val = validate(path, req.method.toLowerCase(), req.body);
      let ret;
      if (val.errors.length === 0) {
        if (req.connection && typeof req.body === "object") {
          req.body.ip = req.connection.remoteAddress;
        }
        let n = Math.random();
        await new Promise(async (resolve, reject) => {
          let backJson = res.json;
          res.json = body => {
            let valRes = validateResponse(path, req.method.toLowerCase(), body);
            let result;
            if (valRes.errors.length === 0) {
              result = backJson.apply(res, [body]);
            } else {
              ret = {
                response: {
                  status: "error",
                  message: "Internal server error",
                  code: "INTERNAL_SERVER_ERROR",
                  session: res.session
                }
              };
              if (!systemFunctions.env("PRODUCTION")) {
                ret.response.error = valRes;
              }
              result = backJson.apply(res.status(500), [ret]);
            }
            resolve();
            return result;
          };
          let backSend = res.send;
          res.send = value => {
            let result;
            if (typeof value === "object") {
              result = res.json(value);
            } else {
              result = backSend.apply(res, [value]);
            }
            resolve();
            return result;
          };
          try {
            await controllers[path][req.method.toLowerCase()](req, res);
          } catch (e) {
            ret = {
              response: {
                status: "error",
                message: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
                session: res.session
              }
            };
            if (!systemFunctions.env("PRODUCTION")) {
              ret.response.error = e instanceof Error ? JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e))) : e;
            }
            backJson.apply(res.status(500), [ret]);
            resolve();
          }
        });
      } else {
        ret = {
          response: {
            status: "error",
            message: "Invalid request",
            code: "INVALID_REQUEST",
            session: res.session
          }
        };
        if (!systemFunctions.env("PRODUCTION") || systemFunctions.env("PRODUCTION_INVALID_REQUEST_ERROR")) {
          ret.response.error = val;
        }
        res.status(400).json(ret);
      }
    };
  };

  module.exports = function (routes) {

    if (!routes) {
      routes = {};
    }

    fileFunctions.walkSync("./", "types").forEach(file => {
      if (file.endsWith("/")) {
        fileFunctions.walkSync(file + "models/", ".js").forEach(file => {
          file = file.replace("./functions/", "./");
          let format = require(file).format;
          if (format && typeof format === "function") {
            v.customFormats[file.substr("./models/".length)] = format;
          } else {
            //throw `File '${file}' is not a valid format.\n\nContent: ${format}`;
          }
        });
      }
    });

    // navigate the api/endpoints folder and register models in models array
    fileFunctions.walkSync("./", "model.js").forEach(file => {
      file = file.replace("./src/", "../");
      let model = require(file + "model");
      if (model && model.href && model.method && model.schema) {
        if (!models[model.href]) {
          models[model.href] = {};
          controllers[model.href] = {};
        }
        models[model.href][model.method.toLowerCase()] = model;
        try {
          controllers[model.href][model.method.toLowerCase()] = require(file + "controller");
        } catch (e) {
          if (e.message.indexOf("Cannot find module '" + file + "controller'") > -1) {
            controllers[model.href][model.method.toLowerCase()] = function (req, res) {
              let response = jsf.generate(model.targetSchema);
              response.response = {
                status: "success",
                message: "Controller not found, so returning randomly mocked response"
              };
              res.status(200).json(response);
            };
          } else {
            controllers[model.href][model.method.toLowerCase()] = function (req, res) {
              let ret = {
                response: {
                  status: "error",
                  message: "Error when loading endpoint controller",
                  code: "INTERNAL_SERVER_ERROR"
                }
              };
              if (!process.env.PRODUCTION) {
                ret.response.error = e;
              }
              res.status(500).json(ret);
            };
          }
        }
        if (typeof routes.route === "function") {
          routes.route(model.href)[model.method.toLowerCase()](handleRequest(model.href));
        } else {
          routes[model.href.substr(1)] = handleRequest(model.href);
        }
      } else {
        //throw `File '${file}' is not a valid schema.\n\nContent: ${schema}`;
      }
    });

    return routes;
  };

})();