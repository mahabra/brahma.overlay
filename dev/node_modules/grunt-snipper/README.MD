grunt-snipper
--

>Allows you to split files into snippets, that placed in different files. It uses Underscore to build it.

This plugin requires [Grunt](http://gruntjs.com/).


## Get it
```shell
npm i grunt-snipper
```

## Use it

You need to configure the plugin work through [Configuring tasks](http://gruntjs.com/configuring-tasks). 
Specify the file you want to collect, and the directory as the key object where the file should be collected.

Here's example:
```javascript
grunt.initConfig({
	snipper: {
	  development: {
	    files: {
	      '../scripts/': ['./scripts/core.js']
	    }
	  }
	}
});
grunt.loadNpmTasks('grunt-snipper');
grunt.registerTask('default', ['snipper']);
```

File must have classic syntax of templates `<%=%>`. To insert content of file, you should use function `$.snippet(filename)` inside the `<%=%>`.

```html
var submodule = <%=$.snippet('submodule.js')%>;
</div>
```

Content of sebmodule:
```
{
	foo: 'bar'
}
```

Result will be:
```
var submodule = {
	foo: 'bar'
};
```

Also snippets can have own snippets. Paths to childs files are relative. Therefore, in this case it is convenient to use a hierarchical structure.
```
/main.js
/modules/mymodule.js
/modules/mymodule/functions/foo.js
```
