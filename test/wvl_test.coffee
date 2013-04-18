fs = require 'fs'
assert = require 'assert'

parseApk = require '..'

describe 'WVL', ->
    output = null

    before (done) ->
        fs.readFile __dirname + '/samples/wvl.txt', 'utf8', (err, txt) ->
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
        assert.equal(output.manifest[0]['@android:versionName'], '1.1')

    it 'Has a package name', ->
        assert.equal(output.manifest[0]['@package'], 'WestVlinderen.Droid')

    it 'Parses SDK versions', ->
        manifest = output.manifest[0]
        assert.equal(manifest['uses-sdk'][0]['@android:minSdkVersion'], 8)
        assert.equal(manifest['uses-sdk'][0]['@android:targetSdkVersion'], 10)

    it 'Has an application tag', ->
        manifest = output.manifest[0]
        assert.equal(manifest.application.length, 1)

    it 'Has 5 meta-data tags', ->
        manifest = output.manifest[0]
        application = manifest.application[0]
        assert.equal(application['meta-data'].length, 5)

    it 'Application has a label attribute', ->
        manifest = output.manifest[0]
        application = manifest.application[0]
        assert.equal(application['@android:label'], 'WestVlinderen')
