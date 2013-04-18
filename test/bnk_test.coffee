fs = require 'fs'
assert = require 'assert'

parseApk = require '..'

describe 'BNK', ->
    output = null

    before (done) ->
        fs.readFile __dirname + '/samples/bnk.txt', 'utf8', (err, txt) ->
            return done(err) if err
            parseApk.parseOutput txt, (err, out) ->
                return done(err) if err
                output = out
                done()

    it 'Parses correctly', ->
        assert.notEqual(null, output)

    it 'Starts with a manifest tag', ->
        assert.equal(output.manifest.length, 1)

    it 'Contains a version name attribute', ->
        assert.equal(output.manifest[0]['@android:versionName'], '1.0')

    it 'Has a package name', ->
        assert.equal(output.manifest[0]['@package'], 'be.bnk.mobilebanking')

    it 'Has an application tag', ->
        manifest = output.manifest[0]
        assert.equal(manifest.application.length, 1)
