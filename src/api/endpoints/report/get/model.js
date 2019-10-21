/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../functions/model'),
    report = require('../../../models/report').schema,
    response = require('../../../models/response').schema,
    session = require('../../../models/session').schema,
    pagination = require('../../../models/pagination').schema,
    pages = require('../../../models/pages').schema,
    filter = require('../../../models/filter').schema;

  module.exports = {
    title: "Report Listing",
    description: "Lists all reports from a user (for the owner and admins only)",
    href: "/report",
    method: "GET",
    schema: modelFunctions.fixRequired({
      id: '/report/get/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        session: session,
        pagination: pagination,
        filter: filter,
        userName: modelFunctions.clone(report.properties.userName, {
          description: "List reports from the user with this name (for admins only)"
        })
      },
      required: [
        "session",
        "pagination.start",
        "pagination.amount"
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/report/get/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: {
        response: response,
        reports: {
          type: "array",
          items: report
        },
        pages: pages
      },
      required: [
        "response",
        "pages.first",
        "pages.last"
      ],
      additionalProperties: false
    })
  };
})();