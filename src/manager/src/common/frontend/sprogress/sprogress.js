angular.module('sProgress', [
	'ngProgressLite'
])
	.service('sProgress', function(ngProgressLite) {
		return {
			start: function() {
				ngProgressLite.start();
			},
			complete: function() {
				ngProgressLite.done();
			}
		};
	});
