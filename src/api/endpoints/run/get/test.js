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
      userName: sampleUser.name,
      location: {
        latitude: 30.976108856695276,
        longitude: 74.93380951205927
      },
      time: new Date("2018-08-20T23:32:41.701Z"),
      length: 50,
      duration: 120,
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

    let sampleRun2 = {
      userName: sampleUser.name,
      location: {
        latitude: 30.976108856695276,
        longitude: 74.93380951205927
      },
      time: new Date("2018-08-21T23:32:41.701Z"),
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
    sampleRun2.weather.time = sampleRun2.time;

    let sampleRun3 = {
      userName: sampleUser.name,
      location: {
        latitude: 30.976108856695276,
        longitude: 74.93380951205927
      },
      time: new Date("2018-08-22T23:32:41.701Z"),
      length: 200,
      duration: 30,
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
    sampleRun3.weather.time = sampleRun3.time;

    let sampleRequestOptions1 = {
      method: model.method,
      body: {
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions2 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        pagination: {
          start: 0,
          amount: 2
        }
      }
    };

    let sampleRequestOptions3 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "length eq " + sampleRun1.length
      }
    };

    let sampleRequestOptions4 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "(length eq " + sampleRun1.length + ") or (time ne '" + sampleRun3.time.toISOString() + "') and (duration lt 120) and (length gt 50))"
      }
    };

    let sampleRequestOptions5 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "((("
      }
    };

    let sampleRequestOptions6 = {
      method: model.method,
      body: {
        session: sampleUserSession.token,
        filter: "$eq eq " + sampleRun1.length
      }
    };

    it('return 200 HTTP status code when regular user lists its own runs', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.runs, null, "return runs");
      assert.equal(ret.runs.length, 3, "return 3 runs");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user lists its own runs with pagination', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions2),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.runs, null, "return runs");
      assert.equal(ret.runs.length, 2, "return 2 runs");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user filters its own runs', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions3),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.runs, null, "return runs");
      assert.equal(ret.runs.length, 1, "return 1 run");
      assert.notEqual(ret.runs[0], null, "first run");
      assert.equal(ret.runs[0].time, sampleRun1.time.toISOString(), "first run time");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user filters its own runs using all required operations and fields', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions4),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(ret.runs, null, "return runs");
      assert.equal(ret.runs.length, 2, "return 2 runs");
      assert.notEqual(ret.runs[0], null, "first run");
      assert.notEqual(ret.runs[0].time, sampleRun3.time.toISOString(), "first run time");
      assert.notEqual(ret.runs[1], null, "second run");
      assert.notEqual(ret.runs[1].time, sampleRun3.time.toISOString(), "second run time");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

    it('return 400 HTTP status code and "INVALID_REQUEST" response code when passing filter with invalid syntax', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions5),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 400, "status code");
      assert.equal(ret.response.code, "INVALID_REQUEST", "response code");
      assert.equal(ret.runs, null, "not return runs");
      assert.notEqual(session, null, "session in db");
      assert.equal(session.token, sampleUserSession.token, "keep session token");
      assert.equal(ret.response.session, undefined, "don't return session token");
    });

    it('return 403 HTTP status code and "INVALID_FILTER" response code when passing filter with invalid components', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions6),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await runs.create(sampleRun1);
      await runs.create(sampleRun2);
      await runs.create(sampleRun3);
      await sessions.create(sampleUserSession);
      await controller(req, res);
      let session = await sessions.findOne({
        userName: sampleUser.name
      });
      let ret = JSON.parse(res._getData());

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(ret.response.code, "INVALID_FILTER", "response code");
      assert.equal(ret.runs, null, "not return runs");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(ret.response.session, session.token, "return new session token");
    });

  });

})();