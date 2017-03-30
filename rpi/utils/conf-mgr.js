var fs = require('fs');
var os = require('os');
var defaultConfig = __dirname + "/defaults.json";
var config = require(defaultConfig);
var userConfig = `${os.homedir()}/${config.local_directory}/settings.json`;

// Only reload if this module has not yet been cached
if (!exports.loaded) {
    loadConfig();
}

exports.startup = function() {
    if (!fs.existsSync(config.local_directory)){
        fs.mkdirSync(config.local_directory);
    }
}

function loadConfig() {
    try {
        var conf = require(userConfig);
        mergeConfig(conf, config);
    } catch(e) {
        console.log(e)
        // no user settings. Ignore
    }
    exports.loaded = true;
}

function mergeConfig(src, target) {
    for (var key in src) {
        if (!(key in target)) {
            target[key] = src[key];
        } else if (Array.isArray(src[key])) {
            src[key].forEach((val, i) => {
                mergeConfig(src[key][i], target[key][i]);
            })
        } else if (typeof src[key] === "object") {
            mergeConfig(src[key], target[key]);
        } else {
            target[key] = src[key];
        }
    }
}

function addConfig(str, val) {
    var levels = str.split(".");
    var obj = config;
    var lastIndex = levels.length - 1;
    for (var i = 0; i < lastIndex; i++) {
        var l = levels[i];
        if (!(l in obj)) {
            obj[l] = {};
        }
        obj = obj[l];
    }
    obj[levels[lastIndex]] = val;
    writeConfig();
}

function getConfig(str) {
    var levels = str.split(".");
    var obj = config;
    console.log(config);
    try {
        for (var i = 0; i < levels.length; i++) {
            obj = obj[levels[i]];
        }
    } catch (e) {
        console.log(e);
        return undefined;
    }
    return obj;
}

function writeConfig() {
    fs.writeFile(userConfig, JSON.stringify(config), function (err) {
        if (err) return console.log(err);
    });
}

exports.saveCredentials = function(id, credentials, type, make) {
    addConfig(`devices.${make}.${type}.credentials.${id}`, credentials);
}

exports.getCredentials = function(id, type, make) {
    return getConfig(`devices.${make}.${type}.credentials.${id}`);
}

