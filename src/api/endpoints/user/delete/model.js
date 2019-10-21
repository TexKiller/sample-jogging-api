/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    user = require('../../../models/user').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema;

  module.exports = {
    title: "User Deletion",
    description: "Deletes a user and all its records (for managers and admins only)",
    href: "/user",
    method: "DELETE",
    schema: modelFunctions.fixRequired({
      id: '/user/delete/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        userName: user.properties.name,
        session: session
      },
      required: [
        'userName',
        'session'
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/user/delete/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response
      },
      required: ["response"],
      additionalProperties: false
    })
  };
})();