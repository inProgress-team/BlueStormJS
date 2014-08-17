angular.module('numberFilters', [])

	.filter('length', function() {
		return function(input) {
			var seconds = parseInt(input,10),
				minutes = parseInt(seconds / 60,10),
				hours = "";
			seconds = seconds - 60 * minutes;
			if(isNaN(seconds)||isNaN(minutes)) {
				return "00:00";
			}
			if(minutes>60) {
				hours = parseInt(minutes/60,10);
				minutes = minutes - hours * 60;
				hours=hours+":";
			}

			return hours+parseStrLength(minutes)+":"+parseStrLength(seconds);
		};
	})
    .filter('count', function() {
        return function(input) {
            return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        };
    });


function parseStrLength(input) {
	var res="";
	if(input<10) {
		res+="0";
	}
	return res+input;
}