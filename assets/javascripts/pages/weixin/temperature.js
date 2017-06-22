(function ($) {
	$(window.document).ready(function () {
		function wx_temperature () {
			this.temperatures = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}
		$.extend(wx_temperature.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getAllDevicesLatestHumiture();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {

				$.hive.topBar.initTopBar("排序:", "设备名称", "温度", "湿度", "运行状态");
				var self = this;
				$.hive.topBar.bindListClick = function (ev, e) {
					var arr = [];
					var _self = self;
					$('.wx-toplist li').removeClass('font-black');
					$('.wx-toplist li').eq(0).addClass('font-black');
					$('.wx-toplist li').eq(ev.listNum - 1).addClass('font-black');
					switch(ev.listNum) {
						case 2:
							$('.cell-name').each(function (index, item) {
								arr.push($(item));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
              	$('.hive-grid-row').prepend(item.parents('.hive-grid-col'));
          		});
							break;
						case 3:
							$('.wx-temperature-temp').each(function (index, item) {
								arr.push($(item));
							});
							if(_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.numStringUp);
							}
							else {
								arr.sort($.hive.sort.down.numStringDown);
							}
							$.each(arr, function (index, item) {
								$('.hive-grid-row').prepend(item.parents('.hive-grid-col'));
							});
							break;
						case 4:
							$('.wx-temperature-hum').each(function (index, item) {
								arr.push($(item));
							});
							if(_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.numStringUp);
							}
							else {
								arr.sort($.hive.sort.down.numStringDown);
							}
							$.each(arr, function (index, item) {
								console.log(item.text());
								$('.hive-grid-row').prepend(item.parents('.hive-grid-col'));
							});
							break; 
						case 5:
							$('.cell-red').each(function (index, item) {
								if(_self.sortType[ev.listNum]) {
									$('.hive-grid-row').prepend($(item).parents('.hive-grid-col'));
								}
								else {
									$('.hive-grid-row').append($(item).parents('.hive-grid-col'));
								}
							});
							break;
					}
					_self.sortType[ev.listNum] = !_self.sortType[ev.listNum];
      		clearTimeout($.hive.topBar.timeOut);
					$('.wx-toplist').removeClass('wx-toplist-show');
				};

			},

			getAllDevicesLatestHumiture: function () {
				this.dataCenter.getAllDevicesLatestHumiture(0, 0, function (res) {
					var result = res.result.data;
					var validation = $.hive.validation;
					if(res.code == 1000) {
						var self = this;
						$.each(result.devices, function (index, item) {
							var humiture = item.humitures[0];
							var powerWarning = validation.isLowPower(humiture.power);
							var hasWarning = validation.isOutDate(humiture.updated_at) || validation.isTemperatureWarning(humiture.temperature) || validation.isHumidityWarning(humiture.humidity);
							var hasDataWarning = validation.isOutDate(humiture.updated_at) || humiture.temperature == null || humiture.humidity == null;
							self.temperatures.push({
								name: item.name,
								temp: (hasDataWarning) ? "-" : humiture.temperature,
								hum: (hasDataWarning) ? "-" : humiture.humidity,
								gridColor: (hasWarning) ? "hive-grid-cell cell-red" : "hive-grid-cell",
								battery: (powerWarning) ? "fa fa-bolt" : "",
								tempSysmbol: (hasDataWarning) ? "" : "℃",
								humSysmbol: (hasDataWarning) ? "" : "%",
								id: item.id
							});
						});
					}
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-temperature');
		if(obj) {
			ko.applyBindings(new wx_temperature(), obj);
		}
	});
})(jQuery);