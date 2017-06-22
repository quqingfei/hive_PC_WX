(function ($) {
	$(window.document).ready(function () {

		function wx_device_details () {
			this.temp = "-";
			this.hum = "-";
			this.shake = "-";
			this.ray = "-";
			this.energy = "-";
			this.humitureAlarm = false;
			this.shakeAlarm = false;
			this.rayAlarm = false;
			this.energyAlarm = false;
			this.humiturePower = false;
			this.shakePower = false;
			this.rayPower = false;
			this.imageTime = "";
			this.imagePath = "";
			this.location = "";
			this.mainSn = "";
			this.mainName = "";
			this.mainDescription = "";
			this.admin = "";
			this.phone = "";
			this.tempSn = "";
			this.shakeSn = "";
			this.imageSn = "";
			this.raySn = "";
			this.tempDescription ="";
			this.shakeDescription = "";
			this.rayDescription = "";
			this.imageDescription = "";
			this.tempDisabled = false;
			this.shakeDisabled = false;
			this.imageDisabled = false;
			this.rayDisabled = false;
			this.autoQuery = $.getAutoQuery({});
			this.group = [
				{
					groupName: "无分组",
					group_id: 0
				}];
			$.hive.buildObservable(this);
			this.init();
		}

		$.extend(wx_device_details.prototype, {
			init: function () {
				this.bindCommonEvent();
			},

			dataCenter: $.hive.getDataCenterIntance(),

			bindCommonEvent: function () {
				$('.deviceDetails-form-subDevice input[placeholder="序列号"]').live('keyup',this._bindKeyUpEvent);
				$('.wx-deviceDetails .device-delete').live('click', this.deviceDeleteEvent);
				this.cloneObj = $('.deviceDetails-form-subDevice > *').clone();
				$('.wx-deviceDetails-map').on('touchend', this.cancelTouchEndBubble);
			},

			cancelTouchEndBubble: function (e) {
				console.log(e);
      },

			reduce: function () {
				$('.deviceDetails-form-subDevice > *').show();
			},

			showDeviceDetails: function (deviceId) {
				var self = this;
				this.reduce();
				$('.wx-deviceDetails').addClass('wx-deviceDetails-show');
				$('.page-content-wrapper').addClass('page-content-wrapper-hide');
				$('.navbar-mainToggle').removeClass('fa-reorder');
				$('.navbar-mainToggle').addClass('fa-chevron-left');
				$('.hive-weixin-topbar .pull-right').hide();
				this.oldName = $('.navbar-brand').text();
				this.clearForm();
				$.when(this.getCurrentDevice(deviceId), this.getGroups()).done(function (res) {
					var j = 0;
					$('.wx-deviceDetails-form option').get(0).selected = "selected";
					$.each(self.groups, function (index, item) {
						var isThisGroup = $.inArray(self.device.id, item.device_ids) >= 0;
						self.group.push({
							groupName: item.name,
							group_id: item.id
						});
						if(isThisGroup) {
							self.admin(item.manager.full_name);
							self.phone(item.manager.phone);
							j = index;
							self.original_group_id = item.id;
							$('.wx-deviceDetails-form option').get(j+1).selected = "selected";
						}
					});
				});
			},

			chartShow: function (ev, e) {
				var type = $(e.toElement).attr('data-type');
				$.hive.deviceChart.deviceChartShow(type, this.device);
			},

			hideDeviceDetails: function () {
				$('.wx-deviceDetails').removeClass('wx-deviceDetails-show');
				$('.page-content-wrapper').removeClass('page-content-wrapper-hide');
				$('.navbar-mainToggle').removeClass('fa-chevron-left');
				$('.navbar-mainToggle').addClass('fa-reorder');
				$('.navbar-brand').text(this.oldName);
				$('.hive-weixin-topbar .pull-right').show();
			},

			deviceDeleteEvent: function (ev) {
				var parent = $(this).parent('.clearfix');
				$(parent.next().get(0)).hide();
				parent.hide();
			},

			_bindKeyUpEvent: function (e) {
        var $this = $(this);
        if(this.value == "") {
            $(this).parent('div').find('device-right').removeClass('fa-times');
            return;
        }
        $.hive.deviceDetails.autoQuery.query(function () {
          return $.hive.deviceDetails.getValidate($this);
        },$this.get(0));
    	},

			detailsConfirmEvent: function () {
				if($('.deviceDetails-form-subDevice .fa-times').length > 0) {
					return;
				}
				var self = $.hive.deviceDetails;
				var group_id = parseInt($('.deviceDetails-form-mainDevice select').val());

    		var device = {
    			name: $('.deviceDetails-form-mainDevice input').eq(1).val(), 
    			description: $('.deviceDetails-form-mainDevice input').eq(2).val(),
    			original_group_id: (self.original_group_id) ? self.original_group_id : "",
    			group_id: (group_id > 0) ? group_id : null,
    			sub_devices:[]
    		};
    		var $description = $('.wx-deviceDetails-form .deviceDescription')
    		$('.wx-deviceDetails-form .deviceSn').each(function (index, item) {
    			if($(item).val() && $description.get(index).style.display != "none") {
    				device.sub_devices.push({
    					sn: $(item).val(),
    					description: $description.eq(index).val()
    				});
    			}
    		});
    		self.createDevice(device, self.device.id);
			},

			getValidate: function ($obj) {
        return this.dataCenter.getDevicesInfomationBySn($obj.val(), function (res) {
            var $i = $obj.siblings('.device-right');
            if ($obj.val() == "") {
                $i.removeClass('fa-times');
                $i.removeClass('fa-check');
            }
            else if (res.result.data && res.result.data.device_id && res.result.data.device_id > 0) {
                $i.removeClass('fa-check');
                $i.addClass('fa-times');
                $i.attr('data-original-title','设备已存在');
            }
            else if (res.result.data && $obj.attr('data-snType') && $obj.attr('data-snType') != res.result.data.type) {
                $i.removeClass('fa-check');
                $i.addClass('fa-times');
                $i.attr('data-original-title','蜂巢序列号不对应');
            }
            else if (res.result.data && !$obj.attr('data-snType') && res.result.data.type == "插座") {
                $i.removeClass('fa-check');
                $i.addClass('fa-times');
                $i.attr('data-original-title','无法添加插座序列号');
            }
            else if (res.result.data) {
                $i.removeClass('fa-times');
                $i.addClass('fa-check');
                $i.removeAttr('data-original-title');
                $obj.attr('disabled','disabled');
                this.iconChange(res.result.data.type, $i.siblings('.device-left'));
            }
            else {
                $i.removeClass('fa-check');
                $i.addClass('fa-times');
                $i.attr('data-original-title','序列号错误');
            }
            $i.tooltip();
        }, function (err) {
          console.log(err);
        }, this);
      },

      iconChange: function (type, $obj) {
        switch(type) {
            case "温湿度蜂巢":
                $($obj).attr('class', 'icon-icon-04 device-left');
                break;
            case "加速度蜂巢":
                $($obj).attr('class', 'icon-icon-05 device-left');
                break;
            case "摄像头蜂巢":
                $($obj).attr('class', 'icon-icon-06 device-left');
                break;
            case "红外线蜂巢":
                $($obj).attr('class', 'icon-icon-07 device-left');
                break;
        }
      },

			addDevice: function (ev, e) {
				var self = this;
				$('.deviceDetails-form-subDevice .hidden').each(function (index, item) {
					var obj = $(item).clone();
					obj.removeClass('hidden');
					obj.attr('data-modal', 'true');
					if(index == 0) {
						obj.find('input').keyup(self._bindKeyUpEvent);
					}
					$('.deivceDetails-plus').before(obj);
				});
				return false;
			},

			clearForm: function () {
				$('.deviceDetails-form-subDevice *[data-modal]').remove();
				$('.deviceDetails-form-mainDevice option').each(function (index, item) {
					if(index != 0) {
						$(item).remove();
					}	
				});
				this.tempDisabled(false);
				this.tempSn("");
				this.tempDescription("");
				this.shakeDisabled(false);
				this.shakeSn("");
				this.shakeDescription("");
				this.rayDisabled(false);
				this.raySn("");
				this.rayDescription("");
				this.imageDisabled(false);
				this.imageSn("");
				this.imageDescription("");
				this.phone("");
				this.admin("");
			},

			groupsChange: function (ev, e) {
				var index = parseInt($(e.srcElement).val()) - 1;
				this.admin(index >= 0 ? this.groups[index].manager.full_name : "");
				this.phone(index >= 0 ? this.groups[index].manager.phone : "");
			},

			createDevice: function (device, device_id) {
				this.dataCenter.updateSingleDevice({ device: device }, device_id, function (res) {
					if(res.code == 1000) {
						alert("修改成功");
						location.href = location.href;
					}
				}, function (err) {
					console.log(err);
				}, this)
			},

			initRelation: function() {
				var self = this;
				var data = self.device;
				$.each(data.sub_devices,function(index,item) {
					switch(item.type) {
						case "温湿度蜂巢":
							self.tempSn(item.sn);
							self.tempDescription(item.description);
							self.tempDisabled(true);
						break;
						case "加速度蜂巢":
							self.shakeSn(item.sn);
							console.log(item.sn);
							self.shakeDescription(item.description);
							self.shakeDisabled(true);
						break;
						case "摄像头蜂巢":
							self.imageSn(item.sn);
							self.imageDescription(item.description);
							self.imageDisabled(true);
						break;
						case "红外线蜂巢":
							self.raySn(item.sn);
							self.rayDescription(item.description);
							self.rayDisabled(true);
						break;
						case "插座":
							self.mainSn(item.sn);
							self.mainDescription(item.description);
						break;
					};
				});
			},

			getGroups: function () {
				return this.dataCenter.getGroups(function (res) {
					this.groups = res.result;
				}, function (err) {
					console.log(err);
				}, this);
			},

			getCurrentDevice: function (selectedDeviceId) {
				return this.dataCenter.getSingleDevice(selectedDeviceId, function (res) {
					this.device = res.result.data;
					var validation = $.hive.validation;
					$('.navbar-brand').text(this.device.name);
					console.log(this.device);
					var powerWarning = false;
					var humiture = this.device.humitures;
					if(humiture) {
						humiture = humiture[0];
						var isOutDate = validation.isOutDate(humiture.updated_at);
						var humitureWarning = isOutDate || validation.isTemperatureWarning(humiture.temperature) || validation.isHumidityWarning(humiture.humidity);
						var temperature = (isOutDate || humiture.temperature == null) ? "-" : humiture.temperature;
						var humidity = (isOutDate || humiture.humidity == null) ? "-" : humiture.humidity;
						powerWarning = validation.isLowPower(humiture.power);
						this.humitureAlarm(humitureWarning);
						this.temp(temperature);
						this.hum(humidity);
						this.humiturePower(powerWarning);
					}
					var shake = this.device.shakes;
					if(shake) {
						shake = shake[0];
						var isOutDate = validation.isOutDate(shake.updated_at);
						var shakeWarning = isOutDate || validation.isShakeWarning(shake.shake);
						var shakeNum = (isOutDate || shake.shake == null) ? "-" : shake.shake;
						powerWarning = validation.isLowPower(shake.power); 
						this.shakeAlarm(shakeWarning);
						this.shake(shakeNum);
						this.shakePower(powerWarning);
					}
					var ray = this.device.rays;
					if(ray) {
						ray = ray[0];
						var isOutDate = validation.isOutDate(ray.updated_at);
						var rayWarning = isOutDate;
						var count = (isOutDate || ray.count == null) ? "-" : ray.count;
						powerWarning = validation.isLowPower(ray.power); 
						this.rayAlarm(rayWarning);
						this.ray(count);
						this.rayPower(powerWarning);
					}
					var energy = this.device.energy;
					if(energy) {
						var isOutDate = validation.isOutDate(energy.updated_at);
						var energyWarning = isOutDate || validation.isEnergyWarning(energy.energy);
						var count = (isOutDate || energy.energy == null) ? "-" : energy.energy;
						this.energyAlarm(energyWarning);
						this.energy(count);
					}
					var picture = this.device.pictures;
					if(picture.length) {
						picture.sort($.hive.sort.down.update_atStringDown);
						this.imageTime(picture[0].updated_at);
						this.imagePath(picture[0].path);
					}
					var location = this.device.location;
					if(location) {
						if(location.province == location.city) {
							location.city = "";
						}
						var address = (location.province || "") + (location.city || "") + (location.street || "") + (location.downtown || "");
						this.location(address);
						$.hive.initMap({
		          containerId: 'deviceDetails-map',
		          data: {
		          	items: [
									{
										longitude: location.longitude,
										latitude: location.latitude
									}
		          	]
		          },
		          settings: {
	          		center: {longitude: location.longitude, latitude: location.latitude}
	          	}
		        });
					}
					this.mainName(this.device.name);
					this.initRelation();
				}, function(err) {
					console.log(err);
				}, this);
			},

		});

		$.hive.deviceDetails = new wx_device_details();
		ko.applyBindings($.hive.deviceDetails, document.getElementById('wx-deviceDetails'));
	});
})(jQuery);