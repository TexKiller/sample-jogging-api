/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require('../auth'),
    users = require('../../../models/user').mongooseModel,
    sessions = require('../../../models/session').mongooseModel,
    runs = require('../../../models/run').mongooseModel,
    reports = require('../../../models/report').mongooseModel;

  module.exports = async function (req, res) {
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      if (loggedUser.role === "regular") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user is not allowed to delete users",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      let user = await users.findOne({
        name: req.body.userName
      });
      if (!user) {
        return res.status(404).json({
          response: {
            status: "error",
            message: "There is no user registered with the specified name",
            code: "USER_NOT_FOUND",
            session: loggedUser.session
          }
        });
      }
      if (loggedUser.role === "manager" && user.toObject().role !== "regular") {
        return res.status(403).json({
          response: {
            status: "error",
            message: "Managers are only allowed to delete regular users",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      if (loggedUser.name === user.toObject().name) {
        return res.status(403).json({
          response: {
            status: "error",
            message: "The logged user can't delete its own user",
            code: "NOT_ALLOWED",
            session: loggedUser.session
          }
        });
      }
      await user.remove();
      res.status(200).json({
        response: {
          status: "success",
          session: loggedUser.session
        }
      });
    }
  };
})();