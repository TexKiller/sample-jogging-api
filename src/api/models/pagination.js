/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/model/pagination',
    title: "Pagination",
    description: "Pagination options for a list",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      start: {
        type: "integer",
        description: "Index of the first item to include in the page",
        minimum: 0,
        default: 0
      },
      amount: {
        type: "integer",
        description: "Amount of items to include in the page",
        minimum: 1,
        default: 20
      }
    }
  };
})();