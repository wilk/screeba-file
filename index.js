'use strict';

var _ = require('lodash'),
    colors = require('colors'),
    fs = require('fs'),
    q = require('q');

/**
 * FileTransport class. Transport for file.
 * @param {Object}  configs An object containing configurations to initialize the Transport
 * @param {String}  configs.filename Name of the file to log. By default, ./screeba.log
 * @param {Array}   configs.levels A list of levels that the transport has to log. By default every message are logged at each level
 * @param {Boolean} configs.timestamp Flag to allow timestamp in the log. True by default
 * @param {Boolean} configs.colorize Flag to allow colors in the log. True by default
 * @param {Object}  configs.colors A map of level-color. Each level is logged colored by his color
 * @returns {FileTransport} A new FileTransport instance
 * @constructor
 */
function FileTransport (configs) {
    var me = this;

    configs = configs || {};
    me.filename = configs.filename || 'screeba.log';
    // @todo: handle format json and csv as {type: 'format', [options...]}
    me.levels = configs.levels || [];
    me.timestamp = configs.timestamp || true;
    me.colorize = configs.colorize || true;
    me.prettyprint = configs.prettyprint || false;
    me.indentation = configs.indentation || 4;
    me.colors = {
        info: 'green',
        warning: 'yellow',
        error: 'red'
    };

    if (configs.colors) {
        me.colors = configs.colors;
        colors.setTheme(me.colors);
    }

    /**
     * It logs a message at the specified level
     * @param {String} level The level the logger has to log
     * @param {String} message The message to log
     * @param {Object} metadata An object containing extra data to log
     * @param {Function} callback A callback function called after logging
     * @returns {Promise} A promise resolved or rejected
     */
    me.log = function (level, message, metadata, callback, deferred) {
        deferred = deferred || q.defer();
        callback = typeof callback === 'function' ? callback : function () {};

        if (me.levels.length === 0 || (me.levels.length > 0 && me.levels.indexOf(level) > -1)) {
            var msg = {
                    level: level,
                    message: message
                },
                msgStringified = '';

            if (me.timestamp) msg.timestamp = new Date();
            if (metadata) msg.metadata = metadata;
            if (me.colorize && me.colors[level].length > 0) msg.color = me.colors[level];

            if (me.prettyprint) msgStringified += JSON.stringify(msg, null, me.indentation);
            else msgStringified += JSON.stringify(msg);

            // @todo: problem writing json file in json format. first read, then write json. use stream or something faster
            fs.appendFile(me.filename, msgStringified + ",\n", function (err) {
                if (err) {
                    callback(err);
                    deferred.reject(err);
                }
                else {
                    callback(null, msg);
                    deferred.resolve(msg);
                }
            });
        }

        return deferred.promise;
    };

    /**
     * It queries logs
     * @param {Object} query An object containing the query
     * @param {Function} callback A callback function called after querying
     * @returns {Promise} A promise resolved or rejected by every transport (it depends on each transport implementation)
     */
    me.query = function (query, callback, deferred) {
        deferred = deferred || q.defer();
        callback = typeof callback === 'function' ? callback : function () {};

        fs.readFile(me.filename, {encoding: 'utf8'}, function (err, data) {
            if (err) {
                callback(err);
                deferred.reject(err);
            }
            else {
                var dataString = data || '';
                dataString = dataString.trim().substr(0, dataString.length - 2);
                dataString = '[' + dataString + ']';

                var dataObject = JSON.parse(dataString),
                    results = _.find(dataObject, query);

                callback(null, results);
                deferred.resolve(results);
            }
        });

        return deferred.promise;
    };

    return me;
};

module.exports = FileTransport;
