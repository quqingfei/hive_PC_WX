(function ($) {
	$(window.document).ready(function () {
		function wx_inspection () {
			this.inspections = [];
			this.sortType = [];
			this.arr = [];
			this.init();
			$.hive.buildObservable(this);
		}

		$.extend(wx_inspection.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			wxHandler: $.hive.weixinHandler,

			inspectClick: function () {
				var self = this;
				this.changeBar();
				this.wxHandler.scan(function (res) {
					var thisSn = res.resultStr;
					var latitude, longitude;
					self.wxHandler.getLocation(function (res) {
						latitude = res.latitude;
						longitude = res.longitude;
						try{
							$.hive.geocoder(thisSn, longitude, latitude);
						}catch(e){alert(e)}
						
					}, function (err) {
						alert(err);
					});
					
				}, function (err) {
					alert(err);
				});
			},

			changeBar: function () {
				$('#hive-wx-routineBtn').hide();
				$('#hive-wx-routineBtns').show();
			},

			sendDevicesInspection: function (data) {
				this.dataCenter.postDevicesInspection(data, function (res) {
					if(res.code == 1000) {
						alert("巡检成功");
						this.arr.push(res.result);
						this.renderDevice(this.arr());
					}
					else {
						alert("巡检失败");
					}
				}, function (err) {
					console.log(err);
					alert("巡检失败");
				}, this);

			},

			getDevice: function () {
				this.dataCenter.getAllDevicesLatestData("all", function (res) {
					var result = res.result.data.devices;
					this.renderDevice(result);
				}, function (err) {
					console.log(err);
				}, this);
			},

			renderDevice: function (data) {
				var self = this;
				while(self.inspections.pop()) {
				};
				$.each(data, function (index, item) {
						if(item.device) {
							item = item.device;
						}
						var location = item.location;
						location.city = (location.city == location.province) ? "" : location.city;
						location = (location.province || "") + (location.city || "") + (location.downtown || "") + (location.street || "");
	  				if(item.routine_checking) {
	  					var time = self.calculateDates(item.routine_checking.created_at);
	  					time = (time > 0) ? time + "天前" : "已巡检";
	  				}
	  				self.inspections.push({
	  					name: item.name,
	  					address: location,
	  					inspectTime: (time) ? time : "未巡检",
	  					inspectName: (item.routine_checking && item.routine_checking.user) ? item.routine_checking.user.name : "",
	  					isError: ($.hive.checkNormal(item) != "设备运行正常")
		  			});
				});
			},

			calculateDates: function (date) {

				var thisDate = new Date($.hive.current_date);
				var date = new Date(date);
				return parseInt((thisDate.getTime() - date.getTime())/3600000/24);

			},

			initTopList: function () {
				$.hive.topBar.initTopBar("排序:", "设备名称", "巡检状态", "巡检时间");
				var self = this;
				$.hive.topBar.bindListClick = function (ev, e) {
					var _self = self;
					var arr = [];
					$('.wx-toplist li').removeClass('font-black');
					$('.wx-toplist li').eq(0).addClass('font-black');
					$('.wx-toplist li').eq(ev.listNum - 1).addClass('font-black');
					switch(ev.listNum) {
						case 2:
							$('.wx-inspection li').each(function (index, item) {
								arr.push($(this).find('p').eq(0));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
	            	$('.wx-inspection ul').prepend(item.parents('li'));
	        		});
							break;
						case 3:
							$('.wx-inspection li').each(function (index, item) {
								arr.push($(this).find('p').eq(3));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
	            	$('.wx-inspection ul').prepend(item.parents('li'));
	        		});
							break;
						case 4:
							$('.wx-inspection li').each(function (index, item) {
								arr.push($(this).find('p').eq(2));
							});
							if(!_self.sortType[ev.listNum]) {
								arr.sort($.hive.sort.up.nameStringUp);
							}
							else {
								arr.sort($.hive.sort.down.nameStringDown);
							}
							$.each(arr , function (index, item) {
	            	$('.wx-inspection ul').prepend(item.parents('li'));
	        		});
							break;
					}
					_self.sortType[ev.listNum] = !_self.sortType[ev.listNum];
					clearTimeout($.hive.topBar.timeOut);
					$('.wx-toplist').removeClass('wx-toplist-show');
				}
			},

			init: function () {
				this.initTopList();
				this.getDevice();
				var self = this;
				$("#hive-wx-routineBtn, #hive-wx-reRoutineBtn, .wx-nav-QRcode").click(function () {
					try{
						self.inspectClick();
					}
					catch(e) {
						alert(e);
					}
				});
				$("#hive-wx-finishRoutineBtn").click(function () {
					location.href = "/weixin/inspection";
				});
				$('#hive-wx-routineBtn').show();
			}

		});

		var obj = document.getElementById('wx-inspection');
		if(obj) {
			$.hive.inspection = new wx_inspection();
			ko.applyBindings($.hive.inspection, obj);
		}
		
	});
})(jQuery);