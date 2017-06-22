(function ($) {
	$.hive = {
		init_auth: function (options, cb) {
			var defaults = { pageId: '', menuId: '' };
			defaults = $.extend(defaults, options);

			if($(defaults.pageId).length > 0) {
				Metronic.init(); // init metronic core components
				Layout.init(); // init current layout
				cb();
			}
		},

		init: function (options, cb) {
			this.init_auth(options, function() {
				if(options.menuId) {
					Layout.setSidebarMenuActiveLink("set", options.menuId);
				}
				cb();

				$.hive.bindEventToTrigger();
			});
		},

		buildObservable: function (obj) {
			var to_s = Object.prototype.toString;
			for(var field in obj) {
				switch(to_s.call(obj[field])) {
					case "[object Number]":
					case "[object String]":
					case "[object Boolean]":
						obj[field] = ko.observable(obj[field]);
					break;

					case "[object Array]":
						obj[field] = ko.observableArray(obj[field]);
					break;

					case "[object Null]":
						obj[field] = ko.observable();
					break;
				}
			}
		},
		
		getCurrentPageInfo: function (pageId, getMenuId) {
			var specifiedPageName = pageId.split('-')[2];
			var menuItemId = 'hive-menu-' + (getMenuId ? getMenuId() : specifiedPageName);

			return { 
					  pageId: ('#' + pageId), 
					  menuId: ('#' + menuItemId) 
				   };
		},

		showDeviceDetails: function (selectedDeviceId) {
			$.hive.deviceDetailsPage.show(selectedDeviceId);
		},

		showBgBarDetails: function (selectedDeviceId, data, type) {
			$.hive.bgDetails.show(selectedDeviceId, data, type);
		},

		bindEventToTrigger: function () {
      $('.trapezoid-toggler').click(function (e) {
          var body = $('body'),
              self = $(this),
              closeArrow = $("<i class=" + "'fa fa-arrow-right'" + ">");
              openArrow = $("<i class=" + "'fa fa-arrow-left'" + ">")
          body.toggleClass('page-quick-sidebar-open', 'slow');
          $('.quick-sidebar-blackbox').fadeToggle(300);

          if (body.hasClass('page-quick-sidebar-open')) {
              self.find('i').remove();
              self.append(closeArrow);
              $('.trapezoid-toggler').css('display','block');
          } else {
              self.find('i').remove();
              self.append(openArrow);
              $('.trapezoid-toggler').css('display','none');
          }
      });
		},

		startPageLoading: function () {
			$('body').find('.page-loading').removeClass("hide");
		},

		stopPageLoading: function () {
			$('body').find('.page-loading').addClass("hide");
		},

		logErrorAndHideLoading: function (err) {
			console.log(err);

        	$.hive.stopPageLoading();
		},
		checkNormal: function (data) {
			var status = "设备运行正常";
			var validation = $.hive.validation;
			var humitures = data.humitures;
			var pictures = data.pictures;
			var rays = data.rays;
			var shakes = data.shakes;
			var energy = data.energy;
			var humituresAlarm = (humitures && validation.isOutDate(humitures[0].updated_at));
			var raysAlarm = (rays && validation.isOutDate(rays[0].updated_at));
			var shakesAlarm = (shakes && validation.isOutDate(shakes[0].updated_at));
			var energyAlarm = (energy && validation.isOutDate(energy.updated_at));
			var picturesAlarm = (pictures && validation.isOutDate(pictures[0].updated_at));
			if(humituresAlarm || raysAlarm || shakesAlarm || energyAlarm || picturesAlarm) {
				status = "设备超时";
				return status;
			}
			humituresAlarm = (humitures && (validation.isTemperatureWarning(humitures[0].temperature) || validation.isHumidityWarning(humitures[0].humidity)));
			shakesAlarm = (shakes && validation.isShakeWarning(shakes[0].shake));
			energyAlarm = (energy && validation.isEnergyWarning(energy.energy));
			if(humituresAlarm) {
				status = "温湿度异常";
			}
			else if(shakesAlarm) {
				status = "震动异常";
			}
			else if (energyAlarm) {
				status = "能耗异常";
			}
			else {
				return status;
			}
		}
	};

})(jQuery);