(function ($) {
  var Index = function () {
    return {
      init: function () {
          this.dataCenter = $.hive.getDataCenterIntance();
          //this.initTheme();
          $.hive.deviceSummary.init();
          this.initCalendar();
          this.initChart();
          this.bindEvent();
      },

      initTheme: function () {
        var theme = {
          "default": 0,
          "blue": 1,
          "pink": 2,
          "green": 3,
          "yellow": 4,
          "purple": 5
        };
        this.dataCenter.getSettingsData( {}, function (res) {
          if(res.code == 1000) {
            var themeIndex = theme[res.result.theme];
            if(themeIndex) {
            }
          }
        }, function (err) {
          console.log(err);
        })
      },

      initCalendar: function () {
          if (!jQuery().fullCalendar) {
              return;
          }

          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();

          var h = {};

          if ($('#calendar').width() <= 400) {
              $('#calendar').addClass("mobile");
          } else {
              $('#calendar').removeClass("mobile");
          }

          $('#calendar').fullCalendar('destroy'); // destroy the calendar
          $('#calendar').fullCalendar({ //re-initialize the calendar
              disableDragging : false,
              header: false,
              aspectRatio: 1.0,
              height: 228,
              contentHeight: 228,
              editable: true,
          });
      },

      initChart:function(){
        this.getTempStatistics("hour");
        this.getHumStatistics("hour");
        this.getEnergyStatistics("hour");
        this.getShakeStatistics("hour");
        this.getRayStatistics("hour");
        this.getLocationStatistics("city");
        this.getPictureStatistics();
      },

      _initHourData: function (type) {
        var data = [];
        for(var i = 1; i <= 12; i++) {
          var obj = [];
          if(type) {
            obj.push(null, null);
          }
          else {
            obj.push(null);
          }
          data.push(obj);
        }
        return data;
      },

      _initDayData: function (type) {
        var data = [];
        for(var i = 1; i <= 15; i++) {
          var obj = [];
          if(type) {
            obj.push(null, null);
          }
          else {
            obj.push(null);
          }
          data.push(obj);
        }
        return data;
      },

      getTempStatistics: function (type) {
        var self = this;
        this.dataCenter.getAllDevicesTemperatueStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            if(type == "hour") {
              var _dataRange = self._initHourData(true);
              var _dataPoint = self._initHourData(false);
            }
            else {
              var _dataRange = self._initDayData(true);
              var _dataPoint = self._initDayData(false);
            }
            var time = [];
            var num = [];
            $.each(result, function (index, item) {
              if(item.min != null && item.max != null) {
                _dataRange[index][0] = item.min.toFloat(2);
                _dataRange[index][1] = item.max.toFloat(2);
                _dataPoint[index] = (_dataRange[index][1] + _dataRange[index][0]) / 2;
                _dataPoint[index] = _dataPoint[index].toFloat(2);
                num.push(item.max);
                num.push(item.min);
              }
              time.push(item.time.toString());
            });
            data.ranges = _dataRange;
            data.time = time;
            data.valueSuffix = "°C";
            data.name = "温度变化";
            data.max = num.length ? parseInt(num.max()) + 1 : null;
            data.min = num.length ? parseInt(num.min()) + 1 : null;
            data.minSettings = $.hive.settings.min_temperature;
            data.maxSettings = $.hive.settings.max_temperature;
            data.pointName = "平均温度";
            data.points = _dataPoint;
            $.hive.initHighCharts().render("temperature", data, "allBar");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getHumStatistics: function (type) {
        var self = this;
        this.dataCenter.getAllDevicesHumidtyStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            if(type == "hour") {
              var _dataRange = self._initHourData(true);
              var _dataPoint = self._initHourData(false);
            }
            else {
              var _dataRange = self._initDayData(true);
              var _dataPoint = self._initDayData(false);
            }
            var time = [];
            var num = [];
            $.each(result, function (index, item) {
              if(item.min != null && item.max != null) {
                _dataRange[index][0] = item.min.toFloat(2);
                _dataRange[index][1] = item.max.toFloat(2);
                _dataPoint[index] = (_dataRange[index][1] + _dataRange[index][0]) / 2;
                _dataPoint[index] = _dataPoint[index].toFloat(2);
                num.push(item.max);
                num.push(item.min);
              }
              time.push(item.time.toString());
            });
            data.ranges = _dataRange;
            data.time = time;
            data.valueSuffix = "%";
            data.name = "湿度变化";
            data.pointName = "平均湿度";
            data.points = _dataPoint;
            data.max = num.length ? parseInt(num.max()) + 1 : null;
            data.min = num.length ? parseInt(num.min()) + 1 : null;
            data.minSettings = $.hive.settings.min_humidity;
            data.maxSettings = $.hive.settings.max_humidity;
            $.hive.initHighCharts().render("chart-humiture", data, "allBar");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getEnergyStatistics: function (type) {
        var self = this;
        this.dataCenter.getAllDevicesEnergyStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            if(type == "hour") {
              var _dataRange = self._initHourData(false);
            }
            else {
              var _dataRange = self._initDayData(false);
            }
            var time = [];
            var _data = [];
            $.each(result, function (index, item) {
              if(item.count != null) {
                _data.push(item.count);
              }
              time.push(item.time.toString());
            });
            data.minSettings = $.hive.settings.min_energy;
            data.maxSettings = $.hive.settings.max_energy;
            data.data = _data;
            data.time = time;
            data.name = "能耗";
            $.hive.initHighCharts().render("energy-consumption", data, "allLine");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getShakeStatistics: function (type) {
        var self = this;
        this.dataCenter.getAllDevicesShakeStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            if(type == "hour") {
              var _dataRange = self._initHourData(false);
            }
            else {
              var _dataRange = self._initDayData(false);
            }
            var time = [];
            var _data = [];
            $.each(result, function (index, item) {
              if(item.count != null) {
                _data.push(item.count);
              }
              time.push(item.time.toString());
            });
            data.data = _data;
            data.time = time;
            data.name = "震动";
            data.minSettings = $.hive.settings.min_shake;
            data.maxSettings = $.hive.settings.max_shake;
            $.hive.initHighCharts().render("shaking", data, "allLine");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getLocationStatistics: function (type) {
        this.dataCenter.getAllDevicesLocationStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var sum = 0;
            var data = new Object();
            $.each(result.num, function (index, item) {
              sum += item;
            });
            data.total = sum;
            data.name = "";
            data.data = [];
            $.each(result.name, function (index, item) {
              var arr = [];
              arr.push(item, result.num[index] /  data.total * 100);
              data.data.push(arr);
            });
            $.hive.initHighCharts().render("position-distribution", data, "halfpie");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getRayStatistics: function (type) {
        var self = this;
        this.dataCenter.getAllDevicesRayStatistics(type, function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            if(type == "hour") {
              var _dataRange = self._initHourData(false);
            }
            else {
              var _dataRange = self._initDayData(false);
            }
            var time = [];
            var _data = [];
            $.each(result, function (index, item) {
              if(item.count != null) {
                _data.push(item.count);
              }
              time.push(item.time.toString());
            });
            data.data = _data;
            data.time = time;
            data.name = "人流";
            data.minSettings = $.hive.settings.ray;
            data.maxSettings = null;
            $.hive.initHighCharts().render("chart-ray", data, "allLine");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      getPictureStatistics: function (type) {
        this.dataCenter.getAlldevicesImageStatistics(function (res) {
          if(res.code == 1000) {
            var result = res.result;
            var data = new Object();
            $('.hive-index-imageNum').text("图片累计 : {0}张"._format(result.images_total));
            data.total = result.devices_total;
            data.name = "1";
            var abnormal = result.abnormal_devices_total /  result.devices_total;
            data.data = [
              ["正常设备", (1 - abnormal) * 100],
              ["异常设备", abnormal * 100]
            ];
            if(result.latest.length) {
              $('.hive-index-time').text("最新数据 : "+moment(result.latest).format('YYYY-MM-DD hh:mm:ss'));
            }
            $.hive.initHighCharts().render("index-device-image", data, "pie");
          }
        }, function (err) {
          console.log(err);
        }, this);
      },

      bindEvent: function () {
        var self = this;
        $(".chart-options").find("span").click(function () {
          if($(this).is(".chart-option-actived")) {
            return;
          }

          $(this).parent(".chart-options").find("span").removeClass("chart-option-actived");
          $(this).addClass("chart-option-actived");

          var chartInfo = $(this).attr("data-chartOption");
          var dataType = chartInfo.split('-')[0];
          var statisticType = chartInfo.split('-')[1];

          switch(dataType) {
            case "location":
              self.getLocationStatistics(statisticType);
            break;

            case "temp":
              self.getTempStatistics(statisticType);
            break;

            case "hum":
              self.getHumStatistics(statisticType);
            break;

            case "shake":
              self.getShakeStatistics(statisticType);
            break;

            case "ray":
              self.getRayStatistics(statisticType);
            break;

            case "energy":
              self.getEnergyStatistics(statisticType);
            break;
          };
        });
      }
    };
  }();

  $(document).ready(function () {
    var options = $.hive.getCurrentPageInfo('body-home-index');

    $.hive.init(options, function () {
        Index.init();
    });
  });
})(jQuery);