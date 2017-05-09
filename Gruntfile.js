module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';\n'
      },
      scripts: {
        src: [
          'client/app/app.js',
          'client/app/components/*.js',
          'client/app/dashboard/*.js',
          'client/app/input/*.js',
          'client/app/landing/*.js',
          'client/app/services/*.js'
      ],
        dest: 'client/app/dist/scripts.concat.js'
      }
    },

    uglify: {
      scripts: {
        files: {
          'client/app/dist/scripts.min.js': ['client/app/dist/scripts.babel.js']
        }
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      style: {
        files: {
          'client/app/dist/style.min.css': ['client/lib/angular-material/angular-material.min.css', 'client/style.css']
        }
      }
    },

    babel: {
		options: {
			sourceMap: true,
			presets: ['es2015']
		},
		scripts: {
			files: {
				'client/app/dist/scripts.babel.js': ['client/app/dist/scripts.concat.js']
			}
		}
	}
  })

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('babel-preset-es2015');

  grunt.registerTask('build', [
    'concat',
    'babel',
    'uglify',
    'cssmin'
  ])
};
