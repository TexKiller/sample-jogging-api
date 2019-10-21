/*jshint esversion: 8*/

(() => {
  'use strict';

  const auth = require("../auth"),
    users = require('../../../models/user').mongooseModel,
    sessions = require("../../../models/session").mongooseModel,
    runs = require("../../../models/run").mongooseModel,
    reports = require("../../../models/report").mongooseModel;

  module.exports = async function (req, res) {
    let loggedUser = await auth.user(req, res);
    if (loggedUser) {
      let oldUser;
      switch (loggedUser.role) {
        case "regular":
          if (req.body.userName) {
            return res.status(403).json({
              response: {
                status: "error",
                message: "The logged user is not allowed to modify other users",
                code: "NOT_ALLOWED",
                session: loggedUser.session
              }
            });
          }
          if (req.body.user.role) {
            return res.status(403).json({
              response: {
                status: "error",
                message: "The logged user is not allowed to modify user roles",
                code: "NOT_ALLOWED",
                session: loggedUser.session
              }
            });
          }
          oldUser = loggedUser;
          break;
        case "manager":
          if (req.body.user.role) {
            return res.status(403).json({
              response: {
                status: "error",
                message: "The logged user is not allowed to modify user roles",
                code: "NOT_ALLOWED",
                session: loggedUser.session
              }
            });
          }
          if (req.body.userName && req.body.userName !== loggedUser.name) {
            oldUser = await users.findOne({
              name: req.body.userName
            });
            if (!oldUser) {
              return res.status(404).json({
                response: {
                  status: "error",
                  message: "User with the specified name not found",
                  code: "USER_NOT_FOUND",
                  session: loggedUser.session
                }
              });
            }
            if (oldUser.role !== "regular") {
              return res.status(403).json({
                response: {
                  status: "error",
                  message: "The logged user is not allowed to modify this user",
                  code: "NOT_ALLOWED",
                  session: loggedUser.session
                }
              });
            }
          } else {
            oldUser = loggedUser;
          }
          break;
        case "admin":
          if (req.body.userName && req.body.userName !== loggedUser.name) {
            oldUser = await users.findOne({
              name: req.body.userName
            });
            if (!oldUser) {
              return res.status(404).json({
                response: {
                  status: "error",
                  message: "User with the specified name not found",
                  code: "USER_NOT_FOUND",
                  session: loggedUser.session
                }
              });
            } else {
              if (oldUser.role === "admin") {
                return res.status(403).json({
                  response: {
                    status: "error",
                    message: "The logged user is not allowed to modify this user",
                    code: "NOT_ALLOWED",
                    session: loggedUser.session
                  }
                });
              }
            }
          } else {
            oldUser = loggedUser;
          }
          break;
      }
      if (!req.body.user.role) {
        req.body.user.role = oldUser.role;
      } else {
        if (oldUser === loggedUser && req.body.user.role !== oldUser.role) {
          return res.status(403).json({
            response: {
              status: "error",
              message: "The logged user can't change its own role",
              code: "NOT_ALLOWED",
              session: loggedUser.session
            }
          });
        }
      }
      try {
        // Adding user to the collection and getting added document
        let newUser = await users.findOneAndUpdate({
          name: oldUser.name
        }, req.body.user, {
          new: true
        });
        if (newUser.name !== oldUser.name) {
          await sessions.updateMany({
            userName: oldUser.name
          }, {
            userName: newUser.name
          });
          await runs.updateMany({
            userName: oldUser.name
          }, {
            userName: newUser.name
          });
          await reports.updateMany({
            userName: oldUser.name
          }, {
            userName: newUser.name
          });
        }
        res.status(200).json({
          response: {
            status: "success",
            session: loggedUser.session
          }
        });
      } catch (e) {
        switch (e.code) {
          case 11000:
            // This is a Mongoose error that indicates there is already
            // a user with the specified name
            res.status(403).json({
              response: {
                status: "error",
                message: "There is already a user with the specified name",
                code: "ALREADY_EXISTS",
                session: loggedUser.session
              }
            });
            break;
          default:
            throw e;
        }
      }
    }
  };
})();