var exec, extractRaw, os, parseApk, parseOutput;

os = require('os');

exec = require('child_process').execFile;

parseApk = function(filename, cb) {
  return exec("" + __dirname + "/../tools/aapt", ['l', '-a', filename], {
    maxBuffer: 1024 * 1024
  }, function(err, out) {
    if (err) {
      return cb(err);
    }
    return parseOutput(out, cb);
  });
};

extractRaw = function(string) {
  var parts, sep, value;
  sep = '" (Raw: "';
  parts = string.split(sep);
  value = parts.slice(0, parts.length / 2).join(sep);
  return value.substring(1);
};

parseOutput = function(text, cb) {
  var depth, element, inManifest, indent, input, line, lines, matches, name, parent, parts, rest, result, stack, type, value, _i, _len;
  if (!text) {
    return cb(new Error('No input!'));
  }
  lines = text.split('\n');
  result = {};
  stack = [result];
  inManifest = false;
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    line = lines[_i];
    if (line.trim() === 'Android manifest:') {
      inManifest = true;
      continue;
    }
    if (!inManifest) {
      continue;
    }
    if (line.trim() === '') {
      continue;
    }
    if (line.match(/^N:/)) {
      continue;
    }
    matches = line.match(/^( +)(A|E): ([\w:\-]+)(.*)$/);
    if (!matches) {
      return cb(new Error('Parse failure: ' + line));
    }
    input = matches[0], indent = matches[1], type = matches[2], name = matches[3], rest = matches[4];
    depth = indent.length / 2;
    parent = stack[depth - 1];
    if (type === 'E') {
      element = {};
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
    } else if (type === 'A') {
      value = null;
      if (rest.substring(0, 2) === '="') {
        value = extractRaw(rest.substring(1));
      } else if (rest.substring(0, 12) === '=(type 0x12)') {
        value = rest[14] === '1';
      } else {
        parts = rest.match(/^\(0x[0-9a-f]+\)\=(.*)$/);
        if (!parts) {
          return cb(new Error('Cannot parse value: ' + rest));
        }
        if (parts[1][0] === '"') {
          value = extractRaw(parts[1]);
        } else {
          if (parts[1].substring(0, 11) === '(type 0x10)') {
            value = parseInt(parts[1].substring(13), 16);
          } else {
            value = parts[1];
          }
        }
      }
      parent['@' + name] = value;
    } else {
      return cb(new Error('Unknown type: ' + type));
    }
  }
  return cb(null, result);
};

parseApk.parseOutput = parseOutput;

module.exports = parseApk;
