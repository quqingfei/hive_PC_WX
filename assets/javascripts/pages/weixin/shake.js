(function ($) {
	$(window.document).ready(function () {
		function wx_shake () {
			this.shakes = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}
		$.extend(wx_shake.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getAllDeviceLatestShake();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {

				$.hive.topBar.initTopBar("排序:", "设备名称", "震动", "运行状态");
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

			getAllDeviceLatestShake: function () {
				this.dataCenter.getAllDeviceLatestShake(0, 0, function (res) {
					var result = res.result.data;
					var validation = $.hive.validation;
					if(res.code == 1000) {
						var self = this;
						$.each(result.devices, function (index, item) {
							var shake = item.shakes[0];
							var powerWarning = validation.isLowPower(shake.power);
							var hasWarning = validation.isOutDate(shake.updated_at) || validation.isShakeWarning(shake.shake);
							var hasDataWarning = validation.isOutDate(shake.updated_at) || shake.shake == null;
							self.shakes.push({
								name: item.name,
								shake: (hasDataWarning) ? "-" : shake.shake,
								gridColor: (hasWarning) ? "hive-grid-cell cell-red" : "hive-grid-cell",
								battery: (powerWarning) ? "fa fa-bolt" : "",
								shakeSysmbol: (hasDataWarning) ? "" : "次",
								id: item.id
							});
						});
					}
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-shake');
		if(obj) {
			ko.applyBindings(new wx_shake(), obj);
		}
	});
})(jQuery);