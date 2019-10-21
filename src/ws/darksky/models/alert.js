/*jshint esversion: 8*/

(() => {
  'use strict';

  module.exports.schema = {
    id: '/ws/darksky/model/alert',
    title: "Alert",
    description: "Severe weather warning issued for the requested location by a governmental authority",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description: 'A detailed description of the alert.'
      },
      expires: {
        format: 'date-time',
        description: 'The UNIX time at which the alert will expire.'
      },
      regions: {
        type: 'array',
        description: 'An array of strings representing the names of the regions covered by this weather alert.',
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
      time: {
        format: 'date-time',
        description: 'The UNIX time at which the alert was issued.'
      },
      title: {
        type: 'string',
        description: 'A brief description of the alert.'
      },
      uri: {
        format: 'uri',
        description: 'An HTTP(S) URI that one may refer to for detailed information about the alert.'
      }
    },
    additionalProperties: false
  };
})();