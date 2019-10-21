/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require("../../../../functions/model"),
        systemFunctions = require("../../../../functions/system");

  if (!systemFunctions.env("PRODUCTION") || systemFunctions.env("PRODUCTION_DOC")) {
    module.exports = {
      title: "Documentation",
      description: "Shows the API documentation",
      href: "/doc",
      method: "GET",
      schema: modelFunctions.fixRequired({
        id: '/endpoint/doc/get/request',
        "$schema": "http://json-schema.org/draft-04/schema#",
        type: "object",
        additionalProperties: false
      })
    };
  }
})();