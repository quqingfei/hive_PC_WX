$(document).ready(function () {
	var options = $.hive.getCurrentPageInfo('body-home-user_center');

	$.hive.init(options, function () {
		function UserCenter() {
			this.dataCenter = $.hive.getDataCenterIntance();
			self = this;
		}

		$.extend(UserCenter.prototype, {
			init: function () {
				this.updateUserData();
			},
			updateUserData: function(){
				$(".hive-repeat-usercenter").click(function(){
					var username =	$("input#username").val();
					var name = $("input#name").val();
					var tel = $("input#tel").val();
					if (tel) {
						var telReg = !!tel.match(/(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
					}
					var mail = $("input#e-mail").val();
					var oldpwd = $("input#oldpwd").val();
					var newpwd = $("input#newpwd").val();
					var repeatpwd = $("input#repeatpwd").val();
					var pwdReg= !!newpwd.match(/^(?!(?:\d*$))[A-Za-z0-9]{6,20}$/);
					$("input#tel").focus(function(){
						$(".tel_tip").text("");
					});
					$("input#newpwd").focus(function(){
						$(".pwd_tip").text("");
					})
					$("input#oldpwd").focus(function(){
						$(".oldpwd_tip").text("");
					})
					 if(telReg == false){
						$(".tel_tip").text("请输入正确的电话号码").css({color:"#a94442",fontSize:"10px"});
						return false;
					}
					if(pwdReg == false){
						$(".pwd_tip").text("最少包含1个英文，不得少于6位,不能为空").css({color:"#a94442",fontSize:"10px"});
						return false;
					}
					if(newpwd != repeatpwd){
						$(".pwd_tip").text("两次输入的密码不一致,请重新输入").css({color:"#a94442",fontSize:"10px"});
						$("input#newpwd").val("");
						$("input#repeatpwd").val("");
						return false;
					}
					var data = {
						user: {
			        			full_name: name,
			        			phone: tel,
			        			email:mail,
			        			password: newpwd,
			        			old_password:oldpwd
						}
		        		};
		        		self.dataCenter.updateUserData(data,function(res){
		        			if(res.message == "旧密码错误") {
		        				$(".oldpwd_tip").text("旧密码错误，请重新输入!").css({color:"#a94442",fontSize:"10px"});
		        			}
						else {
							window.location.href = window.location.href.replace("user_center","users/sign_in");
						}
					},this.errorCallback,this);
				});
				$('.hive-relog').click(function () {
						window.location.href = window.location.href.split('/user_center')[0];
				});
			},

			 errorCallback: function (err) {
				console.log(err);
			},

		});

		var userCenter = new UserCenter();
		userCenter.init();
	});
});