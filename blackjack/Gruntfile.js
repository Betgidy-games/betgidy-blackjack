//the wrapper function
module.exports = function (grunt) {
	grunt.initConfig({
		//read the settings from package.json into the pkg property
		pkg: grunt.file.readJSON('package.json'),

		//clean out content in dist folder
		clean: ["dist/"],

		// Reads HTML for usemin blocks to enable smart builds that can automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
		  html: 'index.html',
		  options: {
			dest: 'dist'
		  }
		},
		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
		  html: 'dist/index.html',
		  options: {
			dest: 'dist'
		  }
		},
		// Renames files for browser caching purposes
		rev: {
		  dist: {
			files: {
			  src: [
				'dist/js/*.js',
				'dist/css/*.css'
				//needed for images? >> ideally yes but not doing it for now because if we do we have to vhange the reference of the images including the cdn reference
			  ]
			}
		  }
		},
		//concatinate files
		// concat:{

		// },
		//uglify concatinated files
		// uglify:{

		// }
		// Copy remaining files
		copy: {
		  main: {
			files: [
			  // includes files within path
			  {expand: true, src: ['include/*'], dest: 'dist/', filter: 'isFile'},
			  {expand: true, src: ['index.html'], dest: 'dist/', filter: 'isFile'},
			  {expand: true, src: ['img/**'], dest: 'dist/'},
			  {expand: true, src: ['sounds/**'], dest: 'dist/'},
			],
		  },
		},
		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'img/',
					src: ['**/*.{png,jpg,jpeg}'],
					dest: 'dist/img/'
				}]
			}
		}
	});
	/* Load in the Grunt plugins
	 * usemin exports 2 built-in tasks called useminPrepare and usemin.
	 * useminPrepare prepares the configuration to transform specific blocks in the 
	   scrutinized file into a single line, targeting an optimized version of the files	
	 * usemin replaces the blocks by the file they reference, and replaces all references 
	   to assets by their revisioned version if it is found on the disk. This target modifies 
	   the files it is working on
	*/
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.registerTask('build', [
		'clean',
		'copy:main',
		'useminPrepare',		
		'concat:generated',
		'cssmin:generated',
		'uglify:generated',
		'rev',
		'usemin',
		//'imagemin'
	]); 
};
