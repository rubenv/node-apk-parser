var http = require('http');
var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;
var path = require('path');
var AdmZip = require('adm-zip');
var aaptExe = 'aapt';
var doChmod = true;
var targetDir = __dirname + '/tools/';
var dlLink;
var ProgressBar = require('progress');

try {
    fs.statSync(targetDir);
} catch (e) {
    fs.mkdirSync(targetDir);
}

var platform = null;
var osType = os.type();
switch(osType){
  case('Darwin'):
    dlLink = 'http://dl.google.com/android/adt/22.6.2/adt-bundle-mac-x86_64-20140321.zip';
    platform = 'macosx';
    break;
  case('Linux'):
    if(os.arch() === 'x64'){
      dlLink = 'http://dl.google.com/android/adt/22.6.2/adt-bundle-linux-x86_64-20140321.zip';
    }else{
      dlLink = 'http://dl.google.com/android/adt/22.6.2/adt-bundle-linux-x86-20140321.zip';
    }
    platform = 'linux';
    break;
  case('Windows_NT'):
    if(os.arch() === 'x64'){
      dlLink = 'http://dl.google.com/android/adt/22.6.2/adt-bundle-windows-x86_64-20140321.zip';
    }else{
      dlLink = 'http://dl.google.com/android/adt/22.6.2/adt-bundle-windows-x86-20140321.zip';
    }
    platform = 'windows';
    aaptExe = 'aapt.exe';
    doChmod = false;
    break;
  default:
    throw new Error('Unknown OS "'+osType+'"!');
}

var mkDir = function(fpath, callback){
  var dirs = fpath.split(/[\\\/]/);
  var root = './';
  var mk = function(){
    var dir = dirs.shift();
    if(dir === ''){
      root = path.sep;
    }
    fs.exists(root+dir, function(exists){
      if(!exists){
        fs.mkdir(root+dir, function(err){
          if(err){
            return callback(err);
          }
          root += dir + path.sep;
          if(dirs.length){
            return mk();
          }else if(callback){
            return callback(null, root);
          }
        });
      }else{
        root += dir + path.sep;
        if(dirs.length){
          return mk();
        }else if(callback){
          return callback(null, root);
        }
      }
    });
  };
  mk();
};

function attemptDownload(attemptsLeft) {
    // If you want the latest and greatest versions then comment out the platform-tools_r16- line and uncomment the next line
    // know though that that will download a 500+ MB file and it takes forever
    //var url = dlLink;
    var url = "http://dl-ssl.google.com/android/repository/platform-tools_r16-" + platform + ".zip";
    var tempFile = "./tmp/platform-tools-" + (new Date().getTime()) + ".zip";
    if(!attemptsLeft){
      throw new Error('Coudln\'t download platform tools in 3 tries... Failing...');
    }
    attemptsLeft--;
    mkDir('tmp', function(err){
      if(err){
        throw err;
      }
      var file = fs.createWriteStream(tempFile);
      var request = http.get(url, function(response) {
          var len = parseInt(response.headers['content-length'], 10);
          var bar = new ProgressBar('Downloading Android ADT Bundle [:bar] :percent :current of :total', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: len
          });
          response.pipe(file);
          response.on('data', function(chunk){
            bar.tick(chunk.length);
          });
          response.on('end', function () {
            console.log('\n');
            var zip = new AdmZip(tempFile);
            mkDir('tools', function(err){
              if(err){
                throw err;
              }
              try{
                var zipEntries = zip.getEntries();
                var entryName = false;
                zipEntries.forEach(function(zipEntry) {
                  if (zipEntry.entryName.match(/aapt/)) {
                    entryName = zipEntry.entryName;
                  }
                });
                if(!entryName){
                  throw new Error('Couldn\'t locate aapt application.');
                }
                zip.extractEntryTo(entryName, 'tools', false, true);
                if(doChmod){
                  fs.chmodSync('tools/'+aaptExe, '755');
                }
                try{
                  fs.unlinkSync(tempFile);
                  fs.unlinkSync('tmp');
                }catch(e){
                  console.log('Failed to remove temp file: '+tempFile);
                  console.log('You might want to delete that to save disk space');
                }
              }catch(e){
                try{
                  fs.unlinkSync(file);
                }catch(e){}
                console.error(e);
                if (attemptsLeft === 0) {
                  throw err;
                } else {
                  attemptDownload(attemptsLeft);
                  return;
                }
              }
            });
          });
      });
    });
}

attemptDownload(3);
