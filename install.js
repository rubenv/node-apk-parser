var https = require("https");
var fs = require("fs");
var os = require("os");
var exec = require("child_process").exec;

var targetDir = __dirname + "/tools/";
try {
    fs.statSync(targetDir);
} catch (e) {
    fs.mkdirSync(targetDir);
}

var platform = null;
if (os.type() === "Darwin") {
    platform = "macosx";
} else if (os.type() === "Linux") {
    platform = "linux";
} else {
    throw new Error("Unknown OS!");
}

function attemptDownload(attemptsLeft) {
    var url = "https://dl-ssl.google.com/android/repository/platform-tools_r16-" + platform + ".zip";
    var tempFile = "/tmp/platform-tools-" + (new Date().getTime()) + ".zip";

    var file = fs.createWriteStream(tempFile);
    var request = https.get(url, function (response) {j
        response.pipe(file);
        response.on("end", function () {
            exec("unzip -j -o " + tempFile + " platform-tools/aapt -d tools/", function (err) {
                if (err) {
                    if (attemptsLeft === 0) {
                        throw err;
                    } else {
                        attemptDownload(attemptsLeft - 1);
                        return;
                    }
                }
                fs.chmodSync("tools/aapt", "755");
                fs.unlinkSync(tempFile);
                process.exit();
            });
        });
    });
}

function installAapt() {
    var commandExists = require('command-exists');        
    commandExists('aapt', function(err, commandExists) {
        if(commandExists) {
            console.log("install aapt finish, use the aapt in path")
        } else {
            attemptDownload(3);
        }
    });
}

installAapt();