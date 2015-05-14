module.exports = function(grunt) {

	grunt.initConfig({
		bowerjson: grunt.file.readJSON('../bower.json'),
	    watch: {"scripts":{"files":["./scripts/**/*.js"],"tasks":["snipper","uglify","usebanner"],"options":{"nospawn":true}},"styles":{"files":["./less/**/*.less"],"tasks":["less"],"options":{"nospawn":true}}},
		snipper: {
	      js: {
	        files: {
	          '../dist/': ['./scripts/<%=bowerjson.name%>.js']
	        }
	      }
	    },
		uglify: {
	      min: {
	        options: {
	          mangle: false,
	          compress: true,
	          sourceMap: true,
	          preserveComments: 'some'
	        },
	        files: {
	          '../dist/<%=bowerjson.name%>.min.js': ['../dist/<%=bowerjson.name%>.js']
	        }
	      }
	    },
		less: {
			styles: {
		        options: {
		          compress: false,
		          yuicompress: true,
		          optimization: 2
		        },
		        files: {
		          "../dist/brahma.overlay.css": "./less/main.less"
		        }
		  	}
		},
		banner: '/** Created by Morulus */',
		usebanner: {
		    dist: {
				options: {
					position: 'top',
					banner: '<%= banner %>'
				},
				files: {
					src: ['../dist/<%=bowerjson.main.join("','")%>']
				}
		    }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-snipper');
grunt.loadNpmTasks('grunt-banner');

	grunt.registerTask('default', ['less','snipper','uglify','usebanner','watch']);
};