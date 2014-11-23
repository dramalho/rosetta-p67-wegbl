module.exports = (grunt) ->

  # configuration
  grunt.initConfig

    # grunt coffee
    coffee:
      compile:
        expand: true
        cwd: 'src/'
        src: ['**/*.coffee']
        dest: 'dist/js'
        ext: '.js'
        options:
          bare: true
          preserve_dirs: true

    bower:
      install:
        options:
          targetDir: 'dist/js',
          layout: 'byType',
          install: true,
          verbose: true,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {}

    serve:
      path: './dist/'

  # load plugins
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-bower-task'
  grunt.loadNpmTasks 'grunt-serve'

  # tasks
  grunt.registerTask 'default', ['coffee','bower:install','serve']
