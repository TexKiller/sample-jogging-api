/*jshint esversion: 8*/

(() => {
  'use strict';

  const dataPoint = require('./dataPoint').schema;

  module.exports.schema = {
    id: '/ws/darksky/model/dataBlock',
    title: "Data Block",
    description: "The various weather phenomena occurring over a period of time",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      data: {
        type: "array",
        description: "An array of data points, ordered by time, which together describe the weather conditions at the requested location over time.",
        items: dataPoint
      },
      summary: {
        type: 'string',
        description: 'A human-readable text summary of this data block.'
      },
      icon: {
        type: 'string',
        description: 'A machine-readable text summary of this data block, suitable for selecting an icon for display.',
        enum: [
          "clear-day",
          "clear-night",
          "rain",
          "snow",
          "sleet",
          "wind",
          "fog",
          "cloudy",
          "partly-cloudy-day",
          "partly-cloudy-night"
        ]
      }
    },
    additionalProperties: false
  };
})();