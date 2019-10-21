/*jshint esversion: 8*/

(() => {
  'use strict';

  const assert = require('assert'),
    httpMocks = require('node-mocks-http'),
    model = require('./model'),
    user = require('../../../models/user'),
    controller = require('../../../../functions/routes')()[model.href.substr(1)],
    modelFunctions = require('../../../../functions/model'),
    users = user.mongooseModel,
    session = require("../../../models/session"),
    sessions = session.mongooseModel;

  describe(model.title, () => {

    let sampleUser = {
      name: "test user",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser = user.api2db(sampleUser);

    let sampleUserSession = {
      token: "ea6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleUser.name
    };
    sampleUserSession = session.api2db(sampleUserSession);

    let sampleUser2 = {
      name: "test user 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr"
    };
    sampleUser2 = user.api2db(sampleUser2);

    let sampleManager = {
      name: "test manager",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "manager"
    };
    sampleManager = user.api2db(sampleManager);

    let sampleManagerSession = {
      token: "da6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleManager.name
    };
    sampleManagerSession = session.api2db(sampleManagerSession);

    let sampleManager2 = {
      name: "test manager 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "manager"
    };
    sampleManager2 = user.api2db(sampleManager2);

    let sampleAdmin = {
      name: "test admin",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin = user.api2db(sampleAdmin);

    let sampleAdminSession = {
      token: "aa6196504c1dc4edbd5710c5fcd908bc",
      userName: sampleAdmin.name
    };
    sampleAdminSession = session.api2db(sampleAdminSession);

    let sampleAdmin2 = {
      name: "test admin 2",
      password: "ifwRULmrcaWYqnUZDdg5KbE9Pr",
      role: "admin"
    };
    sampleAdmin2 = user.api2db(sampleAdmin2);

    let sampleRequestOptions = {
      method: model.method,
      body: {}
    };

    it('return 200 HTTP status code when manager deletes regular user', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleUser.name,
            session: sampleManagerSession.token
          }
        })),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let manager = await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleManager.name
      }))) || session;
      user = await users.findOne({
        name: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user, null, "user not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin deletes regular user', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleUser.name,
            session: sampleAdminSession.token
          }
        })),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let admin = await users.create(sampleAdmin);
      let session = await sessions.create(sampleAdminSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleAdmin.name
      }))) || session;
      user = await users.findOne({
        name: sampleUser.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(user, null, "user not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin deletes manager', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleManager.name,
            session: sampleAdminSession.token
          }
        })),
        res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let admin = await users.create(sampleAdmin);
      let session = await sessions.create(sampleAdminSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleAdmin.name
      }))) || session;
      manager = await users.findOne({
        name: sampleManager.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(manager, null, "manager not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 200 HTTP status code when admin deletes other admin', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleAdmin2.name,
            session: sampleAdminSession.token
          }
        })),
        res = httpMocks.createResponse();

      let admin2 = await users.create(sampleAdmin2);
      let admin = await users.create(sampleAdmin);
      let session = await sessions.create(sampleAdminSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleAdmin.name
      }))) || session;
      admin2 = await users.findOne({
        name: sampleAdmin2.name
      });

      assert.equal(res.statusCode, 200, "status code");
      assert.equal(admin2, null, "admin 2 not in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to delete other regular user', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleUser2.name,
            session: sampleUserSession.token
          }
        })),
        res = httpMocks.createResponse();

      let user2 = await users.create(sampleUser2);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleUser.name
      }))) || session;
      user2 = await users.findOne({
        name: sampleUser2.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(user2, null, "user 2 in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to delete itself', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleUser.name,
            session: sampleUserSession.token
          }
        })),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleUser.name
      }))) || session;
      user = await users.findOne({
        name: sampleUser.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(user, null, "user in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to delete manager', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleManager.name,
            session: sampleUserSession.token
          }
        })),
        res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleUser.name
      }))) || session;
      manager = await users.findOne({
        name: sampleManager.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(manager, null, "manager in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when regular user tries to delete admin', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleAdmin.name,
            session: sampleUserSession.token
          }
        })),
        res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let user = await users.create(sampleUser);
      let session = await sessions.create(sampleUserSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleUser.name
      }))) || session;
      admin = await users.findOne({
        name: sampleAdmin.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(admin, null, "admin in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleUserSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when manager tries to delete other manager', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleManager2.name,
            session: sampleManagerSession.token
          }
        })),
        res = httpMocks.createResponse();

      let manager2 = await users.create(sampleManager2);
      let manager = await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleManager.name
      }))) || session;
      manager2 = await users.findOne({
        name: sampleManager2.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(manager2, null, "manager 2 in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when manager tries to delete itself', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleManager.name,
            session: sampleManagerSession.token
          }
        })),
        res = httpMocks.createResponse();

      let manager = await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleManager.name
      }))) || session;
      manager = await users.findOne({
        name: sampleManager.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(manager, null, "manager in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when manager tries to delete admin', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleAdmin.name,
            session: sampleManagerSession.token
          }
        })),
        res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let manager = await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleManager.name
      }))) || session;
      admin = await users.findOne({
        name: sampleAdmin.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(admin, null, "admin in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleManagerSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 403 HTTP status code and "NOT_ALLOWED" response code when admin tries to delete itself', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleAdmin.name,
            session: sampleAdminSession.token
          }
        })),
        res = httpMocks.createResponse();

      let admin = await users.create(sampleAdmin);
      let session = await sessions.create(sampleAdminSession);
      await controller(req, res);
      session = (await (sessions.findOne({
        userName: sampleAdmin.name
      }))) || session;
      admin = await users.findOne({
        name: sampleAdmin.name
      });

      assert.equal(res.statusCode, 403, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "NOT_ALLOWED", "response code");
      assert.notEqual(admin, null, "admin in db");
      assert.notEqual(session, null, "session in db");
      assert.notEqual(session.token, sampleAdminSession.token, "change session token");
      assert.equal(JSON.parse(res._getData()).response.session, session.token, "return new session token");
    });

    it('return 401 HTTP status code and "INVALID_SESSION" response code when passing wrong session token', async () => {
      const req = httpMocks.createRequest(modelFunctions.clone(sampleRequestOptions, {
          body: {
            userName: sampleUser.name,
            session: "fa6196504c1dc4edbd5710c5fcd908bd"
          }
        })),
        res = httpMocks.createResponse();

      let user = await users.create(sampleUser);
      let manager = await users.create(sampleManager);
      let session = await sessions.create(sampleManagerSession);
      await controller(req, res);
      user = await users.findOne({
        name: sampleUser.name
      });

      assert.equal(res.statusCode, 401, "status code");
      assert.equal(JSON.parse(res._getData()).response.code, "INVALID_SESSION", "response code");
      assert.notEqual(user, null, "user in db");
    });

  });

})();