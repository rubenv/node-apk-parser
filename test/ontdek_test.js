var fs = require("fs");
var assert = require("assert");
var parseApk = require("..");

describe("Ontdek", function () {
    var output = null;

    before(function (done) {
        fs.readFile(__dirname + "/samples/ontdek.txt", "utf8", function (err, txt) {
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
        assert.equal(output.manifest[0]["@android:versionName"], "1.0.1");
    });

    it("Has a package name", function () {
        assert.equal(output.manifest[0]["@package"], "zeeland.ontdek.android");
    });

    it("Has an application tag", function () {
        var manifest = output.manifest[0];
        assert.equal(manifest.application.length, 1);
    });

    it("Has 6 meta-data tags", function () {
        var manifest = output.manifest[0];
        var application = manifest.application[0];
        assert.equal(application["meta-data"].length, 6);
    });
});
