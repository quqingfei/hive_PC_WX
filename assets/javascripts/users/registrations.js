(function ($) {
	$(document).ready(function () {
		$.hive.init_auth({ pageId: "#body-registrations-new" }, function () {
			$("#register-back-btn").click(function () {
				window.location.href = "/users/sign_in";
			});

			$('.register-form').show();

	        $('.register-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            ignore: "",
	            rules: {
	                "user[full_name]": {
	                    required: false
	                },
	                "user[phone]": {
	                	required: false,
	                	cell_phone_format: true
	                },
	                "user[username]": {
	                    required: true
	                },
	                "user[password]": {
	                    required: true,
	                    pwd_format: true
	                },
	                "user[password_confirmation]": {
	                    equalTo: "#user_password"
	                }
	            },

	            messages: {
	                "user[phone]": {
	                	cell_phone_format: "手机号码格式不对！"
	                },
	                "user[username]": {
	                	required: "用户名不能为空！"
	                },
	                "user[password]": {
	                	required: "密码不能为空！",
	                	pwd_format: "请输入长度在8～25之间，并且至少包含一个数字、一个大写或小写字母的密码！"
	                },
	                "user[password_confirmation]": {
	                	equalTo: "两次密码输入不一致！"
	                }
	            },

	            invalidHandler: function(event, validator) { //display error alert on form submit   

	            },

	            highlight: function(element) { // hightlight error inputs
	                $(element).closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function(label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function(error, element) {
	                if(element.closest('.input-icon').size() === 1) {
	                    error.insertAfter(element.closest('.input-icon'));
	                } else {
	                    error.insertAfter(element);
	                }
	            },

	            submitHandler: function(form) {
	                form.submit();
	            }
	        });

	        $('.register-form input').keypress(function(e) {
	            if (e.which == 13) {
	                if ($('.register-form').validate().form()) {
	                    $('.register-form').submit();
	                }
	                return false;
	            }
	        }).change(function (e) {
	        	$(".alert-danger").hide();
	        });
		});
	});
})(jQuery);