(function ($) {
	$(document).ready(function() {
		if($(".page-quick-sidebar").length > 0) {
			var autoQuery = $.getAutoQuery({});

		  function getValidate ($obj) {
				return $.hive.deviceDetailsPage.dataCenter.getDevicesInfomationBySn($obj.val(), function (res) {
              var $i = $obj.parent('div').find('i.tooltips');
              if ($obj.val() == "") {
                    $i.removeClass('fa-times');
                    $i.removeClass('fa-check');
              }
              else if(res.result.data && res.result.data.device_id && res.result.data.device_id > 0) {
                  $i.removeClass('fa-check');
                  $i.addClass('fa-times');
                  $i.attr('title','设备已存在');
              }
              else if (res.result.data && $obj.attr('data-snType') && $obj.attr('data-snType') != res.result.data.type) {
                  $i.removeClass('fa-check');
                  $i.addClass('fa-times');
                  $i.attr('title','蜂巢序列号不对应');
              }
              else if (res.result.data && !$obj.attr('data-snType') && res.result.data.type == "插座") {
                  $i.removeClass('fa-check');
                  $i.addClass('fa-times');
                  $i.attr('title','无法添加插座序列号');
              }
              else if (res.result.data) {
                  $i.removeClass('fa-times');
                  $i.addClass('fa-check');
                  $i.removeAttr('title');
                  $i.parent('div').find('input').attr('disabled','disabled');
                  iconChange(res.result.data.type, $i.parents('.form-input-modal').find('.fa-spinner'));
              }
              else {
                  $i.removeClass('fa-check');
                  $i.addClass('fa-times');
                  $i.attr('title','序列号错误');
              }
              $i.tooltip();
          }, function (err) {
              console.log(err);
          }, this
          );
			}

			function iconChange (type, $obj) {
        switch(type) {
            case "温湿度蜂巢":
                $($obj).attr('class', 'icon-icon-04 hive-quick-first-icon');
                break;
            case "加速度蜂巢":
                $($obj).attr('class', 'icon-icon-05 hive-quick-first-icon');
                break;
            case "摄像头蜂巢":
                $($obj).attr('class', 'icon-icon-06 hive-quick-first-icon');
                break;
            case "红外线蜂巢":
                $($obj).attr('class', 'icon-icon-07 hive-quick-first-icon');
                break;
        }
      }

			function _bindKeyUpEvent (e) {
				var $this = $(this);
        if(this.value == "") {
            $(this).parent('div').find('i').removeClass('fa-times');
            return;
        }
        autoQuery.query(function () {
            return getValidate($this);
        },$this.get(0));
			}

			function _isNullObject (obj) {
				for(var key in obj){
					return false;
				}
				return true;
			}

			$.hive.deviceDetailsPage = {
				initialized: false,
				selectedDeviceId: null,
				dataCenter: $.hive.getDataCenterIntance(),
				cloneObj: null,
				cloneInputObj: null,
				
				init: function () {
					$('.hive-quick-form').find('.hive-quick-sn').live("keyup", _bindKeyUpEvent);
				},
			
				show: function (selectedDeviceId) {
					if (selectedDeviceId == this.selectedDeviceId) {
						this.triggerToggler();
						return;
					};
					this._getdata(selectedDeviceId);
				},

				triggerToggler: function () {
					$('.trapezoid-toggler').trigger("click");
				},

				initDeviceInfo: function(data) {
					$('.hive-quick-deviceName').text(data.name);

					var validation = $.hive.validation;
					var humiture = data.humitures[0];
					if(!data.humitures.length
						||	validation.isOutDate(humiture.updated_at)
						||	humiture.humidity == null
						||	humiture.temperature == null ) {
						$('.temperature-stat').addClass('cell-red');
						$('.hive-quick-temperature').find('.hive-quick-number').text("-");
						$('.hive-quick-humiture').find('.hive-quick-number').text("-");
						$('.temperature-stat > i').hide();
					} 
					else {
						if(validation.isTemperatureWarning(humiture.temperature)
							||
							validation.isHumidityWarning(humiture.humidity)) {
							$('.temperature-stat').addClass('cell-red');
						} else {
							$('.temperature-stat').removeClass('cell-red');
						}
						$('.hive-quick-temperature').find('.hive-quick-number').text(humiture.temperature);
						$('.hive-quick-humiture').find('.hive-quick-number').text(humiture.humidity);
						if(validation.isLowPower(humiture.power)) {
							$('.temperature-stat > i').show();
						}
						else {
							$('.temperature-stat > i').hide();
						}
					}
					var shake = data.shakes[0];
					if(!data.shakes.length || validation.isOutDate(shake.updated_at) || shake.shake == null) {
						$('.shaking-stat').addClass('cell-red');
						$('.shaking-stat').find('.hive-quick-number').text("-");
					} 
					else {
						if(validation.isShakeWarning(shake.shake)) {
							$('.shaking-stat').addClass('cell-red');
						} else {
							$('.shaking-stat').removeClass('cell-red');
						}
						$('.shaking-stat').find('.hive-quick-number').text(shake.shake);
						if(validation.isLowPower(shake.power)) {
							$('.shaking-stat > i').show();
						}
						else {
							$('.shaking-stat > i').hide();
						}
					}
					if(_isNullObject(data.energy) || validation.isEnergyWarning(data.energy.energy) || data.energy.energy == null) {
						$('.energry-consumption-stat').addClass('cell-red');
						$('.energry-consumption-stat').find('.hive-quick-number').text("-");
					} 
					else {
						$('.energry-consumption-stat').removeClass('cell-red');
						$('.energry-consumption-stat').find('.hive-quick-number').text(data.energy.energy);
					}
					var ray = data.rays[0];
					if(!data.rays.length || validation.isOutDate(ray.updated_at) || ray.count == null) {
						$('.ray-stat').addClass("cell-red");
						$('.ray-stat').find('.hive-quick-number').text("-");
					} 
					else {
						$('.ray-stat').removeClass("cell-red");
						$('.ray-stat').find('.hive-quick-number').text(ray.count);
						if(validation.isLowPower(ray.power)) {
							$('.ray-stat > i').show();
						}
						else {
							$('.ray-stat > i').hide();
						}
					}
				},

				initMap: function(data) {
					$(".location-stat .hive-date-right").text((data.location.longitude && data.location.latitude) ? ( "实时时间：" + moment(data.location.updated_at).format("YYYY-MM-DD HH:mm:ss")): "");
					var _data = {
						items: [
						{
							longitude: data.location.longitude,
							latitude: data.location.latitude
						}
					]};

	        this.map = $.hive.initMap({
	          containerId: 'stat-mapContainer',
	          data: _data,
	          settings: {
	          	center: {longitude: data.location.longitude, latitude: data.location.latitude}
	          }
	        });
				},

				bindEvent: function() {
					var self = this;

					$('.hive-quick-confirm-cancel').click(function() {
						self.triggerToggler();
					});
					$('.page-quick-sidebar').find(".temperature-stat, .shaking-stat, .ray-stat, .energry-consumption-stat, .image-stat, .location-stat").click(function () {
						$.hive.showBgBarDetails(self.selectedDeviceId,self.device,$(this).attr('data-target'));
					});

					var showGroupManager = function (name, phone) {
						$('#groupManager').val(name);
						$('#groupPhone').val(phone);
					};

					$('#quick-device-groups').live('change', function() {
						var value = $('#quick-device-groups').val();
						if(!value) {
							showGroupManager("", "");
							return;
						}

						$.each(self.groups, function (index, item) {
							if(value == item.id) {
								showGroupManager(item.manager.full_name, item.manager.phone);
							}
						});

					});

					$('.hive-quick-confirm-save').click(function () {
						if($('.hive-quick-form .fa-times').length > 0) {
							return;
						}
						var group_id = $('#quick-device-groups').val();

		    		var device = {
		    			name: $('#slug-name').val(), 
		    			description: $('#slug-description').val(),
		    			original_group_id: self.original_group_id,
		    			group_id: group_id ? group_id : null,
		    			sub_devices:[]
		    		};
		        var $description_inputs = $('.hive-quick-description');
		    		$('.hive-quick-sn').each(function(index, item) {
              if(item.value && item.value.length != 0) {
                  device.sub_devices.push({
                    sn: item.value,
                    description: $description_inputs.eq(index).val()
                  });
              } 
		  			});
		    		self.createDevice(device, self.selectedDeviceId);
					});
				},

				createDevice: function (device, device_id) {
					this.dataCenter.updateSingleDevice({ device: device }, device_id, function (res) {
						if(res.code == 1000) {
							bootbox.alert("修改成功", function () {
								location.href = location.href;
              });
						}
					}, function (err) {
						console.log(err);
					}, this)
				},

				initImage: function(data) {
					$(".stat-chart").find('.device-image').attr('alt', '暂无图片');
					$(".image-stat").find(".hive-date-right").text("");
					$(".stat-chart").find('.device-image').attr('style', '');
					$.each(data.pictures, function (index, item) {
						if(!_isNullObject(item) && item.path && item.id) {
							hasData = true;
							$(".stat-chart").find('.device-image').attr('style', 'background-image:url({0});'._format(item.path));
							$(".stat-chart").find('.device-image').attr('alt', '');
							$(".image-stat").find(".hive-date-right").text("实时时间：" + item.updated_at);
						}
					});
				},

				initRelation: function(data) {
					var self = this;
					$.each(data.sub_devices,function(index,item) {
						switch(item.type) {
							case "温湿度蜂巢":
								self.relationDataInsert('temp',item);
							break;
							case "加速度蜂巢":
								self.relationDataInsert('speed',item);
							break;
							case "摄像头蜂巢":
								self.relationDataInsert('image',item);
							break;
							case "红外线蜂巢":
								self.relationDataInsert('ray',item);
							break;
							case "插座":
								self.relationDataInsert('slug',item);
								$('#slug-name').val(data.name);
							break;
						};
					});
				},

				relationDataInsert: function(type,item) {
					var IconType = {
						"temp": "icon-icon-041",
						"speed": "icon-icon-05",
						"image": "icon-icon-06",
						"ray": "icon-icon-07",
						"slug": "icon-icon-10"
					};
					var $sn = $('#'+type+'-sn');
					var $description = $('#'+type+'-description') ;
					if($sn.val().length == 0) {
						$sn.val(item.sn);
						$sn.attr('disabled','disabled');
						$description.val(item.description);
					}
					else {
						$('.quick-icon-add').trigger('click');
						var $inputModal = $('.form-input-modal');
						$inputModal.removeClass('form-input-modal');
						$inputModal.find('input').eq(0).val(item.sn);
						$inputModal.find('input').eq(0).attr('disabled','disabled');
						$inputModal.find('input').eq(1).val(item.description);
						if(IconType[type]) {
							$inputModal.find('i').eq(0).attr('class',IconType[type] + ' hive-quick-first-icon');
						}
					}
				},

				_getdata: function(selectedDeviceId) {
					$.hive.startPageLoading();
					var self = this;
					this.device = null;

					$.when(this.getCurrentDevice(selectedDeviceId), this.getGroups()).done(function (res) {
						if(!self.initialized)
						{
							self.clone();
							self.bindEvent();
							self.initialized = true;
						}
						self.reduce();
						self.selectedDeviceId = selectedDeviceId;
						var data = self.device;
						self.renderGroup();
						self.initDeviceInfo(data);
						self.initImage(data);
						self.initMap(data);
						self.initRelation(data);
						self.triggerToggler();
						$.hive.stopPageLoading();
					});
				},

				getCurrentDevice: function (selectedDeviceId) {
					return this.dataCenter.getSingleDevice(selectedDeviceId, function (res) {
						this.device = res.result.data;
					}, function(err) {
						console.log(err);
					}, this);
				},

				getGroups: function () {
					this.groups = null;
					return this.dataCenter.getGroups(function (res) {
						this.groups = res.result;
					}, function (err) {
						console.log(err);
					}, this);
				},

				renderGroup: function () {
					var self = this;
					this.original_group_id = "";
					$.each(this.groups, function(index, item) {
						if(item.device_ids && item.device_ids.indexOf(self.device.id) > -1) {
							$('#groupManager').val(item.manager.full_name);
							$('#groupPhone').val(item.manager.phone);
							self.original_group_id = item.id;
							$(('<option value="{0}" selected="selected">{1}</option>'._format(item.id, item.name))).appendTo($('#quick-device-groups'));
						}
						else {
							$('<option value="{0}">{1}</option>'._format(item.id, item.name)).appendTo($('#quick-device-groups'));
						}
											
					});
				},

				reduce: function() {
					var clone = this.cloneObj.clone();
					clone.replaceAll($('.hive-quick-form'));
					this.handleQuickSidebarAddInfo();
				},

				clone: function() {
					this.cloneObj = $('.hive-quick-form').clone();
				},

	    	handleQuickSidebarAddInfo: function() {
	    		var self = this;
		        $('.quick-icon-add').click(function() {
		            var $modal = $('.quick-modal-hide').clone();
		            $modal.removeClass('quick-modal-hide');
		            $modal.addClass('form-input-modal');
		            $modal.find('.fa-minus').click(self._bindMinusClickEvent);
		            $modal.find('input').eq(0).addClass('hive-quick-sn');
		            $modal.find('input').eq(1).addClass('hive-quick-description');
		            $('.quick-modal-hide').before($modal);
		            $("<div></div>").appendTo($('.hive-quick-form-line'));
		        });
		        $('.hive-quick-form-right').find('.fa-minus').click(self._bindMinusClickEvent);
	    	},

	    	_bindMinusClickEvent: function () {
	    		$(this).parent('div').parent('div').remove();
		      $('.hive-quick-form-line').find('div').eq(0).remove();
	    	}
			};
		}
		$.hive.deviceDetailsPage.init();
	});
})(jQuery);