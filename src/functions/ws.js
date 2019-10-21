/*jshint esversion: 8*/

(() => {
  'use strict';

  const Validator = require('jsonschema').Validator,
    v = new Validator(),
    fetch = require('node-fetch'),
    modelFunctions = require("./model");

  /*
   * Returns a function that calls the web service specified by the schema
   */

  module.exports = function (model, ws, requestFilter, responseFilter) {
    let endpoint = async requestBody => {
      if (model && model.schema) {
        let val = v.validate(requestBody, model.schema);
        if (val.errors.length === 0) {
          if (model.targetSchema) {
            let options = (model.method === "GET" ? {
              method: "GET"
            } : {
              method: model.method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });
            if (requestFilter) {
              await requestFilter(requestBody, options);
            }
            let path = options.path || model.href;
            if (model.method === "GET") {
              path += "?";
              Object.keys(requestBody).forEach(parameter => {
                path += parameter + "=" +
                  encodeURIComponent(typeof requestBody[parameter] === "string" ?
                    requestBody[parameter] :
                    JSON.stringify(requestBody[parameter])) + "&";
              });
            }
            return fetch(ws.base + path, options).then(async response => {
              let responseBody = await response.json();
              if (responseFilter) {
                await responseFilter(responseBody, response);
              }
              modelFunctions.fixDates(responseBody);
              let retVal = v.validate(responseBody, model.targetSchema);
              if (retVal.errors.length === 0) {
                return responseBody;
              } else {
                throw retVal;
              }
            });
          } else {
            throw new Error(`schema for return body of endpoint not found`);
          }
        } else {
          throw val;
        }
      } else {
        throw new Error(`schema for endpoint not found`);
      }
    };
    endpoint.ws = ws;
    endpoint.model = model;
    return endpoint;
  };

})();