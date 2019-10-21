/*jshint esversion: 8*/

(() => {

    'use strict';

    const fs = require('fs');

    // List all files in a directory in Node.js recursively in a synchronous fashion
    exports.walkSync = function (dir, extension, filelist) {
        let files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(file => {
            if (!extension && !fs.statSync(dir + file).isDirectory() || file.endsWith(extension)) {
                filelist.push(dir + file.substring(0, file.length - (extension ? extension.length : 0)));
            } else {
                if (fs.statSync(dir + file).isDirectory() && file !== "node_modules" && !file.startsWith(".")) {
                    filelist = exports.walkSync(dir + file + '/', extension, filelist);
                }
            }
        });
        return filelist;
    };

})();