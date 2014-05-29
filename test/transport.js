var fs = require('fs'),
    mocha = require('mocha'),
    expect = require('chai').expect,
    screeba = require('screeba'),
    FileTransport = require('../'),
    logger;

before(function () {
    logger = screeba.logger({
        transports: [new FileTransport()]
    });
});

describe('Testing File Transport', function () {
    describe('Logging', function () {
        it('should log a message', function (done) {
            logger.log('info', 'message', {}, function (err, log) {
                expect(err).to.be.null;
                expect(log.message).to.equal('message');
                expect(log.level).to.equal('info');

                done(null);
            });
        });

        it('should log an info', function (done) {
            logger.info('message', {}, function (err, log) {
                expect(err).to.be.null;
                expect(log.message).to.equal('message');
                expect(log.level).to.equal('info');

                done(null);
            });
        });

        it('should log an error', function (done) {
            logger.error('message', {}, function (err, log) {
                expect(err).to.be.null;
                expect(log.message).to.equal('message');
                expect(log.level).to.equal('error');

                done(null);
            });
        });

        it('should log a warning', function (done) {
            logger.warning('message', {}, function (err, log) {
                expect(err).to.be.null;
                expect(log.message).to.equal('message');
                expect(log.level).to.equal('warning');

                done(null);
            });
        });
    });

    describe('Querying', function () {
        it('should return an empty array', function () {

        });

        it('should return every info logs', function () {

        });

        it('should return a single log', function () {

        });
    });
});

after(function (done) {
    fs.exists('screeba.log', function (exists) {
        if (exists) fs.unlink('screeba.log', done);
        else return done();
    });
});