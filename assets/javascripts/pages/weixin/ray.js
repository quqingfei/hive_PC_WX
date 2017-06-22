(function ($) {
	$(window.document).ready(function () {
		function wx_ray () {
			this.rays = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}
		$.extend(wx_ray.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getAllDevicesLatestRay();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {

				$.hive.topBar.initTopBar("排序:", "设备名称", "人流感应", "运行状态");
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
							$('.cell-labelText').each(function (index, item) {
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

			getAllDevicesLatestRay: function () {
				this.dataCenter.getAllDevicesLatestRay(0, 0, function (res) {
					var result = res.result.data;
					var validation = $.hive.validation;
					if(res.code == 1000) {
						var self = this;
						$.each(result.devices, function (index, item) {
							var ray = item.rays[0];
							var powerWarning = validation.isLowPower(ray.power);
							var hasWarning = validation.isOutDate(ray.updated_at);
							var hasDataWarning = validation.isOutDate(ray.updated_at) || ray.count == null;
							self.rays.push({
								name: item.name,
								ray: (hasDataWarning) ? "-" : ray.count,
								gridColor: (hasWarning) ? "hive-grid-cell cell-red" : "hive-grid-cell",
								battery: (powerWarning) ? "fa fa-bolt" : "",
								raySysmbol: (hasDataWarning) ? "" : "人",
								id: item.id
							});
						});
					}
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-ray');
		if(obj) {
			ko.applyBindings(new wx_ray(), obj);
		}
	});
})(jQuery);