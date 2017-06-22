(function () {
	function _render(data) {
		$("#hive-device-summary-total").find(".number").text(data.all_devices);
		$("#hive-device-summary-online").find(".number").text(data.online_devices);
		$("#hive-device-summary-offline").find(".number").text(data.error_devices);
	}

	function _bindEvents () {
	}

	$.hive = $.extend($.hive, {
		deviceSummary: {
			init: function () {
        this.dataCenter = $.hive.getDataCenterIntance();
				this.getDevicesStatus();
				_bindEvents();
			},

			refresh: function () {
				var self = this;

				this.timer(function () {
					self.getDevicesStatus();
				})
			},

			getDevicesStatus: function () {
				var self = this;
				
	        this.dataCenter.getDevicesStatus(function (res) {
						_render(res.result);
						self.refresh();
	        }, function (err) {
	        	console.log(err);
	        });
			},

			timer: function (cb) {
				window.setTimeout(function () {
					cb();
				}, 5 * 60 * 1000);
			}
		}
	});
})();