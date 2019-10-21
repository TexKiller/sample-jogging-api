/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require("../../user/auth"),
    runModel = require('../../../models/run'),
    runs = runModel.mongooseModel,
    reports = require("../../../models/report").mongooseModel,
    darkskyForecast = require("../../../../ws/darksky/endpoints/forecast/get/model"),
    modelFunctions = require("../../../../functions/model");

  module.exports = async function (req, res) {
    let newRun = runModel.api2db(req.body.run);
    if (newRun.length < 1) {
      return res.status(400).json({
        response: {
          status: "error",
          message: "The run's length is too short",
          code: "INVALID_REQUEST"
        }
      });
    }
    if (newRun.duration < 1) {
      return res.status(400).json({
        response: {
          status: "error",
          message: "The run's duration is too short",
          code: "INVALID_REQUEST"
        }
      });
    }
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      newRun.weather = newRun.weather || (await (darkskyForecast(modelFunctions.clone(newRun.location, {
        include: ["currently"],
        time: newRun.time
      })))).currently;
      newRun = (await (runs.create(newRun))).toObject();
      let firstDate = new Date(newRun.time);
      firstDate.setDate(firstDate.getDate() - firstDate.getDay());
      let report = {
        userName: loggedUser.name,
        firstDate: firstDate.toISOString().substr(0, 10),
        length: newRun.length,
        duration: newRun.duration,
        speed: newRun.length / newRun.duration
      };
      try {
        // Adding report to the collection and getting added document
        report = (await (reports.create(report))).toObject();
      } catch (e) {
        switch (e.code) {
          case 11000:
            // This is a Mongoose error that indicates there is already
            // a report for the specified user and week
            report = await reports.findOne({
              userName: report.userName,
              firstDate: report.firstDate
            });
            report.length += newRun.length;
            report.duration += newRun.duration;
            report.speed = report.length / report.duration;
            report = (await (report.save())).toObject();
            break;
          default:
            throw e;
        }
      }
      res.status(200).json({
        response: {
          status: "success",
          session: loggedUser.session
        },
        run: newRun
      });
    }
  };
})();