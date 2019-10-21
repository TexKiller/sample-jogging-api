/*jshint esversion: 8*/

(() => {
  'use strict';

  const modelFunctions = require('../../functions/model'),
    user = require('./user').schema,
    location = require('./location').schema,
    darkskyForecast = require("../../ws/darksky/endpoints/forecast/get/model").model,
    mongoose = require('mongoose');

  module.exports.schema = {
    id: '/model/run',
    title: "Run",
    description: "Information about a run",
    "$schema": "http://json-schema.org/draft-04/schema#",
    type: 'object',
    properties: {
      id: {
        type: "string",
        description: "Hash string that uniquely identifies the run"
      },
      userName: user.properties.name,
      location: location,
      time: {
        format: "date-time",
        description: "Date and time of the run"
      },
      weather: modelFunctions.clone(darkskyForecast.targetSchema.properties.currently, {
        description: "The weather conditions on the time of the run"
      }),
      length: {
        type: "number",
        description: "Length of the run in meters",
        minimum: 1
      },
      duration: {
        type: "number",
        description: "Duration of the run in seconds",
        minimum: 1
      },
      path: {
        type: "array",
        description: "Array with the points that form the path of the run",
        minItems: 2,
        maxItems: 100,
        items: {
          type: "object",
          description: "One of the points of a path",
          properties: {
            location: location,
            time: {
              format: "date-time",
              description: "Date and time when this point was reached"
            }
          }
        }
      }
    },
    additionalProperties: false
  };

  module.exports.dbSchema = modelFunctions.clone(module.exports.schema, {
    href: "run",
    required: [
      'userName',
      'location',
      "location.latitude",
      "location.longitude",
      'time',
      "weather",
      "length",
      "duration",
      "path.location",
      "path.location.latitude",
      "path.location.longitude",
      "path.time"
    ]
  });
  delete module.exports.dbSchema.properties.id;

  module.exports.dbSchema = modelFunctions.fixRequired(module.exports.dbSchema);

  module.exports.mongooseSchema = modelFunctions.toMongooseSchema(module.exports.dbSchema);

  let mongooseSchemaObject = modelFunctions.mongooseSchemaBuilder(module.exports.mongooseSchema);
  /*mongooseObject.index({
      "$**": "text"
  });*/

  function api2db(run) {
    if (run) {
      if (run.id) {
        run._id = run.id;
        delete run.id;
      }
      if (run.path instanceof Array && run.path.length > 1 &&
        (typeof run.location === "undefined" ||
          typeof run.time === "undefined" ||
          typeof run.length === "undefined" ||
          typeof run.duration === "undefined")) {
        let previousPoint = run.path[0];
        if (typeof previousPoint !== "object" || typeof previousPoint.location !== "object" ||
          typeof previousPoint.location.latitude !== "number" ||
          typeof previousPoint.location.longitude !== "number" ||
          !(previousPoint.time instanceof Date)) {
          return run;
        }
        let latitude = previousPoint.location.latitude;
        let longitude = previousPoint.location.longitude;
        let time = +previousPoint.time;
        let length = 0;
        for (let p = 1; p < run.path.length; ++p) {
          let point = run.path[p];
          if (typeof point === "object" && typeof point.location === "object" &&
            typeof point.location.latitude === "number" &&
            typeof point.location.longitude === "number" &&
            point.time instanceof Date &&
            point.time > previousPoint.time) {
            latitude += point.location.latitude;
            longitude += point.location.longitude;
            time += +point.time;
            let aux = Math.pow(Math.sin(Math.PI *
                (point.location.latitude -
                  previousPoint.location.latitude) /
                180), 2) +
              Math.cos(Math.PI * point.location.latitude / 180) *
              Math.cos(Math.PI * previousPoint.location.latitude / 180) *
              Math.pow(Math.sin(Math.PI *
                (point.location.longitude -
                  previousPoint.location.longitude) /
                180), 2);
            length += 12742e3 * Math.atan2(Math.sqrt(aux), Math.sqrt(1 - aux));
            previousPoint = point;
          } else {
            return run;
          }
        }
        run.location = {
          latitude: latitude / run.path.length,
          longitude: longitude / run.path.length
        };
        run.time = new Date(time / run.path.length);
        run.length = length / run.path.length;
        run.duration = (run.path[run.path.length - 1].time - run.path[0].time) / 1000;
      }
    }
    return run;
  }
  module.exports.api2db = api2db;
  mongooseSchemaObject.pre("validate", async function () {
    return api2db(this);
  });
  mongooseSchemaObject.pre("save", async function () {
    if (this.path && this.path.length === 0) {
      this.path = undefined;
    }
  });

  let db2api = run => {
    if (run._id) {
      run.id = JSON.parse(JSON.stringify(run._id));
      delete run._id;
    }
    let toObjectBackup = run.toObject;
    run.toObject = function () {
      let object = toObjectBackup.call(this);
      object.id = this.id;
      return object;
    };
    return run;
  };
  module.exports.db2api = db2api;
  mongooseSchemaObject.post("init", function () {
    return db2api(this);
  });
  mongooseSchemaObject.post("save", function async () {
    return db2api(this);
  });

  module.exports.mongooseSchemaObject = mongooseSchemaObject;

  module.exports.mongooseModel = mongoose.model(module.exports.dbSchema.href, module.exports.mongooseSchemaObject);
})();