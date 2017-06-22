$(document).ready(function () {
  var pageType = "";
  var options = $.hive.getCurrentPageInfo('body-home-devices', function () {
  	var href = window.location.href;
  	var questionMarkIndex = href.indexOf('?');

  	if(questionMarkIndex > -1) {
  		var result = '';
  		var urlArray = href.split('?');
  		var paramters = urlArray[1].split('&');

  		for (var i = paramters.length - 1; i >= 0; i--) {
  			if(paramters[i].indexOf('is=') > -1) {
          pageType = paramters[i].split('=')[1]
  				result = 'devices-' + paramters[i].split('=')[1];
  				break;
  			}
  		}

  		return result;
  	} else {
      pageType = "all";
  		return 'devices';
  	}
  });

  $.hive.init(options, function () {
    $.hive.deviceSummary.init();
    
    function DeviceListPage() {
      this.dataCenter = $.hive.getDataCenterIntance();
      this.page = 0;
      this.perPage = 50;
      this.total = 0;
      this.$currentDeletedTr = null;
      this.data = { items: [] };
    }

    $.extend(DeviceListPage.prototype, {
      init: function () {
        this.getAllDevicesLatestData();

        this.bindEvents();
      },

      getAllDevicesLatestData: function () {
        $.hive.startPageLoading();
        var self = this;

        this.dataCenter.getAllDevicesLatestData(pageType, function (res) {
          var result = res.result.data;
          this.page = result.page;
          this.perPage = result.per_page;
          this.total = result.total;
          
          this.processData(result.devices);

          $.hive.stopPageLoading();
        }, function (err) {
          $.hive.logErrorAndHideLoading(err);
        }, this);
      },

      deleteDevice: function (deviceId) {
        this.dataCenter.deleteDevice(deviceId, this.deleteDeviceSucceedCallback, this.errorAjax, this);
      },

      deleteDeviceSucceedCallback: function (res) {
        if (res.code == 1000) {
          this.$currentDeletedTr.remove();
        } else {
           bootbox.alert("删除失败", function () { });
        }
      },

      errorAjax: function (err) {
        console.log(err);
      },

      bindEvents: function () {
        var self = this;

        $("#hive-devices-table").find(".hive-sortable").click(function () {
          var sortType = $(this).attr("data-sortType");
          var direction = "asc";
          var hiddenElem = null;

          if($(this).is(".hive-selected")) {
            hiddenElem = $(this).find(".fa").not(":visible");
            direction = hiddenElem.is(".fa-angle-down") ? "desc" : "asc";
          } else {
            $("#hive-devices-table").find(".hive-selected").removeClass("hive-selected");
            $(this).addClass("hive-selected");
            hiddenElem = $(this).find(".fa-angle-up");
          }

          $("#hive-devices-table").find(".fa").addClass("hide");
          hiddenElem.removeClass("hide");

          self.sort(sortType, direction);
        });
      },

      render: function (data) {
        var $tableBody = $("#hive-devices-tbody");
        $tableBody.empty();
        $tableBody.setTemplateElement("hive-devices-tmpl");
        $tableBody.processTemplate(data);

        var self = this;

        $tableBody.find('tr').click(function () {
          $.hive.showDeviceDetails($(this).attr("data-deviceId"));
        });

        $(".hive-devices-deleteLink").click(function (e) {
          var deviceId = $(this).parents('tr').attr("data-deviceId");
          self.$currentDeletedTr = $(this).parents("tr");

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
            callback: function(result) {  
                if(result) {
                  self.deleteDevice(deviceId);
                }
            }
          });
          e.stopPropagation();
        });

        $('.hive-devices-switch').click(function (e) {
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
        });
      },

      processData: function (devices) {
        $.each(devices, function (index, item) {
          var hasWarning = false;
          var val = $.hive.validation;
          var validation = $.hive.validation;
          //pic
          if(item.pictures.length > 0  && item.pictures[0].path != "" && !val.isOutDate(item.pictures[0].updated_at)) {
            item.pictureStatus = "有";
            item.picWarn = false;
            item.picturePower = validation.isLowPower(item.pictures[0].power);
          } else {
            item.pictureStatus = "-";
            hasWarning = true;
            item.picWarn = true;
          }

          //location
          if(item.location.province == item.location.city) {
            item.location.city = "";
          }
          item.location.address = item.location.province + item.location.city + item.location.downtown + item.location.street;
          if(!item.location.longitude || !item.location.latitude || val.isOutDate(item.location.updated_at) || item.location.address.length == 0) {
            item.location.address = "-";
            item.locationWarn = true;
            hasWarning = true;
          } else {
            item.locationWarn = false;
          }

          //humidity
          if(val.isOutDate(item.humitures[0].updated_at)) {
            hasWarning = true;
            item.humitures[0].humidity = "-";
            item.humidityWarn = true;
          } else {
            item.temperaturePower = validation.isLowPower(item.humitures[0].power);
            if(val.isHumidityWarning(item.humitures[0].humidity)) {
              hasWarning = true;
              item.humidityWarn = true;
            } else {
              item.humidityWarn = false;
            }

            if (!item.humitures[0].humidity) {
              item.humitures[0].humidity = "-";
            }
          }

          //temp
          if(val.isOutDate(item.humitures[0].updated_at)) {
            hasWarning = true;
            item.humitures[0].temperature = "-";
            item.temperatureWarn = true;
          } else {
            item.temperaturePower = validation.isLowPower(item.humitures[0].power);
            if(val.isTemperatureWarning(item.humitures[0].temperature)) {
              hasWarning = true;
              item.temperatureWarn = true;
            } else {
              item.temperatureWarn = false;
            }

            if (!item.humitures[0].temperature) {
              item.humitures[0].temperature = "-";
            }
          }

          //shake
          if(val.isOutDate(item.shakes[0].updated_at)) {
            hasWarning = true;
            item.shakes[0].shake = "-";
            item.shakeWarn = true;
          } else {
            item.shakePower = validation.isLowPower(item.shakes[0].power);
            if(val.isShakeWarning(item.shakes[0].shake)) {
              hasWarning = true;
              item.shakeWarn = true;
            } else {
              item.shakeWarn = false;
            }

            if (item.shakes[0].shake == null) {
              item.shakes[0].shake = "-";
            };
          }

          //energy
          if(val.isOutDate(item.energy.updated_at)) {
            //hasWarning = true;
            item.energy.energy = "-";
            item.energyWarn = true;
          } else {
            if(val.isEnergyWarning(item.energy.energy)) {
              //hasWarning = true;
              item.energyWarn = true;
            } else {
              item.energyWarn = false;
            }
          }
          //TODO: remove this at future
          item.energyWarn = false

          //ray
          if(val.isOutDate(item.rays[0].updated_at)) {
            hasWarning = true;
            item.rays[0].count = "-";
            item.rayWarn = true;
          } else {
            item.rayPower = validation.isLowPower(item.rays[0].power);
            item.rayWarn = false;

            if (item.rays[0].count == null) {
              item.rays[0].count = "-"
            }
          }

          item.hasWarning = hasWarning;
          item.networkStatus = (val.isOutDate(item.location.updated_at) 
                                &&
                                val.isOutDate(item.humitures[0].updated_at)
                                &&
                                val.isOutDate(item.shakes[0].updated_at)
                                &&
                                val.isOutDate(item.rays[0].updated_at)) ? '无连接' : '网络正常';
          item.switch = true;
          if(item.networkStatus == "无连接") {
            item.netWorkWarn = true;
          } else {
            item.netWorkWarn = false;
          }
        });
        
        if(this.data.items.length == 0) {
          this.data.items = devices;
        } else {
          this.data.items = this.data.items.concat(devices);
        }

        this.sort("name", "asc");
      },

      sort: function (type, direction) {
        this.data.items.sort(this.getSorter(type, direction));
        this.render(this.data);
      },

      closeDevice: function (deviceId, nowswitch) {
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
          console.log(err);
          self.reduceDevice(deviceId, nowswitch);
          bootbox.alert("修改失败", function () { 
          });
        }, this);
      },

      reduceDevice: function (deviceId, nowswitch) {
        var $obj = $('tr[data-deviceid={0}] .hive-devices-switch'._format(deviceId));
        if(nowswitch) {
          $obj.text('开');
          $obj.attr('data-switch', 'true');
        }
        else {
          $obj.text('关');
          $obj.attr('data-switch', 'false');
        }
      },

      getSorter: function (type, direction) {
        var sorter = {
          name: {
            desc: function (left, right) {
              left = $.trim(left.name);
              right = $.trim(right.name);
              if(left.length != right.length) {
                return left.length < right.length ? 1 : -1;
              } 
              else {
                 return left < right ? 1 : -1;
              }
            },
            asc: function (left, right) {
              left = $.trim(left.name);
              right = $.trim(right.name);
              if(left.length != right.length) {
                return left.length > right.length ? 1 : -1;
              } 
              else {
                 return left > right ? 1 : -1;
              }
            }
          },

          temp: {
            desc: function (left, right) {
              return left.humitures[0].temperature < right.humitures[0].temperature ? 1 : -1;
            },
            asc: function (left, right) {
              return left.humitures[0].temperature > right.humitures[0].temperature ? 1 : -1;
            }
          },

          hum: {
            desc: function (left, right) {
              return left.humitures[0].humidity < right.humitures[0].humidity ? 1 : -1;
            },
            asc: function (left, right) {
              return left.humitures[0].humidity > right.humitures[0].humidity ? 1 : -1;
            }
          },

          shake: {
            desc: function (left, right) {
              return left.shakes[0].shake < right.shakes[0].shake ? 1 : -1;
            },
            asc: function (left, right) {
              return left.shakes[0].shake > right.shakes[0].shake ? 1 : -1;
            }
          },

          ray: {
            desc: function (left, right) {
              return left.rays[0].count < right.rays[0].count ? 1 : -1;
            },
            asc: function (left, right) {
              return left.rays[0].count > right.rays[0].count ? 1 : -1;
            }
          },

          energy: {
            desc: function (left, right) {
              return left.energy.energy < right.energy.energy ? 1 : -1;
            },
            asc: function (left, right) {
              return left.energy.energy > right.energy.energy ? 1 : -1;
            }
          },  

          location: {
            desc: function (left, right) {
              return left.location.address < right.location.address ? 1 : -1;
            },
            asc: function (left, right) {
              return left.location.address > right.location.address ? 1 : -1;
            }
          }                                    
        };

        return sorter[type][direction];
      }
    });

  var currentPageObj = new DeviceListPage();
  currentPageObj.init();
  
  });
});