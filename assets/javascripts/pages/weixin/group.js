(function ($) {
	$(window.document).ready(function () {

		function wx_group () {
			this.groupName = "";
			this.deviceNum = "";
			this.groupManager = "";
			this.groupPhone = "";
			this.groupDescription = "";
			this.devices = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}

		$.extend(wx_group.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.beforeInitGroup();
				this.initData();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},
			
			initTopList: function () {
				$.hive.topBar.initTopBar("排序:", "设备名称", "巡检状态", "设备状态");
				var self = this;
				$.hive.topBar.bindListClick = function (ev, e) {
					var arr = [];
					var _self = self;
					$('.wx-toplist li').removeClass('font-black');
					$('.wx-toplist li').eq(0).addClass('font-black');
					$('.wx-toplist li').eq(ev.listNum - 1).addClass('font-black');
					switch(ev.listNum) {
						case 2:
							$('.wx-group li').each(function (index, item) {
								arr.push($(this).find('p').eq(0));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
              	$('.wx-group ul').prepend(item.parents('li'));
          		});
							break;
						case 3:
							$('.wx-group li').each(function (index, item) {
								arr.push($(this).find('p').eq(3));
							});
							$.each(arr, function (index, item) {
								var str = item.attr('class');
								if(_self.sortType[ev.listNum]) {
									if(str) {
										$('.wx-group ul').prepend(item.parents('li'));
									}
								}
								else {
									if(!str) {
										$('.wx-group ul').prepend(item.parents('li'));
									}
								}
							});
							break;
						case 4:
							$('.wx-group li').each(function (index, item) {
								arr.push($(this).find('p').eq(2));
							});
							$.each(arr, function (index, item) {
								var str = item.attr('class');
								if(_self.sortType[ev.listNum]) {
									if(str) {
										$('.wx-group ul').prepend(item.parents('li'));
									}
								}
								else {
									if(!str) {
										$('.wx-group ul').prepend(item.parents('li'));
									}
								}
							});
							break;
					}
					_self.sortType[ev.listNum] = !_self.sortType[ev.listNum];
					clearTimeout($.hive.topBar.timeOut);
					$('.wx-toplist').removeClass('wx-toplist-show');
				}
			},

			beforeInitGroup: function () {
				this.groupId = parseInt(location.href.split('?id=')[1]);
			},

			initData: function () {
				var request = $.when(this.getGroups(), this.getDevices("all"), this.getDeviceSummary());
				var self = this;
    		request.done(function (data, status, xhr) {
    			self.initGroup();
    			$.each(self.deviceData, function (index, item) {
    				if($.inArray(item.id, self.device_ids) >= 0) {
    					var str = $.hive.checkNormal(item);
    					var location = item.location;
    					var locationNull = !(location.province || location.city || location.street || location.downtown);
    					self.devices.push({
	    					id: item.id,
	    					name: item.name,
	    					address: (location && !locationNull) ? location.province + location.city + location.street + location.downtown : "",
	    					status: str,
	    					isError: (str != "设备运行正常"),
	    					isCheck: false,
	    					checkTime: "",
	    					id: item.id
    					});
    				}
    			});
    		});
    		request.fail (function (xhr, status, err) {
    			console.log(err);
    		});
			},

			initGroup: function () {
				var group = this.group;
				this.groupName(group.name);
				this.device_ids = group.device_ids;
				var length = this.device_ids.length;
				var str = "{0} ({1}%)"._format(length, (length / this.sum * 100).toFixed(2));
				this.deviceNum(str);
				this.groupManager(group.manager.name);
				this.groupPhone(group.manager.phone)
				this.groupDescription(group.description);
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
			},

			getGroups: function () {
				return this.dataCenter.getGroups(function (res) {
					var self = this;
					var result = res.result;
					if(res.code == 1000) {

						$.each(result, function (index, item) {
							if(self.groupId == item.id) {
								self.group = item;
							}
						});
					}
				}, function (err) {
					console.log(err);
				}, this);
			},
			
			getDevices: function (type) {
				this.deviceData = [];
				return this.dataCenter.getAllDevicesLatestData(type, function (res) {
					var result = res.result.data.devices;
					this.deviceData = result;
				}, function (err) {
					console.log(err);
				}, this);
			},

			getDeviceSummary: function () {
				return this.dataCenter.getDevicesStatus(function (res) {
					var result = res.result;
					if(res.code == 1000) {
						this.sum = result.all_devices;
					}

				}, function (err) {
					console.log(err);
				}, this);
			}

		});

		var obj = document.getElementById('wx-group');
		if(obj) {
			ko.applyBindings(new wx_group(), obj);
		}

	});
})(jQuery);