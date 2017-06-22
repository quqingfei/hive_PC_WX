(function ($) {
	$(document).ready(function () {
		$.hive.bgDetails = {
			selectType: null,
			device: null,
			$pageBody: $('.page-quick-bg-bar'),
			$pageToggle: $('.bgBar-toggler'),
			dataCenter: $.hive.getDataCenterIntance(),
			year: null,
			month: null,
			day: null,

			show: function (selectedDeviceId, data, type) {
				this.$pageBody.find('.bgBar-toggler').css('display','block');
				$('.page-quick-bg-bar').addClass('page-quick-bg-bar-show');

				if (this.selectType && type == this.selectType && (this.device != null && data != null && this.device.id == data.id))  {
					return;
				}

				this.selectType = type;
				this.device = data || {};
				this.$pageBody.find('.hive-quick-deviceName').text(data.name);
				this._setTodayTime();
				this.initCalendar();
				this.$pageToggle.find('[data-target=' + type + ']').trigger('click');
			},

			hide: function () {
				this.$pageBody.find('.bgBar-toggler').css('display','none');
				$('.page-quick-bg-bar').removeClass('page-quick-bg-bar-show');
			},

			_getBeforeDay: function () {
				if(this.day == 1) {
					var time = this._getBeforeMonth();
					this.day = this._getMonthDay(this.month, this.year);
					return time + " - " + this._standardizeDay(this.day);
				}
				else {
					this.day--;
				}

				return this.year.toString() + " - " + this._standardizeDay(this.month) + " - " + this._standardizeDay(this.day);
			},

			_showBeforeDay: function () {
				this._getBeforeDay();
				var time = this._getTodayDay();
				this._getNextDay();
				return time;
			},

			_getNextDay: function () {
				if(this.day == this._getMonthDay(this.month, this.year)) {
					this.day = 1;
					return this._getNextMonth() + " - 01";
				}
				else {
					this.day++;
				}
				return  this.year.toString() + " - " + this._standardizeDay(this.month) + " - " + this._standardizeDay(this.day);
			},

			_showNextDay: function () {
				this._getNextDay();
				var time = this._getTodayDay()
				this._getBeforeDay();
				return time;
			},

			_showNextMonth: function () {
				return  (this.month == 12) 
						? (this.year + 1).toString() + " - 01"
						: this.year.toString() + " - " + this._standardizeDay(this.month + 1);
			},

			_getNextMonth: function () {
				if(this.month == 12) {
					this.month = 1;
					this.year++;
				}
				else {
					this.month++;
				}

				return  this.year.toString() + " - " + this._standardizeDay(this.month);
			},

			_getBeforeMonth: function () {
				if(this.month == 1) {
					this.month = 12;
					this.year--;
				}
				else {
					this.month--;
				}
				return  this.year.toString() + " - " + this._standardizeDay(this.month);
			},

			_showBeforeMonth: function () {
				return  (this.month == 1) 
						? (this.year - 1).toString() + " - 12"
						: this.year.toString() + " - " + this._standardizeDay(this.month - 1);
			},

			_getTodayDay: function () {
				return this.year.toString() + " - " + this._standardizeDay(this.month) + " - " + this._standardizeDay(this.day);
			},

			_getTodayMonth: function () {
				return this.year.toString() + " - " + this._standardizeDay(this.month);
			},

			_setTodayTime: function () {
				var arr = $.hive.current_date.split('-');
				this.year = parseInt(arr[0]);
				this.month = parseInt(arr[1]);
				this.day = parseInt(arr[2]);
			},

			_isLeapYear: function (year) {
				return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? true : false;
			},

			_getMonthDay: function (Month, year) {
				var day = {
					1: 31,
					2: this._isLeapYear(year) ? 29 : 28,
					3: 31,
					4: 30,
					5: 31,
					6: 30,
					7: 31,
					8: 31,
					9: 30,
					10: 31,
					11: 30,
					12: 31
				};
				return day[parseInt(Month)];
			},

			_standardizeDay: function (number) {
				return (number <= 9) ? "0" + number.toString() : number.toString();
			},

			_bindCommontEvent: function () {

				var self = this;
				self.$pageToggle.find('.fa-arrow-right').click(function () {
					self.hide();
				});
				self.$pageToggle.find('i').click(function () {
					var type = $(this).attr('data-target');
					if($(this).attr('class').indexOf('fa-arrow-right') == -1) {
						self.$pageToggle.find('i').removeClass('icons-highlignt');
						$(this).addClass('icons-highlignt');
						self.$pageBody.find('.portlet-body > div').addClass('display-none');
					}
					else {
						self.$pageToggle.find('i').removeClass('icons-highlignt');
					}
					$('#quick-bg-calendar').show();
					self.$pageBody.find('.caption i').attr('class',$(this).attr('class'));
					self.$pageBody.find('.caption-subject').text($(this).attr('data-name'));
					self.$pageBody.find('#bg-' + type).parents('div').eq(1).removeClass('display-none');
					self.initChart(type);
				});
				self.$pageBody.find(".chart-options span").click(function () {

      		if($(this).is(".bg-chart-option-actived")) {
        		return;
       	 	}
      		$(this).parent(".chart-options").find("span").removeClass("bg-chart-option-actived");
      		$(this).addClass("bg-chart-option-actived");
      		self.initCalendar();
      		var type = $('.icons-highlignt').attr('data-target');
      		self.initChart(type);
      	});

				$('.bg-calendar-left').click(function () {

					$('.bg-calendar-right span').text($('.bg-calendar-middle span').text());
					$('.bg-calendar-middle span').text($('.bg-calendar-left span').text());
					if($('.bg-calendar-left i').attr('Dtype') == "day") {
						self._getBeforeDay();
						$('.bg-calendar-left span').text(self._showBeforeDay());
					}
					else {
						self._getBeforeMonth();
						$('.bg-calendar-left span').text(self._showBeforeMonth());
					}
					var type = $('.icons-highlignt').attr('data-target');
      		self.initChart(type);
				});
				$('.bg-calendar-right').click(function () {
					$('.bg-calendar-left span').text($('.bg-calendar-middle span').text());
					$('.bg-calendar-middle span').text($('.bg-calendar-right span').text());
					if($('.bg-calendar-right i').attr('Dtype') == "day") {
						self._getNextDay();
						$('.bg-calendar-right span').text(self._showNextDay());
					}
					else {
						self._getNextMonth();
						$('.bg-calendar-right span').text(self._showNextMonth());
					}
					var type = $('.icons-highlignt').attr('data-target');
      		self.initChart(type);
				});
				$('.modal-dialog img').load(function () {
					if($('.modal-dialog').width()) {
						$('.modal-content').addClass('image-height-control');
						$(this).height(($('.modal-dialog').width()-42) * 3 / 4);
					}
					else {
						$('.modal-content').removeClass('image-height-control');
					}
				});
			},

			bindPictureCellClickEvent: function () {
				var style = $(this).attr('style');
				var date_string = $(this).attr("data-date");
				window.setTimeout(function () {
					$('#bg-modal img').attr('src', style.substring(style.indexOf('(') + 1, style.indexOf(')')));
					$('#bg-modal').find('.modal-header').find('span').text(date_string);
					$('#bg-modal-btn').trigger('click');
				}, 10);
			},

			initCalendar: function () {

				if(this.day > this._getMonthDay(this.month,this.year)) {
					this.day = 1;
				}
				if($('.bg-chart-option-actived').attr('Dtype') == "day") {
    			$('.bg-calendar-middle span').text(this._getTodayDay());
    			$('.bg-calendar-right span').text(this._showNextDay());
    			$('.bg-calendar-left span').text(this._showBeforeDay());
    			$('.bg-calendar-middle i').attr('Dtype','day');
    			$('.bg-calendar-right i').attr('Dtype','day');
    			$('.bg-calendar-left i').attr('Dtype','day');
    		}
    		else {
    			$('.bg-calendar-middle span').text(this._getTodayMonth());
    			$('.bg-calendar-right span').text(this._showNextMonth());
    			$('.bg-calendar-left span').text(this._showBeforeMonth());
    			$('.bg-calendar-middle i').attr('Dtype','month');
    			$('.bg-calendar-right i').attr('Dtype','month');
    			$('.bg-calendar-left i').attr('Dtype','month');
    		}

			},

			getTime: function () {
				var self = this;
				var time = new Object();
				this.dataCenter.getgetBgTodayTime(function (res) {
					time.day = res.day;
					time.month = res.month;
					time.year = res.year;
				}, function (err) {
					console.log(err);
				},this);
			},

			getDate: function () {
				this._setTodayTime();
				var date = new Date();
				date.setYear(this.year);
				date.setMonth(this.month-1);
				date.setDate(this.day);
				return date;
			},

			_initDayChartData: function () {
				var data = [];
				for(var i = 0; i <= 23; i++) {
					var obj = [];
					var date = new Date();
					date.setHours(i);
					date.setMinutes(0);
					date.setSeconds(0);
					obj.push(date, "-");
					data.push(obj);
				}
				return data;
			},

			_initMonthChartData: function () {
				var data = [];
				for(var i = 1; i <= this._getMonthDay(this.month, this.year); i++) {
					var obj = [];
					var date = new Date();
					date.setYear(this.year);
					date.setMonth(parseInt(this.month) - 1);
					date.setDate(i);
					obj.push(date, "-");
					data.push(obj);
				}
				return data;
			},

			_initMonthData: function (type) {
				var data = [];
				for(var i = 1; i <= this._getMonthDay(this.month, this.year); i++) {
					var obj = [];
					if(type) {
						obj.push(Date.UTC(this.year, this.month-1, i), null, null);
					}
					else {
						obj.push(Date.UTC(this.year, this.month-1, i), null);
					}
					data.push(obj);
				}
				return data;
			},

			_initDayData: function () {
				var data = [];
				for(var i = 0 ; i <= 23 ; i++) {
					var obj = [];
					obj.push(Date.UTC(this.year, this.month-1, this.day, i, 0, 0), null);
					data.push(obj);
				}
				return data;
			},

			initChart: function (type) {
				var self = this;
				var data = new Object();
				data.type = $(".bg-calendar-middle i").attr('Dtype').toUpperCase();
				data.time = (data.type == 'DAY') 
										? this._getTodayDay().replace(/[ ]/g,"")
										: this._getTodayMonth().replace(/[ ]/g,"");
				data.mac = self._getDeviceMac(type);

				switch (type) {
					case 'temp':
						this.dataCenter.getBgTempChartData(data, function (res) {
							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);
							$.hive.initchart.initTemp("bg-"+type, data, res);
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case "hum":
						this.dataCenter.getBgHumitureChartData(data, function (res) {
							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);
							$.hive.initchart.initHum("bg-"+type, data, res);
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case 'shake':
						this.dataCenter.getBgShakingChartData(data, function (res) {
							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);
							$.hive.initchart.initShake("bg-"+type, data, res);
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case 'ray':
						this.dataCenter.getBgFlowrateChartData(data, function (res) {
							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);
							$.hive.initchart.initRay("bg-"+type, data, res);
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case 'energy':
						this.dataCenter.getBgEnergyConsumptionChartData(data, function (res) {
							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);
							$.hive.initchart.initEnergy("bg-"+type, data, res);
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case 'image':
						var _data = { items: [] };
						$('#bg-image').empty();
						this.dataCenter.getSingleDeviceImages(data.time, self.device.id, function (res) { 
							if(res.code == 1000) {
								if (res.result.length == 0) {
									this._hideOrShow("#bg-image", ".bg-no-data");
									return;
								}
								this._hideOrShow(".bg-no-data", "#bg-image");

								$.each(res.result, function (index, item) {
									var date = new Date(item.created_at);
									if(data.type == "DAY") {
										if(date.getFullYear() == self.year && (date.getMonth() + 1) == self.month && date.getDate() == self.day) {
											var obj = new Object();
											obj.device_id = item.device_id;
											obj.url = item.path;
											obj.has_data = item.has_data || item.path.length > 0;
											obj.date = item.created_at;
											_data.items.push(obj);
										}
									}
									else {
										if(date.getFullYear() == self.year && (date.getMonth() + 1) == self.month) {
											var obj = new Object();
											obj.device_id = item.device_id;
											obj.url = item.path;
											obj.has_data = item.has_data || item.path.length > 0;
											obj.date = item.created_at;
											_data.items.push(obj);
										}
									}
								});
								$('#bg-image').setTemplateElement("bg-picture-tmpl");
		        		$('#bg-image').processTemplate(_data);
								$('#bg-image .hive-picture-cell').click(this.bindPictureCellClickEvent);
								$('#bg-image .hive-picture-cell').height($('#bg-image .hive-picture-cell').width()*3/4);
							}
						}, function (err) {
							console.log(err);
						}, this);
						break;
					case 'map':
						var _type = data.type;
						$('#bg-map').empty();
						this.dataCenter.getBgMapData(data, function (res) {
							var result = res.result;

							if(res.code != 1000) {
								return;
							}

							if (res.result.length == 0) {
								this._hideOrShow("#bg-" + type, ".bg-no-data");
								return;
							}
							this._hideOrShow(".bg-no-data", "#bg-" + type);

							var option = {
								containerId: "bg-"+type,
								data: {
									items: [],
								},
								settings: {
			          	center: {longitude: null, latitude: null}
			          }
							};
							var longitude = [];
							var latitude = [];
							if(_type == "DAY") {
								if(!result.length) {
									return;
								}
								$.each(result, function (index, item) {
									var index = $.inArray(item.longitude, longitude);
									if(index == -1 || (latitude[index] != item.latitude)) {
										longitude.push(item.longitude);
										latitude.push(item.latitude);
									}
								});
								$.each(longitude, function (index, item) {
									var obj = new Object();
									obj.longitude = longitude[index];
									obj.latitude = latitude[index];
									option.data.items.push(obj);
								});
								option.settings.center.longitude = longitude[0];
								option.settings.center.latitude = latitude[0];
							}
							else {
								var data = [];
								$.each(result, function (index, item) {
									if(item.location) {
										data.push(item.location);
									}
								});
								if(!data.length) {
									return;
								}
								$.each(data, function (index, item) {
									var index = $.inArray(item.longitude, longitude);
									if(index == -1 || (latitude[index] != item.latitude)) {
										longitude.push(item.longitude);
										latitude.push(item.latitude);
									}
								});
								$.each(longitude, function (index, item) {
									var obj = new Object();
									obj.longitude = longitude[index];
									obj.latitude = latitude[index];
									option.data.items.push(obj);
								});
								option.settings.center.longitude = longitude[0];
								option.settings.center.latitude = latitude[0];
							}

							var newMap = $.hive.initMap(option);
						}, function (err) {
							console.log(err);
						}, this);
						break;
				}
			},

			_getDeviceMac: function (type) {
				var map = {
					"temp": "温湿度蜂巢",
					"hum": "温湿度蜂巢",
					"shake": "加速度蜂巢",
					"ray": "红外线蜂巢",
					"energy": "插座",
					"image": "摄像头蜂巢",
					"map": "插座"
				};
				var deviceType = map[type];
				var mac;
				$.each(this.device.sub_devices, function (index, item) {
					if(item.type == deviceType) {
						mac = item.mac;
					}
				});
				return mac;
			},

      _Sort: {
      	sortUp: {
      		timeStringSort: function (a, b) {
      			return parseInt(a.time) > parseInt(b.time) ? 1 : -1;
      		}
      	},
      	sortDown: {
      	}
      },

      _hideOrShow: function (hide, show) {
      	$(hide).hide();
      	$(show).removeClass("hide");
      	$(show).show();
      },

			init: function () {
				this._bindCommontEvent();
			}
		};
		$.hive.bgDetails.init();
	});
})(jQuery);