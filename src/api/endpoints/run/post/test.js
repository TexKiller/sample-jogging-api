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
    mongoose = require("mongoose"),
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

    let sampleRun2 = {
      path: [{
          location: {
            latitude: -21.699805757060375,
            longitude: -65.12009228152989
          },
          time: new Date("2018-08-23T19:44:59.752Z")
        },
        {
          location: {
            latitude: -21.698805757060375,
            longitude: -65.12109228152989
          },
          time: new Date("2018-08-23T19:54:59.752Z")
        }
      ],
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

    let sampleRun2DB = runModel.api2db(modelFunctions.clone(sampleRun2));

    let sampleRun3 = {
      path: [{
          location: {
            latitude: -21.699805757060375,
            longitude: -65.12009228152989
          },
          time: new Date("2018-08-23T19:44:59.752Z")
        },
        {
          location: {
            latitude: -21.698805757060375,
            longitude: -65.12109228152989
          },
          time: new Date("2018-08-23T19:54:59.752Z")
        }
      ]
    };

    let sampleRun4 = {
      path: [{
          location: {
            latitude: -21.699805757060375,
            longitude: -65.12009228152989
          },
          time: new Date("2018-08-23T19:44:59.752Z")
        },
        {
          location: {
            latitude: -21.699806757060375,
            longitude: -65.12009328152989
          },
          time: new Date("2018-08-23T19:54:59.752Z")
        }
      ],
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
    sampleRun4.weather.time = sampleRun4.time;

    let sampleRun5 = {
      path: [{
          location: {
            latitude: -21.699805757060375,
            longitude: -65.12009228152989
          },
          time: new Date("2018-08-23T19:44:59.752Z")
        },
        {
          location: {
            latitude: -21.698805757060375,
            longitude: -65.12109228152989
          },
          time: new Date("2018-08-23T19:45:00.000Z")
        }
      ],
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
    sampleRun5.weather.time = sampleRun5.time;

    let sampleReport1 = {
      userName: sampleUser.name,
      firstDate: "2018-08-19",
      length: sampleRun1.length,
      duration: sampleRun1.duration,
      speed: sampleRun1.length / sampleRun1.duration
    };

    let sampleReport2 = {
      userName: sampleUser.name,
      firstDate: "2018-08-19",
      length: sampleRun2DB.length,
      duration: sampleRun2DB.duration,
      speed: sampleRun2DB.length / sampleRun2DB.duration
    };

    let sampleRequestOptions1 = {
      method: model.method,
      body: {
        run: sampleRun1,
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions2 = {
      method: model.method,
      body: {
        run: sampleRun2,
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions3 = {
      method: model.method,
      body: {
        run: sampleRun3,
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions4 = {
      method: model.method,
      body: {
        run: sampleRun4,
        session: sampleUserSession.token
      }
    };

    let sampleRequestOptions5 = {
      method: model.method,
      body: {
        run: sampleRun5,
        session: sampleUserSession.token
      }
    };

    it('return 200 HTTP status code when registering first run with average data', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let run = JSON.parse(res._getData()).run;
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun1.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(run, null, "run returned");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(run.id, dbRun.id, "same run returned and on db");
      assert.notEqual(report, null, "report in db");
      assert.equal(report.firstDate, sampleReport1.firstDate, "report first date on sunday");
      assert.equal(report.length, sampleReport1.length, "report length");
      assert.equal(report.duration, sampleReport1.duration, "report duration");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when registering first run with path data', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions2),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let run = JSON.parse(res._getData()).run;
      let dbRun = await runs.findOne({
        time: sampleRun2DB.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(run, null, "run returned");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(run.id, dbRun.id, "same run returned and on db");
      assert.notEqual(report, null, "report in db");
      assert.equal(report.firstDate, sampleReport2.firstDate, "report first date on sunday");
      assert.equal(report.length, sampleReport2.length, "report length");
      assert.equal(report.duration, sampleReport2.duration, "report duration");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when registering second run with average data', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await runs.create(sampleRun2DB);
      await reports.create(sampleReport2);
      await controller(req, res);
      let run = JSON.parse(res._getData()).run;
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun1.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(run, null, "run returned");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(run.id, dbRun.id, "same run returned and on db");
      assert.notEqual(report, null, "report in db");
      assert.equal(report.firstDate, sampleReport2.firstDate, "report first date on sunday");
      assert.equal(report.length, sampleReport1.length + sampleReport2.length, "report length");
      assert.equal(report.duration, sampleReport1.duration + sampleReport2.duration, "report duration");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when registering second run with path data', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions2),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await runs.create(sampleRun1);
      await reports.create(sampleReport1);
      await controller(req, res);
      let run = JSON.parse(res._getData()).run;
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun2DB.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(run, null, "run returned");
      assert.notEqual(dbRun, null, "run in db");
      assert.equal(run.id, dbRun.id, "same run returned and on db");
      assert.notEqual(report, null, "report in db");
      assert.equal(report.firstDate, sampleReport1.firstDate, "report first date on sunday");
      assert.equal(report.length, sampleReport1.length + sampleReport2.length, "report length");
      assert.equal(report.duration, sampleReport1.duration + sampleReport2.duration, "report duration");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when registering run and getting weather condition from external API', async function () {
      if (!systemFunctions.env("DARKSKY_API_KEY")) {
        return this.skip();
      }

      const req = httpMocks.createRequest(sampleRequestOptions3),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let run = JSON.parse(res._getData()).run;
      let dbRun = await runs.findOne({
        time: sampleRun2DB.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.notEqual(run, null, "run returned");
      assert.notEqual(dbRun, null, "run in db");
      assert.notEqual(dbRun.weather, undefined, "run weather condition");
      assert.equal(run.id, dbRun.id, "same run returned and on db");
      assert.notEqual(report, null, "report in db");
      assert.equal(report.firstDate, sampleReport2.firstDate, "report first date on sunday");
      assert.equal(report.length, sampleReport2.length, "report length");
      assert.equal(report.duration, sampleReport2.duration, "report duration");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 400 HTTP status code and "INVALID_REQUEST" response code when trying to register run with path length bellow 1', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions4),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun1.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 400, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_REQUEST", "response code");
      assert.equal(dbRun, null, "run not in db");
      assert.equal(report, null, "report not in db");
      assert.notEqual(session, null, "session in db");
      assert.equal(session.token, sampleUserSession.token, "keep session token");
      assert.equal(JSON.parse(res._getData()).response.session, undefined, "don't return session token");
    });

    it('return 400 HTTP status code and "INVALID_REQUEST" response code when trying to register run with path duration bellow 1', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions5),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun1.time
      });
      session = await sessions.findOne({
        userName: sampleUser.name
      });

      assert.equal(res.statusCode, 400, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_REQUEST", "response code");
      assert.equal(dbRun, null, "run not in db");
      assert.equal(report, null, "report not in db");
      assert.notEqual(session, null, "session in db");
      assert.equal(session.token, sampleUserSession.token, "keep session token");
      assert.equal(JSON.parse(res._getData()).response.session, undefined, "don't return session token");
    });

    it('return 401 HTTP status code and "INVALID_SESSION" response code when passing wrong session token', async () => {
      const req = httpMocks.createRequest(sampleRequestOptions1),
        res = httpMocks.createResponse();

      await users.create(sampleUser);
      await controller(req, res);
      let run = JSON.parse(res._getData()).run;
      let report = await reports.findOne({
        userName: sampleUser.name
      });
      let dbRun = await runs.findOne({
        time: sampleRun1.time
      });

      assert.equal(res.statusCode, 401, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_SESSION", "response code");
      assert.equal(run, null, "run not returned");
      assert.equal(dbRun, null, "run not in db");
      assert.equal(report, null, "report not in db");
      assert.equal(JSON.parse(res._getData()).response.session, undefined, "session not returned");
    });

  });

})();