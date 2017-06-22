(function ($) {
	$(document).ready(function () {
		$.hive.init_auth({ pageId: "#body_sessions_new" }, function () {	
	        $('.login-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            rules: {
	                "user[username]": {
	                    required: true
	                },
	                "user[password]": {
	                    required: true
	                },
	                "user[remember_me]": {
	                    required: false
	                }
	            },

	            messages: {
	                "user[username]": {
	                    required: "用户名不能为空！"
	                },
	                "user[password]": {
	                    required: "密码不能为空！"
	                }
	            },

	            invalidHandler: function(event, validator) { //display error alert on form submit   
	                $('.alert-danger', $('.login-form')).show();
	            },

	            highlight: function(element) { // hightlight error inputs
	                $(element).closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function(label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function(error, element) {
	                error.insertAfter(element.closest('.input-icon'));
	            },

	            submitHandler: function(form) {
	                form.submit(); // form validation success, call ajax form submit
	            }
	        });

	        $('.login-form input').keypress(function(e) {
	            if (e.which == 13) {
	                if ($('.login-form').validate().form()) {
	                    $('.login-form').submit(); //form validation success, call ajax form submit
	                }
	                return false;
	            }
	        }).change(function (e) {
	        	$(".alert-danger").hide();
	        });
		});
	});
})(jQuery);