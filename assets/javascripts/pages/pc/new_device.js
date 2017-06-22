$(document).ready(function () {
  $.hive.init({ pageId: '#body-home-new_device' }, function () {
    function NewDevice() {
        this.autoQuery = $.getAutoQuery({});
    	var self = this;
        this.$addNewDeviceForm = $(".hive-newDevice-formBodyContent");

    	this._bindEvent = function () {
    		$('.hive-newDevice-plus').click(function() {
    			var $modal = $('.hive-newDevice-modal').clone();
    			$modal.removeAttr('class');
                $modal.find("input").each(function (index, item) {
                    $(this).attr("name", "device_sub_deviceInput" + (Math.ceil(Math.random() * 10000)));
                });
    			$modal.find('input').eq(0).keypress(self._bindKeyUpEvent);
    			$modal.find('.fa-minus').click(self._bindMinusClickEvent);
    			$('.hive-newDevice-modal').before($modal);
    			$('.hive-newDevice-lineBox').append($('<div></div>'));
    		});
            
    		$('.hive-newDevice-buttonSave').click(function() {
                if(!$('.newDeviceForm').validate().form()) {
                    return;
                }

                var valid = true;
/*
    			if(self.$addNewDeviceForm.find('.fa-times').length > 0 ||
                   self.$addNewDeviceForm.find('.fa-check').length == 0 ||
                   $('.hive-newDevice-mainSn').val().length == 0) {
                    console.log('failed');
                    return;
                }*/

    			self.sendInsertData();
    		});

    		$('.hive-newDevice-buttonCancel').click(function() {
                //TODO: 
    			window.location.href = window.location.href;
    		});

    		$('.hive-newDevice-form-sn').live('keyup', self._bindKeyUpEvent);
    		self.$addNewDeviceForm.find('.fa-minus').live('click', self._bindMinusClickEvent)
            self.$addNewDeviceForm.find('.fa-minus, .fa-times').tooltip();
            $('.hive-newDevice-devices-table').find('th').click(self._bindThClickEvent);
    	};

    	this._bindMinusClickEvent = function () {
    		$(this).parent('div').remove();
    		$('.hive-newDevice-lineBox').find('div').eq(0).remove();
    	};

        this.reduceDevice = function (deviceId, nowswitch) {
            var $obj = $('tr[data-deviceid={0}] .hive-devices-switch'._format(deviceId));
            if(nowswitch) {
              $obj.text('开');
              $obj.attr('data-switch', 'true');
            }
            else {
              $obj.text('关');
              $obj.attr('data-switch', 'false');
            }
        };

        this.closeDevice = function (deviceId, nowswitch) {
            var self = this;
            var data = new Object();
            data.device_id = deviceId;
            data.off = nowswitch;
            this.dataCenter.postSwitchDevices(data, function (res) {
            if (res.code == 1000) {
                console.log(res);
            }
            else {
                self.reduceDevice(deviceId, nowswitch);
                bootbox.alert("修改失败", function () { 
                });
            }
            }, function (err) {
                self.reduceDevice(deviceId, nowswitch);
                bootbox.alert("修改失败", function () { 
                });
                console.log(err);
            }, this);
        };

    	this._bindKeyUpEvent = function (e) {
            /*if(!((e.keyCode >= 65 && e.keyCode <=90) || (e.keyCode >= 48 && e.keyCode <= 57))) {
                return false;
            }*/
            var $this = $(this);
            if(this.value == "") {
                $(this).parent('div').find('i').removeClass('fa-times');
                return;
            }
            console.log(this.value);
            self.autoQuery.query(function () {
                return self.getValidate($this);
            },$this.get(0));
    	};

    	this._bindCheckDetailsEvent = function () {
    		$.hive.showDeviceDetails($(this).attr('data-deviceId'));
    	};

    	this._bindDeleteEvent = function () {
            var _this = this;
            bootbox.confirm({  
                buttons: {  
                    confirm: {  
                        label: '确定'  
                    },  
                    cancel: {  
                        label: '取消' 
                    }  
                },  
                message: '您确定要删除这个设备？',  
                callback: function (result) {  
                    if(result) {
                      self.deleteDevice($(_this).parents('tr').attr('data-deviceid'), $(_this).parents('tr'));
                    }
                }
            });
            return false;
    	};

        this._bindThClickEvent = function () {
            var $action = $(this);
            if($(this).find('i').length && $(this).find('.hide').length == 2) {
                $(this).find('.fa-angle-up').removeClass('hide');
            }
            $action.find('i').toggleClass('hide');
            var $th = $('.hive-newDevice-devices-table').find('thead').find('th');
            var thIndex;
            $th.each(function (index, item) {
                if(item == $action.get(0)) {
                    thIndex = index;
                }
                else {
                    $(item).find('i').addClass('hide');
                }
            });
            if($(this).find('i').length && $(this).find('.hide').attr('class').indexOf('up') > -1) {
                self._tableSort(thIndex,true);
            }
            else if ($(this).find('i').length){
                self._tableSort(thIndex,false);
            }
            else {
                return;
            }
        };

        this._tableSort = function (thIndex,isDownSort) {
            var $tr = $('.hive-newDevice-devices-table').find('tbody tr');
            var arr = [];
            $tr.each(function (index, item) {
                arr.push($tr.eq(index).find('td').get(thIndex));
            });
            if(isDownSort) {
                arr.sort(this._SortDownRuleFunction);
            }
            else {
                arr.sort(this._SortUpRuleFunction);
            }
            $.each(arr , function (index, item) {
                $('#hive-devices-tbody').prepend($(item).parent('tr'));
            });
        };

        this._SortUpRuleFunction = function (a, b) {
            a = $.trim(a.innerHTML);
            b = $.trim(b.innerHTML)
            if(a.length != b.length) {
                return a.length < b.length ? 1 : -1;
            } 
            else {
                return a < b ? 1 : -1;
            }
        };

        this._SortDownRuleFunction = function (a, b) {
            a = $.trim(a.innerHTML);
            b = $.trim(b.innerHTML)
            if(a.length != b.length) {
                return a.length > b.length ? 1 : -1;
            } 
            else {
                return a > b ? 1 : -1;
            }
        };

        this._bindSwithEvent = function (e) {
          var _self = this;
          var deviceId = $(this).parents("tr").attr("data-deviceId");
          var nowSwith = $(this).attr('data-switch') == "true" ? true : false;

          bootbox.confirm({
            buttons: {  
                confirm: {  
                    label: '确定'  
                },  
                cancel: {  
                    label: '取消' 
                }  
            },  
            message: '您确定要{0}这个设备？'._format(nowSwith ? "关闭" : "开启"),  
            callback: function(result) {
                if(result) {
                  if(nowSwith) {
                    $(_self).text('关');
                    $(_self).attr('data-switch','false');
                  }
                  else {
                    $(_self).text('开');
                    $(_self).attr('data-switch','true');
                  }
                  self.closeDevice(deviceId, nowSwith);
                }
            }
          });
          e.stopPropagation();
        };

    	this._renderTable = function (devices) {
            var $table = $('#hive-devices-tbody');

    		$table.setTemplateElement("hive-newDevices-tmpl");
    	    $table.processTemplate({ items: devices });

    		$table.find("tr").click(this._bindCheckDetailsEvent);
    		$table.find('.hive-newDevice-deleteLink').click(this._bindDeleteEvent);
            $table.find('.hive-devices-switch').click(this._bindSwithEvent);
    	};

    	this._renderGroup = function (data) {
    		$.each(data,function(index,item) {
    			var $newOption = $('<option></option>');
    			$newOption.val(item.id);
    			$newOption.html(item.name);
				$('#hive-newDevice-select').append($newOption);
    		});
    	};
    }

    $.extend(NewDevice.prototype,{
    	init: function() {
    		this.dataCenter = $.hive.getDataCenterIntance();
    		this._bindEvent();
    		this.getData();
            $('.newDeviceForm').validate({
                debug: true,
                rules: {
                    mainSn: {
                        required: true
                    },
                    deviceName: {
                        required: true
                    }
                },
                messages: {
                    mainSn: {
                        required: '必填'
                    },
                    deviceName: {
                        required: '必填'
                    }
                },

                highlight: function (element) {
                    $(element).closest(".input-icon").addClass("has-error");
                },

                success: function(label) {
                   $(label).closest(".input-icon").removeClass("has-error");
                   $(label).closest("i").attr("title", "").removeClass("fa-times");
                   $(label).remove();
                },

                errorPlacement: function(error, element) {
                    error.addClass("hide");
                    error.insertBefore(element);
                    if(error.text() == "") {
                        return;
                    }
                    (function (el) {
                        window.setTimeout(function () {
                            el.closest('.input-icon').find('i').addClass("fa-times").attr("data-original-title", "必填");
                        });
                    })(element);
                }
            });
    	},

    	getData: function () {
    		var self = this;
    		var request = $.when(this.getGroups(), this.getDevices());
    		request.done(function (data, status, xhr) {
    			self._renderGroup(self.groups);
    			$.each(self.devices,function(i, device) {
	  				var deviceSn;
	  				var deviceStr = "";
	  				$.each(device.sub_devices, function(j, sub_device) {
	  					if(sub_device.type == '插座')
	  					{
	  						deviceSn = sub_device.sn;
	  					}
	  					else
	  					{
                            if(deviceStr.indexOf(sub_device.type) == -1) {
                                deviceStr += (sub_device.type + " ");
                            }
	  					}
	  				});
	  				device.sn = deviceSn || '-';
                    device.description = device.description || '-';
                    device.created_at = moment(device.created_at).format('YYYY-MM-DD HH:mm:ss');
	  				device.group = self.searchGroup(device.id) || '-';
	  				device.device = deviceStr || '-';
    			});

    			self._renderTable(self.devices);
    		});
    		request.fail (function (xhr, status, err) {
    			console.log(err);
    		});
    	},

    	getGroups: function () {
    		return this.dataCenter.getGroups (function (res) {
    			this.groups = res.result;
    		}, function (err) {
    			console.log(err);
    		}, this);
    	},

    	getDevices: function() {
    		return this.dataCenter.getAlldevicesInformation (function (res) {
    			this.devices = res.result.data.devices;
    		}, function (err) {
    			console.log(err);
    		}, this);
    	},

        getValidate: function ($obj) {
            return this.dataCenter.getDevicesInfomationBySn($obj.val(), function (res) {
                var $i = $obj.parent('div').find('i');
                if ($obj.val() == "") {
                    $i.removeClass('fa-times');
                    $i.removeClass('fa-check');
                }
                else if (res.result.data && res.result.data.device_id && res.result.data.device_id > 0) {
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
                    this.iconChange(res.result.data.type, $i.parent('div').siblings('.fa-spin'));
                }
                else {
                    $i.removeClass('fa-check');
                    $i.addClass('fa-times');
                    $i.attr('title','序列号错误');
                }
                $i.tooltip();
            }, function (err) {
                console.log(err);
            }, this);
        },

        iconChange: function (type, $obj) {
            console.log(type, $obj);
            switch(type) {
                case "温湿度蜂巢":
                    $($obj).attr('class', 'icon-icon-04');
                    break;
                case "加速度蜂巢":
                    $($obj).attr('class', 'icon-icon-05');
                    break;
                case "摄像头蜂巢":
                    $($obj).attr('class', 'icon-icon-06');
                    break;
                case "红外线蜂巢":
                    $($obj).attr('class', 'icon-icon-07');
                    break;
            }

        },

    	sendInsertData: function() {
            var group_id = $('#hive-newDevice-select').val();
    		var device = {
    			name: $('.hive-newDevice-formBodyContent-formLeft').find('input').eq(1).val(),
    			description: $('.hive-newDevice-formBodyContent-formLeft').find('.hive-newDevice-form-description').val(),
    			group_id: group_id == "null" ? null : group_id,
    			sub_devices:[]
    		};

            var $description_inputs = $('.hive-newDevice-form-description');
    		$('.hive-newDevice-form-sn').each(function(index, item) {
                if(item.value && item.value.length != 0) {
                    device.sub_devices.push({
                        sn: item.value,
                        description: $description_inputs.eq(index).val()
                    });
                } 
  			});

    		this.createDevice(device);
    	},

    	createDevice: function(data) {
    		this.dataCenter.createDevice({ device: data },function(res) {
                if(res.code == 1001) {
                    bootbox.alert("创建失败", function () {
                    });
                }
                else {
                    location.href = location.href;
                }
    		},function(err) {
    			console.log(err);
    		},this);
    	},

    	deleteDevice: function(selectedId, $tr) {
    		this.dataCenter.deleteDevice(selectedId, function (res) {
                if(res.code == 1000) {
                    $tr.fadeOut(100);
                    $tr.remove();
                } else {
                    bootbox.alert("删除失败", function () { });
                }
    		}, function (err) {
    			console.log(err);
    		});
    	},

    	searchGroup: function(deviceId) {
    		var itemName = null;
    		$.each(this.groups, function (index, item) {
    			if(item.device_ids && item.device_ids.indexOf(deviceId) > -1){
    				itemName = item.name;
    			}
    		});
    		return itemName;
    	}
    });

    var newDeviceObj = new NewDevice();
    newDeviceObj.init();
  });
});