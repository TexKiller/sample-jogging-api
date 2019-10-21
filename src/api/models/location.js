/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/model/location',
    title: "Location",
    description: "Location specified by latitude and longitude",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      latitude: {
        type: "number",
        minimum: -90,
        maximum: 90
      },
      longitude: {
        type: "number",
        minimum: -90,
        maximum: 90
      }
    }
  };
})();