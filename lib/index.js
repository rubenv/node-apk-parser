var os = require("os");
var exec = require("child_process").execFile;

function extractRaw(string) {
    var sep = "\" (Raw: \"";
    var parts = string.split(sep);
    var value = parts.slice(0, parts.length / 2).join(sep);
    return value.substring(1);
}

function extractRawType(string) {
    var matches = string.match(/\(Raw:\s\"(.+)\"\)/);

    if (matches && matches.length > 1) {
        return matches[1];
    }
    return null;
}

function parseOutput(text, cb) {
    if (!text) {
        return cb(new Error("No input!"));
    }
    var lines = text.split("\n");
    var result = {};
    var stack = [result];
    var inManifest = false;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Skip until we find the manifest
        if (line.trim() === "Android manifest:") {
            inManifest = true;
            continue;
        }
        if (!inManifest) {
            continue;
        }

        // Skip whitespace
        if (line.trim() === "") {
            continue;
        }

        // Match the first part of the line
        if (line.match(/^N:/)) {
            continue;
        }

        var matches = line.match(/^( +)(A|E): ([\w:\-]+)(.*)$/);
        if (!matches) {
            return cb(new Error("Parse failure: " + line));
        }
        var input = matches[0];
        var indent = matches[1];
        var type = matches[2];
        var name = matches[3];
        var rest = matches[4];

        var depth = indent.length / 2;
        var parent = stack[depth - 1];

        if (type === "E") {
            var element = {};

            // Fix stack
            while (stack.length > depth) {
                stack.pop();
            }
            if (depth === stack.length) {
                stack.push(element);
            }

            if (!parent[name]) {
                parent[name] = [];
            }
            parent[name].push(element);
        } else if (type === "A") {
            var value = null;
            if (rest.substring(0, 2) === "=\"") {
                // Embedded string
                value = extractRaw(rest.substring(1));
            } else if (rest.substring(0, 12) === "=(type 0x12)") {
                // Boolean
                value = rest[14] === "1";
            } else if (rest.substring(0, 12) === "=(type 0x10)") {
                // Raw
                value = extractRawType(rest);
                if (!value) {
                    return cb(new Error("Cannot parse value: " + rest));
                }
            } else {
                var parts = rest.match(/^\(0x[0-9a-f]+\)\=(.*)$/);
                if (!parts) {
                    return cb(new Error("Cannot parse value: " + rest));
                }

                if (parts[1][0] === "\"") {
                    // Linked string
                    value = extractRaw(parts[1]);
                } else {
                    // No idea, get the raw hex value
                    if (parts[1].substring(0, 11) === "(type 0x10)") {
                        value = parseInt(parts[1].substring(13), 16);
                    } else {
                        value = parts[1];
                    }
                }
            }
            parent["@" + name] = value;
        } else {
            return cb(new Error("Unknown type: " + type));
        }
    }
    cb(null, result);
}

function parseApk(filename, maxBuffer, cb) {
    if (typeof(maxBuffer) === "function") {
        cb = maxBuffer;
        maxBuffer = 1024 * 1024;
    }

    exec(__dirname + "/../tools/aapt", ["l", "-a", filename], {
        maxBuffer: maxBuffer,
    }, function (err, out) {
        if (err) {
            return cb(err);
        }
        parseOutput(out, cb);
    });
}

parseApk.parseOutput = parseOutput;

module.exports = parseApk;
