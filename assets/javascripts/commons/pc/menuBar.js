(function () {
	// The logic here will be run by itself. No need to refer to the specific page front-end logic.
	// But this module here should be included in the page if the menu bar is the part of the page.
	function _render(data) {
		var mapping = { 
			"humitureAlarm": "humiture", 
			"shakeAlarm": "shake",
			"energyAlarm": "energy",
			"pictureAlarm": "picture",
			"rayAlarm": "infrared_ray"
		};

		for(var key in data) {
			var id_string = "#hive-menu-" + mapping[key];
			if(data[key] > 0) {
				$(id_string).find(".h-menu-alarm")
										.removeClass('hide')
										.text(data[key]);
			} else {
				$(id_string).find(".h-menu-alarm")
										.addClass('hide');
			}
		}
	}

	function _handleMenuBar () {
		var interval = null;
		var index = 0;
		interval = window.setInterval(function () {
			$('.page-sidebar-menu').find('li.active').bind({
				'mouseover': function () {
					$(this).children('a').css('background-color', '#FFD70D');
				}
			});
			$('.page-sidebar-menu').find('li.active').children('a').addClass('hive-theme-backgroundColor');
			$('.page-sidebar-menu').find('li.active').find('ul li').each(function () {
				if(!$(this).is('.active')) {
					$(this).find('a').removeClass('hive-theme-backgroundColor');
				}
			});

			if(index == 3) {
				window.clearInterval(interval);
			}

			index++;
		}, 500);
		$(".hive-search-link input").keyup(function (e) {
			if(e.keyCode == 13) {
				var str = encodeURI(encodeURI($.trim($(this).val())));
				window.location.href = "/search?search={0}"._format(str);
			}
		});
		$('.search-btn').click(function () {
			$('.hive-search-link').toggleClass('search-open');
			$('.search-btn').toggleClass('hive-theme-backgroundColor btn-active');
		});
	}

	$.hive = $.extend($.hive, {
		menuBar: {
			init: function () {
				_handleMenuBar();
				this.dataCenter = $.hive.getDataCenterIntance();
				this.getCurrentSubDevicesAlarm();
				this.getGroupNames();
			},

			refresh: function () {
				var self = this;

				this.timer(function () {
					self.getCurrentSubDevicesAlarm();
				});
			},

			getCurrentSubDevicesAlarm: function () {
				var self = this;
				this.dataCenter.getSubDevicesAlarmNum(function (res) {
					_render(res.result);
					self.refresh();
				},
				function (err) {
					console.log(err);
				});
			},

			getGroupNames: function () {
				this.dataCenter.getGroupNames(function (res) {
					var groups = res.result;
					if(!groups) {
						return;
					}

					var subMenu = $("#hive-menu-devicesGroup").find("ul");
					var tmpl = "<li><a id=\"hive-menu-devicesGroup-{0}\" href=\"/group?group_id={0}\">{1}</a></li>";

					$.each(groups, function (index, g) {
						var li = $(tmpl._format(g.id, g.name));
						subMenu.append(li);
					});

					if($("#body-home-group").length > 0) {
						var parsedResult = this.parseGroupPageUrl();
						Layout.setSidebarMenuActiveLink("set", parsedResult == "all" ? "#hive-menu-devicesGroup-all" : ("#hive-menu-devicesGroup-" + parsedResult));
					}
				}, function (err) {
					console.log(err);
				}, this);
			},

			parseGroupPageUrl: function () {
			  	var href = window.location.href;
			  	var questionMarkIndex = href.indexOf('?');

			  	if(questionMarkIndex > -1) {
			  		var result = '';
			  		var urlArray = href.split('?');
			  		var paramters = urlArray[1].split('&');

			  		for (var i = paramters.length - 1; i >= 0; i--) {
			  			if(paramters[i].indexOf('group_id=') > -1) {
			  				result = paramters[i].split('=')[1];
			  				break;
			  			}
			  		}

			  		return result;
			  	} else {
			  		return 'all';
			  	}
			},

			timer: function (cb) {
				window.setTimeout(function () {
					cb();
				}, 5 * 60 * 1000);
			}
		}
	});

	$(document).ready(function () {
		$.hive.menuBar.init();
	});
})();