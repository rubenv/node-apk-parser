var http = require('http');
var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;

var targetDir = __dirname + '/tools/';
try {
    fs.statSync(targetDir);
} catch (e) {
    fs.mkdirSync(targetDir);
}

var platform = null;
if (os.type() == 'Darwin') {
    platform = 'macosx';
} else if (os.type() == 'Linux') {
    platform = 'linux';
} else {
    throw new Error('Unknown OS!');
}

var url = "http://dl-ssl.google.com/android/repository/platform-tools_r16-" + platform + ".zip";
var tempFile = "/tmp/platform-tools-" + (new Date().getTime()) + ".zip";

var file = fs.createWriteStream(tempFile);
var request = http.get(url, function(response) {
    response.pipe(file);
    response.on('end', function () {
        exec("unzip -j -o /tmp/platform-tools.zip platform-tools/aapt -d tools/", function (err) {
            if (err) {
                throw err;
            }
            fs.unlinkSync(tempFile);
            process.exit();
        });
    });
});
