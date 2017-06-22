(function ($) {
	$(window.document).ready(function () {
		function wx_chart () {
			this.title = "";
			this.maxName = "";
			this.minName = "";
			this.averageName = "";
			this.maxTime = "";
			this.minTime = "";
			this.averageTime = "";
			this.maxNum = "";
			this.averageNum = "";
			this.minNum = "";
			this.time= "";
			this.images= [];
			this.ifImage=false;
			this.ifMap=false;
			$.hive.buildObservable(this);
			this.init();
		}

		$.extend(wx_chart.prototype, {
			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.bindCommonEvent();
			},

			bindCommonEvent: function () {
				$('.wx-deviceChart').on('touchstart', this.chartMoveStart);
				$('.wx-deviceChart').on('touchend', this.chartMoveEnd);
			},

			chartMoveStart: function (ev) {
				var self = $.hive.deviceChart;
				self.startX = ev.originalEvent.touches[0].pageX;
				self.startY = ev.originalEvent.touches[0].pageY;
				return false;
			},

			chartMoveEnd: function (ev) {
				var endX, endY;
				var self = $.hive.deviceChart;
				endX = ev.originalEvent.changedTouches[0].pageX;
				endY = ev.originalEvent.changedTouches[0].pageY;
				var result = $.hive.returnMoveDireaction(self.startX, self.startY, endX, endY);
				if(result == 4) {
					self.Directiontype = "left"
					self.deviceChartShow(self.type, self.device);
				}
				else if (result == 3) {
					self.Directiontype = "right"
					self.deviceChartShow(self.type, self.device);
				}
				else {
					self.Directiontype = "";
				}
				self.Directiontype = "";
				ev.originalEvent.stopPropagation();
				return false;
			},

			changeChart: function () {
				if($('.wx-deviceChart .fa-caret-down').length) {
					$('.wx-deviceChart .fa-caret-down').attr("class",'fa fa-caret-up');
					$('.wx-deviceChart .header-toggle').text('每日');
				}
				else {
					$('.wx-deviceChart .fa-caret-up').attr("class",'fa fa-caret-down');
					$('.wx-deviceChart .header-toggle').text('每月');
				}
				this.deviceChartShow(this.type, this.device);
			},

			deviceChartShow: function (type, device) {
				this.device = device;
				this.type = type;
				this.clearInfo();
				switch(type) {
					case "temp":
						this.initTemp(true);
						break;
					case "hum":
						this.initTemp(false);
						break;
					case "shake":
						this.initShake();
						break;
					case "ray":
						this.initRay();
						break;
					case "energy":
						this.initEnergy();
						break;
					case "map":
						this.initMap();
						break;
					case "image":
						this.initImage();
						break;
				}
				$('.wx-deviceChart').addClass('wx-deviceChart-show');
			},
			
			initInfo: function () {
				if(this.mintime) {
					this.minNum(this.min.toFixed(2));
					this.minTime(this.mintime);
				}
				if(this.maxtime) {
					this.maxNum(this.max.toFixed(2));
					this.maxTime(this.maxtime);
				}
				if(this.sumNum) {
					this.averageNum((this.sum/this.sumNum).toFixed(2));
				}
				if(this.averageNum()) {
					this.averageTime(this.time());
				}
			},

			formatDate: function (time) {
				var date = new Date(time);
				var Hours = date.getHours();
				var Minutes = date.getMinutes();
				Minutes = (Minutes < 10) ? "0" + Minutes : Minutes;
				Hours = (Hours < 10) ? "0" + Hours : Hours;
				return "{0}:{1}"._format(Hours, Minutes);
			},

			formatMonth: function (time) {
				var date = new Date(time);
				var Month = date.getMonth() + 1;
				var Day = date.getDate();
				Month = (Month < 10) ? "0" + Month : Month;
				Day = (Day < 10) ? "0" + Day : Day;
				return "{0}-{1}"._format(Month, Day);
			},

			getInfoDate: function (item, name) {
				var num = item[name];
				if(num == null) {
					return;
				}
				this.sum += num;
				this.sumNum++;
				if(num > this.max) {
					this.max = num;
					this.maxtime = this.formatDate(item.updated_at);
				}
				if(num < this.min) {
					this.min = num;
					this.mintime = this.formatDate(item.updated_at);
				}
			},

			getInfoHumMonth: function (item, name) {
				var num = item[name];
				if(num == null) {
					return;
				}
				this.sum += num;
				this.sumNum++;
				if(num > this.max) {
					this.max = num;
					this.maxtime = this.formatMonth("{0}-{1}"._format(this.time(), item.time + 1));
				}
				if(num < this.min) {
					this.min = num;
					this.mintime = this.formatMonth("{0}-{1}"._format(this.time(), item.time + 1));
				}
			},

			clearInfo: function () {
				this.min = 9999;
				this.max = -9999;
				this.sum = 0;
				this.mintime = "";
				this.maxtime = "";
				this.sumNum = 0;
				this.minNum("");
				this.minTime("");
				this.maxTime("");
				this.maxNum("");
				this.averageTime("");
				this.averageNum("");
				this.ifImage(false);
				this.ifMap(false);
				this.images([]);
			},

			setDayAverageTime: function (data) {
				var d = data.time.split('-');
				this.time("{0}-{1}-{2}"._format(d[0], d[1], d[2]));
				this.day = this.time(); 
			},

			setMonthAverageTime: function (data) {
				var d = data.time.split('-');
				this.time("{0}-{1}"._format(d[0], d[1]));
			},

			initTemp: function (isTemp) {
				if(isTemp) {
					this.title("温度曲线(°C)");
					this.maxName("最高温度");
					this.minName("最低温度");
					this.averageName("平均温度");
					var data = this.initSendData('temp');
					this.dataCenter.getBgTempChartData(data, function (res) {
						$.hive.initchart.initTemp("wx-chart", data, res);
						var self = this;
						if(data.type == "DAY") {
							this.setDayAverageTime(data);
							$.each(res.result, function (index, item) {
								self.getInfoDate(item, "temperature");
							});
						}
						else {
							this.setMonthAverageTime(data);
							$.each(res.result, function (index, item) {
								self.getInfoHumMonth(item, "min");
								self.getInfoHumMonth(item, "max");
							});
						}
						this.initInfo();
					}, function (err) {
						console.log(err);
					}, this);
				}
				else {
					this.title("湿度曲线(%)");
					this.maxName("最高湿度");
					this.minName("最低湿度");
					this.averageName("平均湿度");
					var data = this.initSendData('hum');
					this.dataCenter.getBgHumitureChartData(data, function (res) {
						$.hive.initchart.initHum("wx-chart", data, res);
						var self = this;
						if(data.type == "DAY") {
							this.setDayAverageTime(data);
							$.each(res.result, function (index, item) {
								self.getInfoDate(item, "humidity");
							});
						}
						else {
							this.setMonthAverageTime(data);
							$.each(res.result, function (index, item) {
								self.getInfoHumMonth(item, "min");
								self.getInfoHumMonth(item, "max");
							});
						}
						this.initInfo();
					}, function (err) {
						console.log(err);
					}, this);
				}
			},

			initShake: function () {
				this.title("震动曲线(次)");
				this.maxName("最高震动");
				this.minName("最低震动");
				this.averageName("平均震动");
				var data = this.initSendData('shake');
				this.dataCenter.getBgShakingChartData(data, function (res) {
					$.hive.initchart.initShake("wx-chart", data, res);
					var self = this;
					if(data.type == "DAY") {
						this.setDayAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoDate(item, "num");
						});
					}
					else {
						this.setMonthAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoHumMonth(item, "count")
						});
					}
					this.initInfo();
				}, function (err) {
					console.log(err);
				}, this);
			},

			initRay: function () {
				this.title("人流曲线(人)");
				this.maxName("最高人流");
				this.minName("最低人流");
				this.averageName("平均人流");
				var data = this.initSendData('ray');
				this.dataCenter.getBgFlowrateChartData(data, function (res) {
					$.hive.initchart.initRay("wx-chart", data, res);
					var self = this;
					if(data.type == "DAY") {
						this.setDayAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoDate(item, "count");
						});
					}
					else {
						this.setMonthAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoHumMonth(item, "count");
						});
					}
					this.initInfo();
				}, function (err) {
					console.log(err);
				}, this);
			},

			initEnergy: function () {
				this.title("能耗曲线(Kw/h)");
				this.maxName("最高能耗");
				this.minName("最低能耗");
				this.averageName("平均能耗");
				var data = this.initSendData('energy');
				this.dataCenter.getBgEnergyConsumptionChartData(data, function (res) {
					$.hive.initchart.initEnergy("wx-chart", data, res);
					var self = this;
					if(data.type == "DAY") {
						this.setDayAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoDate(item, "energy");
						});
					}
					else {
						this.setMonthAverageTime(data);
						$.each(res.result, function (index, item) {
							self.getInfoHumMonth(item, "count");
						});
					}
					this.initInfo();
				}, function (err) {
					console.log(err);
				}, this);
			},

			initMap: function () {
				this.ifMap(true);
				this.title("地理位置");
				$('#deviceChart-map').empty();
				var data = this.initSendData('map');
				this.dataCenter.getBgMapData(data, function (res) {
					var result = res.result;
					if(res.code != 1000) {
						return;
					}
					var option = {
						containerId: "deviceChart-map",
						data: {
							items: [],
						},
						settings: {
	          	center: {longitude: null, latitude: null}
	          }
					};
					var longitude = [];
					var latitude = [];
					if(data.type == "DAY") {
						this.setDayAverageTime(data);
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
						this.setMonthAverageTime(data);
						var _data = [];
						$.each(result, function (index, item) {
							if(item.location) {
								_data.push(item.location);
							}
						});
						if(!_data.length) {
							return;
						}
						$.each(_data, function (index, item) {
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
			},

			initImage: function () {
				this.ifImage(true);
				this.title("影像");
				var data = this.initSendData('image');
				this.dataCenter.getSingleDeviceImages(data.time, this.device.id, function (res) {
					var self = this;
					if(res.code == 1000) {
						(data.type == "DAY") ? self.setDayAverageTime(data) : self.setMonthAverageTime(data);
						$('.deviceChart-image .row').empty();
						$.each(res.result, function (index, item) {
							//fixed issue: new Date(created_at) since it would be invalid date on ios
							var date = item.created_at.split(" ")[0].split("-");
							var thisDate = new Date(self.time());
							if(item.path.length && item.path[0] != '/') {
								item.path = "/" + item.path;
							}
							if(data.type == "DAY") {
								if(parseInt(date[0]) == thisDate.getFullYear() && parseInt(date[1]) == (thisDate.getMonth() + 1) && parseInt(date[2]) == thisDate.getDate()) {
									self.images.push(item.path);
								}
							}
							else {
								if(parseInt(date[0]) == thisDate.getFullYear() && parseInt(date[1]) == (thisDate.getMonth() + 1)) {
									self.images.push(item.path);
								}
							}
						});
						$('.deviceChart-image .hive-picture-cell').height($('.deviceChart-image .hive-picture-cell').width()*3/4);
					}
				}, function (err) {
					console.log(err);
				}, this);
			},

			initSendData: function (type) {
				return {
					mac: this._getDeviceMac(type),
					type: ($('.wx-deviceChart .fa-caret-down').length) ? "MONTH" : "DAY",
					time: (this.time().length) ? this.getTime(this.time()) : $.hive.current_date.split(' ')[0]
				}
			},

			getTime: function (date) {
				var IsMonth = $('.wx-deviceChart .fa-caret-down').length > 0;
				if (this.Directiontype == "left") {
					if(IsMonth) {
						return this.getBeforeMonth(date);
					}
					else {
						return this.getBeforeDay(date);
					}
				}
				else if (this.Directiontype == "right"){
					if(IsMonth) {
						return this.getNextMonth(date);
					}
					else {
						return this.getNextDay(date);
					}
				}
				else {
					if(IsMonth) {
						var d = this.day.split('-');
						return "{0}-{1}"._format(d[0], d[1]);
					}
					else {
						var date = new Date(this.time());
						date.setDate(this.day.split('-')[2]);
						var Year = date.getFullYear();
						var Month = date.getMonth() + 1;
						var Day = date.getDate();
						Month = Month < 10 ? "0" + Month : Month;
						Day = Day < 10 ? "0" + Day : Day;
						return "{0}-{1}-{2}"._format(Year, Month, Day);
					}
				}
			},

			getNextDay: function (date) {
				var d = new Date(date);
				d.setDate(d.getDate() + 1);
				return "{0}-{1}"._format(d.getFullYear(), this.formatMonth(d));
			},

			getBeforeDay: function (date) {
				var d = new Date(date);
				d.setDate(d.getDate() - 1);
				var date = (d.getDate() >= 10) ? d.getDate() : "0"+d.getDate();
				return "{0}-{1}"._format(d.getFullYear(), this.formatMonth(d));
			},

			getNextMonth: function (date) {
				var d = new Date(date);
				d.setMonth(d.getMonth() + 1);
				return "{0}-{1}"._format(d.getFullYear(), d.getMonth() + 1);
			},

			getBeforeMonth: function (date) {
				var d = new Date(date);
				d.setMonth(d.getMonth() - 1);
				return "{0}-{1}"._format(d.getFullYear(), d.getMonth() + 1);
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

			deviceChartHide: function () {
				$('.wx-deviceChart').removeClass('wx-deviceChart-show');
			},

			imageClick: function (vModel, e) {
				var src = $(e.target).attr('src');
				$('#bg-modal img').attr('src', src);
				$('#bg-modal-btn').trigger('click');
				window.setTimeout(function () {
					$("#bg-modal img").height($("#bg-modal .modal-body").width() * 3 / 4);
				}, 500);
			}
		});

		$.hive.deviceChart = new wx_chart();
		ko.applyBindings($.hive.deviceChart, document.getElementById('wx-deviceChart'));
	});
})(jQuery);