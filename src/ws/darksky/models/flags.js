/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/ws/darksky/model/flags',
    title: "Flags",
    description: "Various metadata information related to the request",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      "darksky-unavailable": {
        description: 'The presence of this property indicates that the Dark Sky data source supports the given location, but a temporary error (such as a radar station being down for maintenance) has made the data unavailable.'
      },
      "nearest-station": {
        type: 'number',
        description: "The distance to the nearest weather station that contributed data to this response. Note, however, that many other stations may have also been used; this value is primarily for debugging purposes. This property's value is in miles (if US units are selected) or kilometers (if SI units are selected)."
      },
      sources: {
        type: 'array',
        description: 'Array of IDs for each data source utilized in servicing this request.',
        items: {
          type: 'string'
        }
      },
      severity: {
        type: 'string',
        description: 'The severity of the weather alert. Will take one of the following values: "advisory" (an individual should be aware of potentially severe weather), "watch" (an individual should prepare for potentially severe weather), or "warning" (an individual should take immediate action to protect themselves and others from potentially severe weather).',
        enum: [
          "advisory",
          "watch",
          "warning"
        ]
      },
      units: {
        type: 'string',
        description: 'The units which were used for the data in this request.',
        enum: [
          "ca",
          "uk2",
          "us",
          "si"
        ]
      },
      "cache-control": {
        type: 'string',
        description: 'Set to a conservative value for data caching purposes based on the data present in the response body.'
      },
      "forecast-api-calls": {
        type: 'integer',
        description: 'The number of API requests made by the given API key for today.'
      },
      "response-time": {
        format: 'date-time',
        description: 'The server-side response time of the request.'
      }
    },
    additionalProperties: false
  };
})();