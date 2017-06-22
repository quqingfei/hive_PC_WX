(function($) {
	$(window.document).ready(function () {
		$.hive.sort = {
			up: {
				nameStringUp: function (a, b) {
					a = a.text();
					b = b.text();
					if(a.length != b.length) {
						return (a.length > b.length) ? 1 : -1;
					}
					else {
						return (a > b) ? 1 : -1;
					}
				},

				numStringUp: function (a, b) {
					a = parseFloat(a.text());
					b = parseFloat(b.text());
					return (a > b) ? 1 : -1;
				}
			},
			down: {
				nameStringDown: function (a, b) {
					a = a.text();
					b = b.text();
					if(a.length != b.length) {
						return (a.length > b.length) ? -1 : 1;
					}
					else {
						return (a > b) ? -1 : 1;
					}
				},

				numStringDown: function (a, b) {
					a = parseFloat(a.text());
					b = parseFloat(b.text());
					return (a > b) ? -1 : 1;
				},

				update_atStringDown: function (a, b) {
					a = a.updated_at;
					b = b.updated_at;
					return (a > b) ? -1: 1;
				}

			}
		};
	});
})(jQuery);