/*jshint esversion: 8*/

/**
 * Generates documentation based on json schema
 */

(() => {
  'use strict';

  const fs = require('fs'),
    fileFunctions = require("./functions/file"),
    execSync = require('child_process').execSync,
    spawnSync = require('child_process').spawnSync,
    mkdirp = require('mkdirp'),
    topDir = __dirname.substring(0, __dirname.replace(/\\/g, "/").lastIndexOf("/"));

  let c = 0;
  let folder = "./src/";
  let files = fileFunctions.walkSync(folder, "model.js");
  files.splice(files.indexOf(folder + "functions/"), 1);
  let modelsFolder = "./src/api/models/";
  let modelsFiles = fileFunctions.walkSync(modelsFolder, ".js");
  let endpoints = [];
  let wss = {};

  files.forEach(js => {
    let json = require("./" + js.substring(folder.length) + "model");
    mkdirp.sync(topDir + "/doc/schemas/" + js.substring(folder.length, js.lastIndexOf("/", js.lastIndexOf("/") - 1)));
    if (json.href) {
      fs.writeFileSync(topDir + "/doc/schemas/" + js.substring(folder.length, js.length - 1) + ".json", JSON.stringify(json, null, 4));
      json._schema = json.schema;
      json._targetSchema = json.targetSchema;
      endpoints.push(json);
    } else {
      if (json.model && json.model.href && json.ws && json.ws.id) {
        let ws = (wss[json.ws.id] = wss[json.ws.id] || json.ws);
        json = json.model;
        fs.writeFileSync(topDir + "/doc/schemas/" + js.substring(folder.length, js.length - 1) + ".json", JSON.stringify(json, null, 4));
        json._schema = json.schema;
        json._targetSchema = json.targetSchema;
        (ws.links = ws.links || []).push(json);
      }
    }
    console.log(++c + "/" + (files.length + modelsFiles.length) + ": JSON for endpoint " + js.substr(folder.length) + " created.\n");
  });
  let types = [];
  let indexes = [];
  modelsFiles.forEach(js => {
    let json = require("./api/models/" + js.substr(modelsFolder.length));
    mkdirp.sync(topDir + "/doc/schemas/" + js.substring(modelsFolder.length, js.lastIndexOf("/")));
    fs.writeFileSync(topDir + "/doc/schemas/" + js.substr(modelsFolder.length) + ".json", JSON.stringify(json, null, 4));
    if (json.dbSchema) {
      types.push(json);
      if (json.dbIndexes) {
        json.dbIndexes.forEach(fields => {
          if (fields.length === 1) {
            fields.push({
              fieldPath: "id",
              mode: "ASCENDING"
            });
          }
          indexes.push({
            collectionId: json.dbSchema.href,
            fields: fields
          });
        });
      }
    }
    console.log(++c + "/" + (files.length + modelsFiles.length) + ": JSON for model " + js.substr(modelsFolder.length) + " created.\n");
  });
  mkdirp.sync(topDir + "/doc/_schemas");
  let apiWs = require(topDir + "/src/api/ws");
  apiWs.links = endpoints;
  fs.writeFileSync(topDir + "/doc/_schemas/apiWs.json", JSON.stringify(apiWs));
  Object.keys(wss).forEach(wsId => {
    fs.writeFileSync(topDir + "/doc/_schemas/ws_" + wsId.replace(/\//g, "_") + ".json", JSON.stringify(wss[wsId]));
  });
  fs.writeFileSync(topDir + "/doc/_schemas/types.json", JSON.stringify({
    id: '/types',
    title: 'DataBase Types',
    description: 'Types for the DataBase',
    "$model": "http://json-model.org/draft-04/schema#",
    base: "",
    links: types.map(type => {
      return {
        title: type.dbSchema.title,
        description: type.dbSchema.description,
        href: 'db/' + type.dbSchema.href,
        targetSchema: type.dbSchema,
        _targetSchema: type.dbSchema
      };
    })
  }));
  console.log("Generating HTML with the documentation...");
  spawnSync("bash", ["-c", "rm -rvf doca"], {
    cwd: topDir + "/doc"
  });
  execSync("bash -c \"../node_modules/.bin/doca init -i _schemas -o doca -t node-docson\"", {
    cwd: topDir + "/doc"
  });
  spawnSync("bash", ["-c", "rm ./*; cd doca && sed -i -e s/require[\\(]\\'\\\\\\.\\\\\\//\\\\\\/\\\\\\//g schemas.js && sed -i -e 's/\\\\\\\\/\\\\//g' schemas.js; npm install && set NODE_ENV=production && webpack --config webpack/config.prod.withjs.babel.js && cd .. && cp doca/build/* ./ && rm -rvf doca/ static-* _schemas/"], {
    cwd: topDir + "/doc"
  });
  let content = {};
  let index;
  fs.readdirSync(topDir + '/doc/', {
    withFileTypes: true
  }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name).forEach(file => {
    if (file.endsWith('index.html')) {
      index = fs.readFileSync(topDir + "/doc/" + file, 'utf8');
    } else {
      content[file.substr(file.lastIndexOf('/') + 1)] = fs.readFileSync(topDir + "/doc/" + file, 'utf8');
    }
  });
  const warning = '<!-- THIS VIEW IS GENERATED AUTOMATICALY. ANY CHANGES TO THIS FILE WILL BE OVERWRITTEN! -->\n';
  if (index) {
    Object.keys(content).forEach(file => {
      if (file.endsWith(".js")) {
        index = index.split('src="' + file + '" type="text/javascript">').join('type="text/javascript">' + content[file]);
      } else {
        index = index.split('<link href="' + file + '" rel="stylesheet"/>').join('<style>' + content[file] + '</style>');
      }
    });
    fs.writeFileSync("./src/api/endpoints/doc/get/view.html",
      warning + index.replace(/Example API Documentation/g, apiWs.title + " - Documentation").replace(/https\:\/\/api\.example\.com\/example\/v1\//g, apiWs.base));
    spawnSync("bash", ["-c", "rm -rvf doc"], {
      cwd: topDir
    });
  } else {
    fs.writeFileSync("./src/api/endpoints/doc/get/view.html",
      warning + 'Error when building the documentation');
  }

})();