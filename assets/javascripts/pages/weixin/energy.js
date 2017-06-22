(function ($) {
	$(window.document).ready(function () {
		function wx_energy () {
			this.energys = [];
			this.sortType = [];
			this.id = "";
			$.hive.buildObservable(this);
			this.init();
		}
		$.extend(wx_energy.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getAllDevicesLatestEnergy();
				this.initTopList();
			},

			gridClick: function (ev, e) {
				$.hive.deviceDetails.showDeviceDetails(ev.id);
				return true;
			},

			initTopList: function () {

				$.hive.topBar.initTopBar("排序:", "设备名称", "能耗", "运行状态");
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

			getAllDevicesLatestEnergy: function () {
				this.dataCenter.getAllDevicesLatestEnergy(0, 0, function (res) {
					var result = res.result.data;
					var validation = $.hive.validation;
					if(res.code == 1000) {
						var self = this;
						$.each(result.devices, function (index, item) {
							var energy = item.energy;
							var hasWarning = validation.isOutDate(energy.updated_at) || validation.isEnergyWarning(energy.energy);
							var hasDataWarning = validation.isOutDate(energy.updated_at) || energy.energy == null;
							self.energys.push({
								name: item.name,
								energy: (hasDataWarning) ? "-" : energy.energy,
								gridColor: (hasWarning) ? "hive-grid-cell cell-red" : "hive-grid-cell",
								energySysmbol: (hasDataWarning) ? "" : "kw/h",
								id: item.id
							});
						});
					}
				}, function (err) {
					console.log(err);
				}, this);
			}

		});
		var obj = document.getElementById('wx-energy');
		if(obj) {
			ko.applyBindings(new wx_energy(), obj);
		}
	});
})(jQuery);