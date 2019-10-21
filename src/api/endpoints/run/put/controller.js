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
      let oldRun = await runs.findById(req.body.run._id);
      if (!oldRun) {
        return res.status(404).json({
          response: {
            status: "error",
            message: "Run with the specified id not found",
            code: "RUN_NOT_FOUND",
            session: loggedUser.session
          }
        });
      }
      if (oldRun.userName !== loggedUser.name && loggedUser.role !== "admin") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user is not allowed to modify this run",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      req.body.run.userName = oldRun.userName;
      newRun.weather = newRun.weather || (await (darkskyForecast(modelFunctions.clone(newRun.location, {
        include: ["currently"],
        time: newRun.time
      })))).currently;
      newRun = (await (runs.findByIdAndUpdate(newRun._id, newRun, {
        upsert: true,
        new: true
      }))).toObject();
      let firstDate = new Date(newRun.time);
      firstDate.setDate(firstDate.getDate() - firstDate.getDay());
      firstDate = new Date(firstDate.toISOString().substr(0, 10));
      let lastDate = new Date(firstDate);
      lastDate.setDate(lastDate.getDate() + 7);
      let total = (await (runs.aggregate([{
          "$match": {
            userName: newRun.userName,
            time: {
              "$gte": firstDate,
              "$lt": lastDate
            }
          }
        },
        {
          "$group": {
            _id: 1,
            length: {
              "$sum": "$length"
            },
            duration: {
              "$sum": "$duration"
            }
          }
        }
      ])))[0];
      let report = {
        userName: newRun.userName,
        firstDate: firstDate.toISOString().substr(0, 10),
        length: total.length,
        duration: total.duration,
        speed: total.length / total.duration
      };
      // Adding (or updating) report to the collection and getting added document
      await reports.findOneAndUpdate({
        userName: report.userName,
        firstDate: report.firstDate
      }, report, {
        upsert: true,
        new: true
      });
      let oldFirstDate = new Date(oldRun.time);
      oldFirstDate.setDate(firstDate.getDate() - firstDate.getDay());
      oldFirstDate = new Date(firstDate.toISOString().substr(0, 10));
      if (oldFirstDate.toISOString().substr(0, 10) !== firstDate.toISOString().substr(0, 10)) {
        firstDate = oldFirstDate;
        lastDate = new Date(firstDate);
        lastDate.setDate(lastDate.getDate() + 7);
        total = (await (runs.aggregate([{
            "$match": {
              userName: oldRun.userName,
              time: {
                "$gte": firstDate,
                "$lt": lastDate
              }
            }
          },
          {
            "$group": {
              _id: 1,
              length: {
                "$sum": "$length"
              },
              duration: {
                "$sum": "$duration"
              }
            }
          }
        ])))[0];
        if (total.length > 0) {
          let report = {
            userName: oldRun.userName,
            firstDate: firstDate.toISOString().substr(0, 10),
            length: total.length,
            duration: total.duration,
            speed: total.length / total.duration
          };
          // Adding (or updating) report to the collection and getting added document
          await reports.findOneAndUpdate({
            userName: report.userName,
            firstDate: report.firstDate
          }, report, {
            upsert: true,
            new: true
          });
        } else {
          await reports.findOneAndDelete({
            userName: oldRun.userName,
            firstDate: firstDate.toISOString().substr(0, 10)
          });
        }
      }
      delete newRun.userName;
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