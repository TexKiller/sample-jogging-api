/*jshint esversion: 8*/

(() => {

  'use strict';

  const assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    model = require('./model'),
    controller = require('../../../../functions/routes')()[model.href.substr(1)],
    userModel = require('../../../models/user'),
    users = userModel.mongooseModel,
    sessionModel = require('../../../models/session'),
    sessions = sessionModel.mongooseModel,
    runModel = require('../../../models/run'),
    runs = runModel.mongooseModel,
    reports = require('../../../models/report').mongooseModel,
    modelFunctions = require("../../../../functions/model"),
    systemFunctions = require("../../../../functions/system");

  describe(model.title, () => {

    let sampleUser = {
      name: "test user",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser = userModel.api2db(sampleUser);

    let sampleUserSession = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleUser.name
    };
    sampleUserSession = sessionModel.api2db(sampleUserSession);

    let sampleUser2 = {
      name: "test user 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser2 = userModel.api2db(sampleUser2);

    let sampleUserSession2 = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleUser2.name
    };
    sampleUserSession2 = sessionModel.api2db(sampleUserSession2);

    let sampleManager = {
      name: "test manager",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "manager"
    };
    sampleManager = userModel.api2db(sampleManager);

    let sampleManagerSession = {
      token: "da6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleManager.name
    };
    sampleManagerSession = sessionModel.api2db(sampleManagerSession);

    let sampleAdmin = {
      name: "test admin",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin = userModel.api2db(sampleAdmin);

    let sampleAdminSession = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleAdmin.name
    };
    sampleAdminSession = sessionModel.api2db(sampleAdminSession);

    let sampleRun1 = {
      location: {
        latitude: 30.976108856695276,
        longitude: 74.93380951205927
      },
      time: new Date("2018-08-20T23:32:41.701Z"),
      length: 100,
      duration: 60,
      weather: {
        summary: "Humid and Overcast",
        icon: "cloudy",
        precipIntensity: 0.0121,
        precipProbability: 0.08,
        precipType: "rain",
        temperature: 81.89,
        apparentTemperature: 89.63,
        dewPoint: 76.72,
        humidity: 0.84,
        pressure: 998.99,
        windSpeed: 7.48,
        windGust: 17.49,
        windBearing: 136,
        cloudCover: 0.99,
        uvIndex: 0,
        visibility: 10,
        ozone: 270.8
      }
    };
    sampleRun1.weather.time = sampleRun1.time;

    let sampleRun1DB = runModel.api2db(modelFunctions.clone(sampleRun1, {
      userName: sampleUser.name
    }));

    let sampleReport1 = {
      userName: sampleUser.name,
      firstDate: "2018-08-19",
      length: sampleRun1.length,
      duration: sampleRun1.duration,
      speed: sampleRun1.length / sampleRun1.duration
    };

    let sampleRequestOptions1 = {
      method: model.method,
      body: {
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions2 = {
      method: model.method,
      body: {
        session: sampleUserSession2.token
      }
    };

    let sampleRequestOptions3 = {
      method: model.method,
      body: {
        session: sampleManagerSession.token
      }
    };

    let sampleRequestOptions4 = {
      method: model.method,
      body: {
        session: sampleAdminSession.token
      }
    };

    it('return 200 HTTP status code when regular user deletes its own run', async () => {
      await users.create(sampleUser);
      let firstRun = (await (runs.create(sampleRun1DB))).toObject();
      await reports.create(sampleReport1);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions1, {
          body: {
            firstDate: sampleReport1.firstDate
          }
        })),
        res = httpMocks.createResponse();

      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findById(firstRun.id);
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(report, null, "report not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it("return 200 HTTP status code when admin deletes regular user's run", async () => {
      await users.create(sampleUser);
      let firstRun = (await (runs.create(sampleRun1DB))).toObject();
      await reports.create(sampleReport1);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions4, {
          body: {
            firstDate: sampleReport1.firstDate,
            userName: sampleReport1.userName
          }
        })),
        res = httpMocks.createResponse();

      await users.create(sampleAdmin);
      await sessions.create(sampleAdminSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findById(firstRun.id);
      let session = await sessions.findOne({
        userName: sampleAdmin.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(report, null, "report not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 404 HTTP status code and "REPORT_NOT_FOUND" response code when regular user tries to delete non-existing report', async () => {
      await users.create(sampleUser);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions1, {
          body: {
            firstDate: sampleReport1.firstDate
          }
        })),
        res = httpMocks.createResponse();

      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 404, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "REPORT_NOT_FOUND", "response code");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to delete other user\'s report', async () => {
      await users.create(sampleUser);
      let firstRun = (await (runs.create(sampleRun1DB))).toObject();
      await reports.create(sampleReport1);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions2, {
          body: {
            firstDate: sampleReport1.firstDate,
            userName: sampleReport1.userName
          }
        })),
        res = httpMocks.createResponse();

      await users.create(sampleUser2);
      let session = await sessions.create(sampleUserSession2);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findById(firstRun.id);
      session = await sessions.findOne({
        userName: sampleUser2.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(dbRun, null, "run in db");
      assert.notEqual(report, null, "report in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession2.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when manager tries to delete other user\'s report', async () => {
      await users.create(sampleUser);
      let firstRun = (await (runs.create(sampleRun1DB))).toObject();
      await reports.create(sampleReport1);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions3, {
          body: {
            firstDate: sampleReport1.firstDate,
            userName: sampleReport1.userName
          }
        })),
        res = httpMocks.createResponse();

      await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findById(firstRun.id);
      session = await sessions.findOne({
        userName: sampleManager.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(dbRun, null, "run in db");
      assert.notEqual(report, null, "report in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 401 HTTP status code and "INVALID_SESSION" response code when passing wrong session token', async () => {
      await users.create(sampleUser);
      let firstRun = (await (runs.create(sampleRun1DB))).toObject();
      await reports.create(sampleReport1);

      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions1, {
          body: {
            firstDate: sampleReport1.firstDate
          }
        })),
        res = httpMocks.createResponse();

      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findById(firstRun.id);

      assert.equal(res.statusCode, 401, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_SESSION", "response code");
      assert.notEqual(dbRun, null, "run in db");
      assert.notEqual(report, null, "report in db");
      assert.equal(JSON.parse(res._getData()).response.session, undefined, "don't return session token");
    });

  });

})();