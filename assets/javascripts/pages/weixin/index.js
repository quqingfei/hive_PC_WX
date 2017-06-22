(function ($) {
	$(window.document).ready(function () {
		function wx_index () {

			this.devices = [];
			this.sortType = [];
			$.hive.buildObservable(this);
			this.init();
		}

		$.extend(wx_index.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				var type = location.href.split('?type=')[1] || "all";
				this.getDevices(type);
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {
				$.hive.topBar.initTopBar("排序:", "设备名称", "设备状态");
				var self = this;
				$.hive.topBar.bindListClick = function (ev, e) {
					var arr = [];
					var _self = self;
					$('.wx-toplist li').removeClass('font-black');
					$('.wx-toplist li').eq(0).addClass('font-black');
					$('.wx-toplist li').eq(ev.listNum - 1).addClass('font-black');
					switch(ev.listNum) {
						case 2:
							$('.wx-index li').each(function (index, item) {
								arr.push($(this).find('p').eq(0));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
              	$('.wx-index ul').prepend(item.parents('li'));
          		});
							break;
						case 3:
							$('.wx-index li').each(function (index, item) {
								arr.push($(this).find('p').eq(3));
							});
							$.each(arr, function (index, item) {
								var str = item.attr('class');
								if(_self.sortType[ev.listNum]) {
									if(str) {
										$('.wx-index ul').prepend(item.parents('li'));
									}
								}
								else {
									if(!str) {
										$('.wx-index ul').prepend(item.parents('li'));
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

			getDevices: function (type) {
				this.dataCenter.getAllDevicesLatestData(type, function (res) {
					var result = res.result.data.devices;
					var self = this;
					$.each(result, function (index, item) {
    				var str = $.hive.checkNormal(item);
    				var location = item.location;
    				var locationNull = !(location.province || location.city || location.street || location.downtown);
    				self.devices.push({
    					id: item.id,
    					name: item.name,
    					address: (location && !locationNull) ? location.province + location.city + location.street + location.downtown : "",
    					status: str,
    					isError: (str != "设备运行正常")
    				});
    			});
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-index');
		if(obj) {
			ko.applyBindings(new wx_index(), obj);
		}
	});
})(jQuery);