/*jshint esversion: 8*/

(() => {
  'use strict';

  const assert = require('assert'),
        httpMocks = require('node-mocks-http'),
        model = require('./model'),
        controller = require('../../../../functions/routes')()[model.href.substr(1)],
        modelFunctions = require('../../../../functions/model'),
        userModel = require('../../../models/user'),
        users = userModel.mongooseModel,
        sessionModel = require("../../../models/session"),
        sessions = sessionModel.mongooseModel,
        runModel = require("../../../models/run"),
        runs = runModel.mongooseModel,
        reportModel = require("../../../models/report"),
        reports = reportModel.mongooseModel;

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

    let sampleUserRun = {
      userName: sampleUser.name,
      weatherSummary: "veniam anim",
      path: [
        {
          location: {
            latitude: 57.72876157597824,
            longitude: 78.96530337899239
          },
          time: new Date("2018-11-04T20:30:05.815Z")
        },
        {
          location: {
            latitude: 57.73876157597824,
            longitude: 78.95530337899239
          },
          time: new Date("2018-11-04T20:50:05.815Z")
        }
      ]
    };
    sampleUserRun = runModel.api2db(sampleUserRun);

    let sampleUserReport = {
      userName: sampleUser.name,
      firstDate: "2018-11-04",
      length: 1200,
      duration: 1200,
      speed: 1
    };

    let sampleUserN = {
      name: "mister test user",
      password: sampleUser.password
    };

    let sampleUserP = {
      name: sampleUser.name,
      password: "new password!"
    };

    let sampleUserR = {
      name: sampleUser.name,
      password: sampleUser.password,
      role: "manager"
    };

    let sampleUserNP = {
      name: "mister test user",
      password: "new password!"
    };

    let sampleUserNPR = {
      name: "mister test user",
      password: "new password!",
      role: "manager"
    };

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

    let sampleManagerN = {
      name: "mister test manager",
      password: sampleManager.password
    };

    let sampleManagerP = {
      name: sampleManager.name,
      password: "new password!"
    };

    let sampleManagerR = {
      name: sampleManager.name,
      password: sampleManager.password,
      role: "regular"
    };

    let sampleManagerNP = {
      name: "mister test manager",
      password: "new password!"
    };

    let sampleManagerNPR = {
      name: "mister test manager",
      password: "new password!",
      role: "regular"
    };

    let sampleManager2 = {
      name: "test manager 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "manager"
    };
    sampleManager2 = userModel.api2db(sampleManager2);

    let sampleManager2N = {
      name: "mister test manager 2",
      password: sampleManager2.password
    };

    let sampleAdmin = {
      name: "test admin",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin = userModel.api2db(sampleAdmin);

    let sampleAdminSession = {
      token: "aa6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleAdmin.name
    };
    sampleAdminSession = sessionModel.api2db(sampleAdminSession);

    let sampleAdminN = {
      name: "mister test admin",
      password: sampleAdmin.password
    };

    let sampleAdminP = {
      name: sampleAdmin.name,
      password: "new password!"
    };

    let sampleAdminR = {
      name: sampleAdmin.name,
      password: sampleAdmin.password,
      role: "manager"
    };

    let sampleAdminNP = {
      name: "mister test admin",
      password: "new password!"
    };

    let sampleAdminNPR = {
      name: "mister test admin",
      password: "new password!",
      role: "manager"
    };

    let sampleAdmin2 = {
      name: "test admin 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin2 = userModel.api2db(sampleAdmin2);

    let sampleAdmin2N = {
      name: "mister test admin 2",
      password: sampleAdmin2.password
    };

    let sampleRequestOptions = {
      method: model.method,
      body: {}
    };

    it('return 200 HTTP status code when regular user changes its own name', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserN,
                session: sampleUserSession.token
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserN.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserN.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserN.name }))) || session;
      user = (await (users.findOne({ name: sampleUserN.name }))) || user;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserN.name, "userName on report");
      assert.equal(run.userName, sampleUserN.name, "userName on run");
      assert.equal(session.userName, sampleUserN.name, "userName on session");
      assert.equal(user.name, sampleUserN.name, "user name");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user changes its own password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserP,
                session: sampleUserSession.token
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({ userName: sampleUserP.name }))) || session;
      user = (await (users.findOne({ name: sampleUserP.name }))) || user;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user.password, sampleUserP.password, "user password");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when regular user changes its own name and password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserNP,
                session: sampleUserSession.token
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserNP.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserNP.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserNP.name }))) || session;
      user = (await (users.findOne({ name: sampleUserNP.name }))) || user;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserNP.name, "userName on report");
      assert.equal(run.userName, sampleUserNP.name, "userName on run");
      assert.equal(session.userName, sampleUserNP.name, "userName on session");
      assert.equal(user.name, sampleUserNP.name, "user name");
      assert.equal(user.password, sampleUserNP.password, "user password");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it("return 200 HTTP status code when manager changes regular user's name", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserN,
                session: sampleManagerSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserN.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserN.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserN.name }))) || session;
      user = (await (users.findOne({ name: sampleUserN.name }))) || user;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserN.name, "userName on report");
      assert.equal(run.userName, sampleUserN.name, "userName on run");
      assert.equal(session.userName, sampleUserN.name, "userName on session");
      assert.equal(user.name, sampleUserN.name, "user name");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 200 HTTP status code when manager changes regular user's password", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserP,
                session: sampleManagerSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let user = await users.create(sampleUser);
      await controller(req, res);
      user = (await (users.findOne({ name: sampleUserP.name }))) || user;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user.password, sampleUserP.password, "user password");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 200 HTTP status code when manager changes regular user's name and password", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserNP,
                session: sampleManagerSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserNP.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserNP.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserNP.name }))) || session;
      user = (await (users.findOne({ name: sampleUserNP.name }))) || user;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserNP.name, "userName on report");
      assert.equal(run.userName, sampleUserNP.name, "userName on run");
      assert.equal(session.userName, sampleUserNP.name, "userName on session");
      assert.equal(user.name, sampleUserNP.name, "user name");
      assert.equal(user.password, sampleUserNP.password, "user password");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it('return 200 HTTP status code when manager changes its own name', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerN,
                session: sampleManagerSession.token
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerN.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerN.name }))) || manager;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager.name, sampleManagerN.name, "manager name");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it('return 200 HTTP status code when manager changes its own password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerP,
                session: sampleManagerSession.token
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerP.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerP.name }))) || manager;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager.password, sampleManagerP.password, "user password");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it('return 200 HTTP status code when manager changes its own name and password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerNP,
                session: sampleManagerSession.token
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerNP.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerNP.name }))) || manager;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager.name, sampleManagerNP.name, "user name");
      assert.equal(manager.password, sampleManagerNP.password, "user password");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes regular user's name", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserN,
                session: sampleAdminSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserN.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserN.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserN.name }))) || session;
      user = (await (users.findOne({ name: sampleUserN.name }))) || user;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserN.name, "userName on report");
      assert.equal(run.userName, sampleUserN.name, "userName on run");
      assert.equal(session.userName, sampleUserN.name, "userName on session");
      assert.equal(user.name, sampleUserN.name, "user name");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes regular user's password", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserP,
                session: sampleAdminSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let user = await users.create(sampleUser);
      await controller(req, res);
      user = (await (users.findOne({ name: sampleUserP.name }))) || user;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user.password, sampleUserP.password, "user password");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes regular user's role to manager", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserR,
                session: sampleAdminSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let user = await users.create(sampleUser);
      await controller(req, res);
      user = (await (users.findOne({ name: sampleUserR.name }))) || user;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user.role, sampleUserR.role, "user role");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes regular user's name, password and role", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserNPR,
                session: sampleAdminSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let run = await runs.create(sampleUserRun);
      let report = await reports.create(sampleUserReport);
      await controller(req, res);
      report = (await (reports.findOne({ userName: sampleUserNPR.name }))) || report;
      run = (await (runs.findOne({ userName: sampleUserNPR.name }))) || run;
      session = (await (sessions.findOne({ userName: sampleUserNPR.name }))) || session;
      user = (await (users.findOne({ name: sampleUserNPR.name }))) || user;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(report.userName, sampleUserNPR.name, "userName on report");
      assert.equal(run.userName, sampleUserNPR.name, "userName on run");
      assert.equal(session.userName, sampleUserNPR.name, "userName on session");
      assert.equal(user.name, sampleUserNPR.name, "user name");
      assert.equal(user.password, sampleUserNPR.password, "user password");
      assert.equal(user.role, sampleUserNPR.role, "user role");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes manager's name", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerN,
                session: sampleAdminSession.token,
                userName: sampleManager.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerN.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerN.name }))) || manager;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(managerSession.userName, sampleManagerN.name, "userName on session");
      assert.equal(manager.name, sampleManagerN.name, "manager name");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes manager's password", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerP,
                session: sampleAdminSession.token,
                userName: sampleManager.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let manager = await users.create(sampleManager);
      await controller(req, res);
      manager = (await (users.findOne({ name: sampleManagerP.name }))) || manager;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager.password, sampleManagerP.password, "manager password");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes manager's role to regular", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerR,
                session: sampleAdminSession.token,
                userName: sampleManager.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let manager = await users.create(sampleManager);
      await controller(req, res);
      manager = (await (users.findOne({ name: sampleManagerR.name }))) || manager;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager.role, sampleManagerR.role, "manager role");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 200 HTTP status code when admin changes manager's name, password and role", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerNPR,
                session: sampleAdminSession.token,
                userName: sampleManager.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerNPR.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerNPR.name }))) || manager;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(managerSession.userName, sampleManagerNPR.name, "userName on session");
      assert.equal(manager.name, sampleManagerNPR.name, "manager name");
      assert.equal(manager.password, sampleManagerNPR.password, "manager password");
      assert.equal(manager.role, sampleManagerNPR.role, "manager role");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 200 HTTP status code when admin changes its own name', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdminN,
                session: sampleAdminSession.token
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      await controller(req, res);
      adminSession = (await (sessions.findOne({ userName: sampleAdminN.name }))) || adminSession;
      admin = (await (users.findOne({ name: sampleAdminN.name }))) || admin;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(admin.name, sampleAdminN.name, "admin name");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 200 HTTP status code when admin changes its own password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdminP,
                session: sampleAdminSession.token
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      await controller(req, res);
      adminSession = (await (sessions.findOne({ userName: sampleAdminP.name }))) || adminSession;
      admin = (await (users.findOne({ name: sampleAdminP.name }))) || admin;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(admin.password, sampleAdminP.password, "admin password");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 200 HTTP status code when admin changes its own name and password', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdminNP,
                session: sampleAdminSession.token
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      await controller(req, res);
      adminSession = (await (sessions.findOne({ userName: sampleAdminNP.name }))) || adminSession;
      admin = (await (users.findOne({ name: sampleAdminNP.name }))) || admin;

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(admin.name, sampleAdminNP.name, "admin name");
      assert.equal(admin.password, sampleAdminNP.password, "admin password");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to change its own role', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserR,
                session: sampleUserSession.token
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({ userName: sampleUserR.name }))) || session;
      user = (await (users.findOne({ name: sampleUserR.name }))) || user;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(user.role, sampleUser.role, "user role");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to modify other user', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerN,
                session: sampleUserSession.token,
                userName: sampleManager.name
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerN.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerN.name }))) || manager;
      session = (await (sessions.findOne({ userName: sampleUser.name }))) || session;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(managerSession.userName, sampleManager.name, "userName on session");
      assert.equal(manager.name, sampleManager.name, "manager name");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it("return 404 HTTP status code and \"USER_NOT_FOUND\" response code when manager tries to modify non-existing user", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserN,
                session: sampleManagerSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      let user = (await (users.findOne({ name: sampleUserN.name })));
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 404, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "USER_NOT_FOUND", "response code");
      assert.equal(user, null, "non-existing user");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 403 HTTP status code and \"NOT_ALLOWED\" response code when manager tries to change regular user's role", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserR,
                session: sampleManagerSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let user = await users.create(sampleUser);
      await controller(req, res);
      user = (await (users.findOne({ name: sampleUserR.name }))) || user;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(user.role, sampleUser.role, "user role");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when manager tries to change its own role', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManagerR,
                session: sampleManagerSession.token
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      await controller(req, res);
      managerSession = (await (sessions.findOne({ userName: sampleManagerR.name }))) || managerSession;
      manager = (await (users.findOne({ name: sampleManagerR.name }))) || manager;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(manager.role, sampleManager.role, "manager role");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 403 HTTP status code and \"NOT_ALLOWED\" response code when manager tries to modify other manager", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleManager2N,
                session: sampleManagerSession.token,
                userName: sampleManager2.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let manager2 = await users.create(sampleManager2);
      await controller(req, res);
      manager2 = (await (users.findOne({ name: sampleManager2N.name }))) || manager2;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(manager2.name, sampleManager2.name, "manager name");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 403 HTTP status code and \"NOT_ALLOWED\" response code when manager tries to modify admin", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdminN,
                session: sampleManagerSession.token,
                userName: sampleAdmin.name
              }
            })),
            res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let managerSession = await sessions.create(sampleManagerSession);
      let admin = await users.create(sampleAdmin);
      await controller(req, res);
      admin = (await (users.findOne({ name: sampleAdminN.name }))) || admin;
      managerSession = (await (sessions.findOne({ userName: sampleManager.name }))) || managerSession;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(admin.name, sampleAdmin.name, "admin name");
      assert.notEqual(managerSession.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, managerSession.token, "return new session token");
    });

    it("return 404 HTTP status code and \"USER_NOT_FOUND\" response code when admin tries to modify non-existing user", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserN,
                session: sampleAdminSession.token,
                userName: sampleUser.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      await controller(req, res);
      let user = (await (users.findOne({ name: sampleUserN.name })));
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 404, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "USER_NOT_FOUND", "response code");
      assert.equal(user, null, "non-existing user");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when admin tries to change its own role', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdminR,
                session: sampleAdminSession.token
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      await controller(req, res);
      adminSession = (await (sessions.findOne({ userName: sampleAdminR.name }))) || adminSession;
      admin = (await (users.findOne({ name: sampleAdminR.name }))) || admin;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(admin.role, sampleAdmin.role, "admin role");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it("return 403 HTTP status code and \"NOT_ALLOWED\" response code when admin tries to modify other admin", async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleAdmin2N,
                session: sampleAdminSession.token,
                userName: sampleAdmin2.name
              }
            })),
            res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let adminSession = await sessions.create(sampleAdminSession);
      let admin2 = await users.create(sampleAdmin2);
      await controller(req, res);
      admin2 = (await (users.findOne({ name: sampleAdmin2N.name }))) || admin2;
      adminSession = (await (sessions.findOne({ userName: sampleAdmin.name }))) || adminSession;

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.equal(admin2.name, sampleAdmin2.name, "admin name");
      assert.notEqual(adminSession.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, adminSession.token, "return new session token");
    });

    it('return 401 HTTP status code and "INVALID_SESSION" response code when passing wrong session token', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
              body: {
                user: sampleUserP,
                session: "aaaaa6504c1dc4edbd5710c5fcd908bc"
              }
            })),
            res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      await controller(req, res);
      user = (await (users.findOne({ name: sampleUserN.name }))) || user;

      assert.equal(res.statusCode, 401, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_SESSION", "response code");
      assert.notEqual(user, null, "user in db");
      assert.equal(user.password, sampleUser.password, "user password");
      assert.equal(JSON.parse(res._getData()).response.session, null, "don't return session token");
    });

  });

})();