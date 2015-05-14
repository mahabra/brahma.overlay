var fs = require('fs');
var _ = require('underscore');
var path = require('path');
exports.init = function() {
	return new (function() {
	
		this.render = function(source, build) {
			var file = this.getFile(source);
			fs.writeFileSync(build, file.render());
			return true;
		}

		this.getFile = function(source) {
			var hp = this;
			return new (function(source) {
				this.source = source;
				this.dirname = path.dirname(source);
				/* Render this file */
				this.render = function() {
					var fc = fs.readFileSync(this.source, 'utf8');
					var templated = _.template(fc, {
						$: this,
						_: _
					});
					return templated({
						$: this,
						_: _
					});
				}
				/* Render subfile */
				this.snippet = function(filepath) {

					var fh = hp.getFile(this.dirname+(filepath.substring(0,1)=='/' ? '':'/')+filepath);
					return fh.render();
				}
			})(source);
		};
	})();
}
