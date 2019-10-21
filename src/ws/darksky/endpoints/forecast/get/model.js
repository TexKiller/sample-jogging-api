/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../../../../functions/model'),
    location = require('../../../../../api/models/location').schema,
    alert = require('../../../models/alert').schema,
    dataPoint = require('../../../models/dataPoint').schema,
    dataBlock = require('../../../models/dataBlock').schema,
    flags = require('../../../models/flags').schema,
    ws = require('../../../../../functions/ws'),
    darkskyWs = require('../../../ws'),
    systemFunctions = require('../../../../../functions/system'),
    apiKey = systemFunctions.env("DARKSKY_API_KEY");

  const schema = {
    title: "Weather Forecast or History",
    description: "Query for weather forecast or historical data on a location and time",
    href: "/forecast",
    method: "GET",
    schema: modelFunctions.fixRequired({
      id: '/ws/darksky/endpoint/forecast/get/request',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: modelFunctions.clone(location.properties, {
        include: {
          type: "array",
          items: {
            type: "string",
            enum: ["currently", "minutely", "hourly", "daily", "alerts", "flags"],
            minItems: 1,
            maxItems: 5,
            uniqueItems: true
          }
        },
        time: {
          format: 'date-time',
          description: 'Date and time of the data',
          default: () => new Date()
        }
      }),
      required: [
        'latitude',
        'longitude',
        'include'
      ],
      additionalProperties: false
    }),
    targetSchema: modelFunctions.fixRequired({
      id: '/ws/darksky/endpoint/forecast/get/response',
      "$schema": "http://json-schema.org/draft-04/schema#",
      type: "object",
      properties: modelFunctions.clone(location.properties, {
        timezone: {
          type: "string",
          description: "The IANA timezone name for the requested location. This is used for text summaries and for determining when hourly and daily data block objects begin."
        },
        currently: dataPoint,
        hourly: dataBlock,
        daily: dataBlock,
        alerts: {
          type: "array",
          description: "An alerts array, which, if present, contains any severe weather alerts pertinent to the requested location.",
          items: alert
        },
        flags: flags,
        offset: {
          type: "number",
          description: "The current timezone offset in hours. (Use of this property will almost certainly result in Daylight Saving Time bugs. Please use timezone, instead.)"
        }
      }),
      additionalProperties: false
    })
  };

  function dateToUnix(object, property) {
    if (object && object[property] && object[property] instanceof Date) {
      object[property] = Math.round(object[property] / 1000);
    }
  }

  function unixToDate(object, property) {
    if (object && object[property]) {
      object[property] = new Date(object[property] * 1000);
    }
  }

  module.exports = ws(schema, darkskyWs, (requestBody, options) => {
    if (!apiKey) {
      throw new Error("DarkSky API KEY not set (DARKSKY_API_KEY" +
        (typeof global.it === "function" ?
          "_TESTING" :
          "") + " environment property)");
    }
    dateToUnix(requestBody, "time");
    options.path = "/forecast/" +
      apiKey +
      "/" + requestBody.latitude +
      "," + requestBody.longitude +
      (requestBody.time ? "," + requestBody.time : "");
    delete requestBody.latitude;
    delete requestBody.longitude;
    delete requestBody.time;
    let exclude = [];
    schema.schema.properties.include.items.enum.forEach(item => {
      if (requestBody.include.indexOf(item) == -1) {
        exclude.push(item);
      }
    });
    delete requestBody.include;
    if (exclude.length > 0) {
      requestBody.exclude = exclude.join(",");
    }
  }, (responseBody, response) => {
    [
      responseBody.currently,
      responseBody.hourly,
      responseBody.daily
    ].forEach(db => {
      if (db) {
        (db.data || [db]).forEach(dp => {
          unixToDate(dp, "apparentTemperatureHighTime");
          unixToDate(dp, "apparentTemperatureLowTime");
          unixToDate(dp, "apparentTemperatureMaxTime");
          unixToDate(dp, "apparentTemperatureMinTime");
          unixToDate(dp, "precipIntensityMaxTime");
          unixToDate(dp, "sunriseTime");
          unixToDate(dp, "sunsetTime");
          unixToDate(dp, "temperatureHighTime");
          unixToDate(dp, "temperatureLowTime");
          unixToDate(dp, "temperatureMaxTime");
          unixToDate(dp, "temperatureMinTime");
          unixToDate(dp, "time");
          unixToDate(dp, "uvIndexTime");
        });
      }
    });
    (responseBody.alerts || []).forEach(alert => {
      unixToDate(alert, "expires");
      unixToDate(alert, "time");
    });
    if (responseBody.flags) {
      responseBody.flags["cache-control"] = response.headers.get("cache-control");
      responseBody.flags["forecast-api-calls"] = response.headers.get("X-Forecast-API-Calls") - 0;
      responseBody.flags["response-time"] = response.headers.get("X-Response-Time") - 0;
      unixToDate(responseBody.flags, "response-time");
    }
  });
})();