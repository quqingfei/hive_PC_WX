(function ($) {
	$(window.document).ready(function () {
		function Home() {
			this.allDeviceNum = 0;
			this.onlineDeviceNum = 0;
			this.errorDeviceNum = 0;
			this.humitureAlarm = 0;
			this.shakeAlarm = 0;
			this.energyAlarm = 0;
			this.group = [];
			$.hive.buildObservable(this);
			this.startX = 0;
			this.startY = 0;
			this.init();
		}

		$.extend(Home.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.getDeviceSummary();
				this.getGroups();
				this.getSubDevicesAlarmNum();
				this.getNotificationData();
				this.bindCommonEvent();
			},

			bindCommonEvent: function () {
				$('.wx-black').click(function () {
					$('.wx-leftside').removeClass('wx-leftside-show');
					$('.wx-black').removeClass('wx-black-show');
				});
				$(window.document).on("touchstart", this.detailsMoveStart);
				$(window.document).on("touchend", this.detailsMoveEnd);
			},

			detailsMoveStart: function (e) {
				$('.wx-searchInput').removeClass('wx-searchInput-show').val('');
				this.startX = e.originalEvent.touches[0].pageX;
				this.startY = e.originalEvent.touches[0].pageY;
				return true;
			},

			detailsMoveEnd: function (e) {
				if(e.srcElement.nodeName == "CANVAS") {
					return;
				}
				var endX, endY;
				endX = e.originalEvent.changedTouches[0].pageX;
				endY = e.originalEvent.changedTouches[0].pageY;
				var result = $.hive.returnMoveDireaction(this.startX, this.startY, endX, endY);
				if (result == 4) {
					$('.wx-leftside').removeClass('wx-leftside-show');
					$('.wx-black').removeClass('wx-black-show');
				}
				if (result == 3) {
					if(!$('.wx-leftside-show').length) {
						$('.wx-leftside').addClass('wx-leftside-show');
						$('.wx-black').addClass('wx-black-show');
					}
				}
				return true;
			},

			getDeviceSummary: function () {
				this.dataCenter.getDevicesStatus(function (res) {
					var result = res.result;
					if(res.code == 1000) {
						this.allDeviceNum(result.all_devices);
						this.onlineDeviceNum(result.online_devices);
						this.errorDeviceNum(result.error_devices);
					}

				}, this.errorAjax, this);
			},

			getGroups: function () {
				this.dataCenter.getGroups(function (res) {
					var self = this;
					var result = res.result;
					if(res.code == 1000) {
						$.each(result, function (index, item) {
							item.url = "/weixin/group?id={0}"._format(item.id);
							self.group.push(item);
						});
					}
				}, this.errorAjax, this);
			},

			getSubDevicesAlarmNum: function () {
				this.dataCenter.getSubDevicesAlarmNum(function (res) {
					var result = res.result;
					if(res.code == 1000) {
						this.humitureAlarm(result.humitureAlarm);
						this.shakeAlarm(result.shakeAlarm);
						this.energyAlarm(result.energyAlarm);
					}
				}, this.errorAjax, this);
			},

			getNotificationData: function () {

				this.dataCenter.getNotificationData(function (res) {

					res = res.result.reciever_messages;
					var messageAlarm = false;
					$.each(res, function (index, item) {
						if(item.status == "un_read") {
							messageAlarm = true;
						}
					});
					if(messageAlarm) {
						$('.wx-messageAlarm').show();
					}

				}, this.errorAjax, this);

			},

			errorAjax: function (err) {

				console.log(err);

			}

		});

		ko.applyBindings(new Home(), document.getElementById('wx-leftside'));
	});

})(jQuery);