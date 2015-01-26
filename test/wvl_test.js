var fs = require("fs");
var assert = require("assert");
var parseApk = require("..");

describe("WVL", function () {
    var output = null;

    before(function (done) {
        fs.readFile(__dirname + "/samples/wvl.txt", "utf8", function (err, txt) {
            if (err) {
                return done(err);
            }
            parseApk.parseOutput(txt, function (err, out) {
                if (err) {
                    return done(err);
                }
                output = out;
                done();
            });
        });
    });

    it("Parses correctly", function () {
        assert.notEqual(null, output);
    });

    it("Starts with a manifest tag", function () {
        assert.equal(output.manifest.length, 1);
    });

    it("Contains a version name attribute", function () {
        assert.equal(output.manifest[0]["@android:versionName"], "1.1");
    });

    it("Has a package name", function () {
        assert.equal(output.manifest[0]["@package"], "WestVlinderen.Droid");
    });

    it("Parses SDK versions", function () {
        var manifest = output.manifest[0];
        assert.equal(manifest["uses-sdk"][0]["@android:minSdkVersion"], 8);
        assert.equal(manifest["uses-sdk"][0]["@android:targetSdkVersion"], 10);
    });

    it("Has an application tag", function () {
        var manifest = output.manifest[0];
        assert.equal(manifest.application.length, 1);
    });

    it("Has 5 meta-data tags", function () {
        var manifest = output.manifest[0];
        var application = manifest.application[0];
        assert.equal(application["meta-data"].length, 5);
    });

    it("Application has a label attribute", function () {
        var manifest = output.manifest[0];
        var application = manifest.application[0];
        assert.equal(application["@android:label"], "WestVlinderen");
    });
});
