/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    user = require('../../../models/user').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema;

  module.exports = {
    title: "User Registration",
    description: "Registers a new user",
    href: "/user",
    method: "POST",
    schema: modelFunctions.fixRequired({
      id: '/user/post/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        user: user
      },
      required: [
        'user',
        'user.name',
        'user.password',
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/user/post/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response
      },
      required: ["response"],
      additionalProperties: false
    })
  };
  delete module.exports.schema.properties.user.properties.role;
})();