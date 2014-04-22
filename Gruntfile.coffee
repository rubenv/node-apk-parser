module.exports = (grunt) ->
    @loadNpmTasks('grunt-contrib-clean')
    @loadNpmTasks('grunt-contrib-coffee')
    @loadNpmTasks('grunt-contrib-watch')
    @loadNpmTasks('grunt-contrib-jshint')
    @loadNpmTasks('grunt-mocha-cli')
    @loadNpmTasks('grunt-release')

    @initConfig
        coffee:
            options:
                bare: true
            all:
                expand: true,
                cwd: 'src',
                src: ['*.coffee'],
                dest: 'lib',
                ext: '.js'

        jshint:
            options:
                jshintrc: '.jshintrc'
            all: [ 'install.js' ]

        clean:
            all: ['lib']

        watch:
            all:
                files: ['src/**.coffee', 'test/**']
                tasks: ['test']

        mochacli:
            options:
                files: 'test/*_test.coffee'
                compilers: ['coffee:coffee-script']
            spec:
                options:
                    reporter: 'spec'
                    slow: 10000
                    timeout: 20000

    @registerTask 'default', ['test']
    @registerTask 'build', ['clean', 'jshint', 'coffee']
    @registerTask 'package', ['build', 'release']
    @registerTask 'test', ['build', 'mochacli']
