(function () {
	if($.validator && $.validator.addMethod) {
		$.validator.addMethod("cell_phone_format", function (value, element) {
			var len = value.length;
			var reg = /^1+\d{10}$/;

			return this.optional(element) || (len == 11 && reg.test(value));
		});

		$.validator.addMethod("pwd_format", function (value, element) {
			var len = value.length;
			var allow_char_reg = /^[A-Za-z0-9\d=!\-@._*]+$/;
			var has_a_digital_reg = /\d/;
			var has_a_char_reg = /[A-Za-z]/;

			return this.optional(element) 
				   || 
				   ((len >= 8 && len <= 25) 
				   	&& 
				   	allow_char_reg.test(value) 
				   	&& 
				   	has_a_digital_reg.test(value) 
				   	&& 
				   	has_a_char_reg.test(value));
		});
	}
})();