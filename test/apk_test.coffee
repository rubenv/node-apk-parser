assert = require 'assert'

parseApk = require '..'

describe 'APK', ->
    output = null

    before (done) ->
        parseApk __dirname + '/samples/test.apk', (err, out) ->
            return done(err) if err
            output = out
            done()

    it 'Parses correctly', ->
        assert.notEqual(null, output)

    it 'Starts with a manifest tag', ->
        assert.equal(output.manifest.length, 1)

    it 'Has a package name', ->
        assert.equal(output.manifest[0]['@package'], 'com.example.android.snake')

    it 'Has an application tag', ->
        manifest = output.manifest[0]
        assert.equal(manifest.application.length, 1)
