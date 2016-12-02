var assert = require("assert");
var parseApk = require("..");

describe("APK V24", function () {
    var output = null;

    before(function (done) {
        parseApk(__dirname + "/samples/test_v24.apk", function (err, out) {
            if (err) {
                return done(err);
            }
            output = out;
            done();
        });
    });

    it("Parses correctly", function () {
        assert.notEqual(null, output);
    });

    it("Starts with a manifest tag", function () {
        assert.equal(output.manifest.length, 1);
    });

    it("Has a package name", function () {
        assert.equal(output.manifest[0]["@package"], "com.idotools.bookstore");
    });

    it("Has a package version", function () {
        assert.equal(output.manifest[0]["@platformBuildVersionCode"], "24");
    });

    it("Parses platformBuildVersionName", function () {
        assert.equal(output.manifest[0]["@platformBuildVersionName"], "7.0");
    });

    it("Has an application tag", function () {
        var manifest = output.manifest[0];
        assert.equal(manifest.application.length, 1);
    });
});
