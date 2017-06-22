(function ($) {
	$(window.document).ready(function () {
		function wx_image () {
			this.images = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}
		$.extend(wx_image.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getAllDevicesLatestPicture();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {
				$.hive.topBar.initTopBar("排序:", "设备名称");
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
					}
					_self.sortType[ev.listNum] = !_self.sortType[ev.listNum];
      		clearTimeout($.hive.topBar.timeOut);
					$('.wx-toplist').removeClass('wx-toplist-show');
				};
			},

			getAllDevicesLatestPicture: function () {
				this.dataCenter.getAllDevicesLatestPicture(0, 0, function (res) {
					var result = res.result.data;
					var validation = $.hive.validation;
					if(res.code == 1000) {
						var self = this;
						$.each(result.devices, function (index, item) {
							var image = item.pictures[0];
							var powerWarning = validation.isLowPower(image.power);
							var hasDataWarning = validation.isOutDate(image.updated_at) || image.path == "" || image.path == null;
							
							self.images.push({
								name: item.name,
								gridStyle: (hasDataWarning) ? "background-color:#DB5323;" : "background:url('{0}');background-size: 100% 100%"._format(image.path),
								gridColor: (false) ? "" : "hive-picture-black",
								battery: (powerWarning) ? "fa fa-bolt" : "",
								id: item.id
							});
						});
						$('.wx-image .hive-picture-cell').height($('.wx-image .hive-picture-cell').width()*3/4);
					}
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-image');
		if(obj) {
			ko.applyBindings(new wx_image(), obj);
		}
	});
})(jQuery);