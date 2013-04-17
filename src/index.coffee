parseApk = (filename, cb) ->
    # TODO: Pipe APK to aapt
    parseOutput(text, cb)

parseOutput = (text, cb) ->
    # TODO: Parse it
    cb(null, null)

parseApk.parseOutput = parseOutput

module.exports = parseApk
