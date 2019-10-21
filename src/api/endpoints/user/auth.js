/*jshint esversion: 8*/

(() => {
  'use strict';

  const sessions = require('../../models/session').mongooseModel,
    users = require('../../models/user').mongooseModel,
    crypto = require('crypto'),
    buffer = Buffer.alloc(16),
    SESSION_INACTIVITY_EXPIRATION_MILLISECONDS = 1 * 60 * 60 * 1000; // 1 hour

  /*
   * Gets the logged user's name from the session token
   */
  module.exports.session = async function (req, res) {
    let session = await sessions.findOne({
      token: req.body.session
    });
    if (session && new Date() - session.time > SESSION_INACTIVITY_EXPIRATION_MILLISECONDS) {
      await session.remove();
      session = false;
    }
    if (session) {
      let token = crypto.randomFillSync(buffer).toString('hex');
      let time = new Date();
      await session.updateOne({
        token: token,
        time: time
      });
      let sessionObject = session.toObject();
      sessionObject.token = token;
      sessionObject.time = time;
      res.session = token;
      return sessionObject;
    } else {
      res.status(401).json({
        response: {
          status: 'error',
          message: 'Invalid session token',
          code: 'INVALID_SESSION'
        }
      });
      return;
    }
  };

  /*
   * Gets the logged user from the session token
   */

  module.exports.user = async function (req, res) {
    let session = await module.exports.session(req, res);
    if (session) {
      let user = await users.findOne({
        name: session.userName
      });
      if (user) {
        let userObject = user.toObject();
        userObject.session = session.token;
        return userObject;
      } else {
        res.status(401).json({
          response: {
            status: 'error',
            message: 'The logged user was not found',
            code: 'USER_NOT_FOUND'
          }
        });
        return;
      }
    }
  };

})();