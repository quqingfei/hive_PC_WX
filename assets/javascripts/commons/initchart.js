(function ($) {
	$(window.document).ready(function () {
		function initChart() {
			this.dataCenter = $.hive.getDataCenterIntance();
		}

		$.extend(initChart.prototype, {

			_initMonthData: function (type) {
				var data = [];
				for(var i = 1; i <= this.monthDay; i++) {
					var obj = [];
					if(type) {
						obj.push(Date.UTC(this.year, this.month-1, i), null, null);
					}
					else {
						obj.push(Date.UTC(this.year, this.month-1, i), null);
					}
					data.push(obj);
				}
				return data;
			},

			_initDayData: function () {
				var data = [];
				for(var i = 0 ; i <= 23 ; i++) {
					var obj = [];
					obj.push(Date.UTC(this.year, this.month-1, this.day, i, 0, 0), null);
					data.push(obj);
				}
				return data;
			},

			initDay: function (data) {
  			var date = new Date(data.time);
				this.year = date.getFullYear();
				this.month = date.getMonth() + 1;
				this.day = date.getDate();
				date.setMonth(date.getMonth() + 1);
				date.setDate(0);
				this.monthDay = date.getDate();
  		},

			timeStringSort: function (a, b) {
  			return parseInt(a.time) > parseInt(b.time) ? 1 : -1;
  		},

  		getUTC: function (date) {
  			date = new Date(date);
  			return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
  		},

			initTemp: function (id, data, res) {
				if(res.code == 1000) {
						var self = this;
						var result = res.result;
						var _temp = [];
						this.initDay(data);
						var _type = data.type;
						var data = {};
					 	if(_type == "DAY") {
					 		var _data = [];
					 		$.each(result, function (index, item) {
								if(item.temperature != null) {
									var time = self.getUTC(item.updated_at);
									var dataTime = Date.UTC(time[0], time[1], time[2], time[3], time[4], time[5]);
									var value = parseFloat(item.temperature.toFixed(2));
									_data.push([dataTime, value]);
									_temp.push(value);
								}
							});
							data.type = _type;
							data.data = _data; 
					 	}
					 	else {
					 		var _dataRange = this._initMonthData(true);
					 		var _dataAverage = this._initMonthData(false);
					 		result.sort(this.timeStringSort);
							$.each(result, function (index, item) {
								if(item.min != null && item.max != null) {
									_dataRange[index][1] = item.min.toFloat(2);
									_dataRange[index][2] = item.max.toFloat(2);
									_dataAverage[index][1] = (_dataRange[index][1] + _dataRange[index][2]) / 2;
									_dataAverage[index][1] = _dataAverage[index][1].toFloat(2);
									_temp.push(_dataRange[index][1], _dataRange[index][2]);
								}
							});
							data.averages = _dataAverage;
							data.ranges = _dataRange;
					 	}
					 	data.max = _temp.length ? _temp.max() : null;
						data.min = _temp.length ? _temp.min() : null;
						data.minSettings = $.hive.settings.min_temperature;
						data.maxSettings = $.hive.settings.max_temperature;
						data.averageName = "平均温度";
						data.name = (_type == "DAY") ? "温度" :"温度变化";
						data.valueSuffix = "°C";
						$.hive.initHighCharts().render(id, data, _type == "DAY" ? "line" : "bar");
					}
			},

			initHum: function (id, data, res) {

				if(res.code == 1000) {
					var self = this;
					var result = res.result;
					var _temp = [];
					this.initDay(data);
					var _type = data.type;
					var data = {};
					if(_type == "DAY") {
				 		var _data = [];
				 		$.each(result, function (index, item) {
							if(item.humidity != null) {
								var time = self.getUTC(item.updated_at);
								var dataTime = Date.UTC(time[0], time[1], time[2], time[3], time[4], time[5]);
								var value = parseFloat(item.humidity.toFixed(2));
								_data.push([dataTime, value]);
								_temp.push(value);
							}
						});
						data.type = _type;
						data.data = _data;
				 	}
				 	else {
				 		var _dataRange = self._initMonthData(true);
				 		var _dataAverage = self._initMonthData(false);
				 		result.sort(self.timeStringSort);
						$.each(result, function (index, item) {
							if(item.min != null && item.max != null) {
								_dataRange[index][1] = item.min.toFloat(2);
								_dataRange[index][2] = item.max.toFloat(2);
								_dataAverage[index][1] = (_dataRange[index][1] + _dataRange[index][2]) / 2;
								_dataAverage[index][1] = _dataAverage[index][1].toFloat(2);
								_temp.push(_dataRange[index][1], _dataRange[index][2]);
							}
						});
						data.averages = _dataAverage;
						data.ranges = _dataRange;
				 	}
				 	data.max = _temp.length ? _temp.max() : null;
					data.min = _temp.length ? _temp.min() : null;
					data.minSettings = $.hive.settings.min_humidity;
					data.maxSettings = $.hive.settings.max_humidity;
					data.name = (_type == "DAY") ? "湿度" :"湿度变化";
					data.averageName = "平均湿度";
					data.valueSuffix = "%";
				 	$.hive.initHighCharts().render(id, data, _type == "DAY" ? "line" : "bar");
				}
			},

			initShake: function (id, data, res) {
				if(res.code == 1000) {
					var self = this;
					var result = res.result;
					var _temp = [];
					this.initDay(data);
					var _type = data.type;
					var data = {};
					if(_type == "DAY") {
				 		var _data = [];
						$.each(result, function (index, item) {
							if(item.shake != null) {
								var time = self.getUTC(item.updated_at);
								var dataTime = Date.UTC(time[0], time[1], time[2], time[3], time[4], time[5]);
								var value = parseFloat(item.shake);
								_data.push([dataTime, value]);
								_temp.push(value);
							}
						});
					}
					else {
						var _data = self._initMonthData();
						result.sort(self.timeStringSort);
						$.each(result, function (index, item) {
							if(item.count != null) {
								_data[index][1] = item.count;
								_temp.push(_data[index][1]);
							}
						});
					}
					data.max = _temp.length ? _temp.max() : null;
					data.min = _temp.length ? _temp.min() : null;
					data.minSettings = $.hive.settings.min_shake;
					data.maxSettings = $.hive.settings.max_shake;
					data.name = "震动";
					data.valueSuffix = "次/小时";
					data.data = _data;
					data.type = _type;
					$.hive.initHighCharts().render(id, data, "line");
				}
			},

			initRay: function (id, data, res) {
				if(res.code == 1000) {
					var self = this;
					var result = res.result;
					var _temp = [];
					this.initDay(data);
					var _type = data.type;
					var data = {};
					if(_type == "DAY") {
				 		var _data = [];
						$.each(result, function (index, item) {
							if(item.count != null) {
								var time = self.getUTC(item.updated_at);
								var dataTime = Date.UTC(time[0], time[1], time[2], time[3], time[4], time[5]);
								var value = parseFloat(item.count);
								_data.push([dataTime, value]);
								_temp.push(value);
							}
						});
					}
					else {
						var _data = self._initMonthData();
						result.sort(self.timeStringSort);
						$.each(result, function (index, item) {
							if(item.count != null) {
								_data[index][1] = item.count;
								_temp.push(_data[index][1]);
							}
						});
					}
					data.max = _temp.length ? _temp.max() : null;
					data.min = _temp.length ? _temp.min() : null;
					data.minSettings = $.hive.settings.ray;
					data.maxSettings = null;
					data.name = "人流";
					data.valueSuffix = "人/小时";
					data.data = _data;
					data.type = _type;
					$.hive.initHighCharts().render(id, data, "line");
				}
			},

			initEnergy: function (id, data, res) {
				if(res.code == 1000) {
					var self = this;
					var result = res.result;
					var _temp = [];
					this.initDay(data);
					var _type = data.type;
					var data = {};
					if(_type == "DAY") {
						var _data = [];
						$.each(result, function (index, item) {
							if(item.energy != null) {
								var time = self.getUTC(item.updated_at);
								var dataTime = Date.UTC(time[0], time[1], time[2], time[3], time[4], time[5]);
								var value = parseFloat(item.energy);
								_data.push([dataTime, value]);
								_temp.push(value);
							}
						});
					}
					else {
						var _data = self._initMonthData();
						result.sort(self.timeStringSort);
						$.each(result, function (index, item) {
							if(item.count != null) {
								_data[index][1] = item.count;
								_temp.push(_data[index][1]);
							}
						});
					}
					data.max = _temp.length ? _temp.max() : null;
					data.min = _temp.length ? _temp.min() : null;
					data.minSettings = $.hive.settings.min_energy;
					data.maxSettings = $.hive.settings.max_energy;
					data.name = "能耗";
					data.valueSuffix = "kw/h";
					data.data = _data;
					data.type = _type;
					$.hive.initHighCharts().render(id, data, "line");
				}
			}

		});

		$.hive.initchart = new initChart();
	});
})(jQuery);