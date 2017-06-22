(function ($) {
	
	$.hive.initHighCharts = function () {
		return new highCharts();
	};

	function highCharts () {

		this.formatTime = function (num) {
			return num < 10 ? "0" + num.toString() : num;
		};

		this.formatDate = function (date) {
			hour = this.formatTime(date.getHours());
			minute = this.formatTime(date.getMinutes());
			return "{0}:{1}"._format(hour, minute);
		};

		this.formatMonth = function (date) {
			var month = this.formatTime(date.getMonth() + 1);;
			var date = this.formatTime(date.getDate());
			return "{0}-{1}"._format(month, date);
		};

		this.zones = function (data) {
			if(data.maxSettings != null && data.minSettings != null) {
				return 	[
					{
						value: data.minSettings,
						color: 'red'
					},
					{
						value: data.maxSettings,
						color: '#7cb5ec'
					},
					{
						color: 'red'
					}
				];
			}
			else if (data.minSettings) {
				return [
					{
						value: data.minSettings,
						color: 'red'
					}
				];
			}
		};

		this.setTimeValueLineOption = function (data) {
			var self = this;
			var index = 0;
			var options = {
				chart: {
					type: "spline"
				},

				title: {
					text: data.title || ""
				},

				xAxis: {
					type: "datetime",
					labels: {

					}
				},

				yAxis: {
					title: {
						text: data.yAxis || ""
					},
					min: data.min,
					max: data.max,
					plotBands: [
					{
						from: data.maxSettings,
						to: 9999,
						color: 'rgba(255, 0, 0, 0.1)'
					},
					{
						from: data.minSettings,
						to: -9999,
						color: 'rgba(255, 0, 0, 0.1)'
					}
					],
					lineWidth: 1
				},

				plotOptions: {
					spline: {
						lineWidth: 3,
						states: {
							hover: {
								lineWidth: 4
							}
						},
						marker: {
							enabled: true
						}
					}
				},

				tooltip: {
					crosshairs: {
						width: 2,
						color: 'gray',
						dashStyle: 'shortdot'
					},
					shared: true,
					valueSuffix: data.valueSuffix || ""//°C || %
				},

				series: [
					{
						name: data.name || "",
						data: data.data || [],
						zones: self.zones(data)
					}
				]
			};
			options.xAxis.labels.formatter = function () {
				var date = new Date(this.value);
				date.setHours(date.getUTCHours());
				return (data.type != "DAY") ? self.formatMonth(date) : self.formatDate(date);
			}
			return options;
		};

		this.setTimeValueBarOption = function (data) {
			var self = this;
			var options = {
				title: {
					text: data.title || ""
				},
				
				xAxis: {
					type: 'datetime',
					labels: {
						formatter: function () {
							var date = new Date(this.value);
							return (data.ranges.length > 24) ? self.formatMonth(date) : self.formatDate(date);
						}
					}
				},
				
				yAxis: {
					title: {
						text: data.yAxis || ""
					},
					min: data.min,
					max: data.max,
					plotBands: [
						{
							from: data.maxSettings,
							to: 9999,
							color: 'rgba(255, 0, 0, 0.1)'
						},
						{
							from: data.minSettings,
							to: -9999,
							color: 'rgba(255, 0, 0, 0.1)'
						}
					],
					lineWidth: 1
				},
				
				tooltip: {
					crosshairs: {
						width: 2,
						color: 'gray',
						dashStyle: 'shortdot'
					},
					shared: true,
					valueSuffix: data.valueSuffix || ""//°C || %
				},
				
				legend: {
				},
				
				series: [
					{
						name: data.averageName || "",
						data: data.averages || [],
						zIndex: 1,
						marker: {
							fillColor: 'white',
							lineWidth: 2,
/*							lineColor: Highcharts.getOptions().colors[0]*/
						},
						zones: self.zones(data)
					}, 
					{
						name: data.name || "",
						data: data.ranges || [],
						type: 'arearange',
						lineWidth: 0,
						linkedTo: ':previous',
						color: '#7cb5ec',
						fillOpacity: 0.3,
						zIndex: 0
					}
				]
			};
			return options;
		};

		this.setCategoriesValueBarOption = function (data) {
			var self = this;
			var options = {

				title: {
					text: data.title || ""
				},

				xAxis: {
					categories: data.time
				},

				yAxis: {
					title: {
						text: data.yAxis || ""
					},
					min: data.min,
					max: data.max,
					labels: {
						formatter: function () {
							return this.value + data.valueSuffix;
						}
					},
					lineWidth: 1,
					plotBands: [
						{
							from: data.maxSettings,
							to: 9999,
							color: 'rgba(255, 0, 0, 0.1)'
						},
						{
							from: data.minSettings,
							to: -9999,
							color: 'rgba(255, 0, 0, 0.1)'
						}
					]
				},

				tooltip: {
					crosshairs: false,
					shared: true,
					valueSuffix: data.valueSuffix || ""//°C || %
				},

				legend: {
					enabled: false
				},

				series: [
					{
						name: data.pointName || "",
						data: data.points || [],
						zIndex: 2,
						zones: self.zones(data)
					},
					{
						name: data.name || "",
						data: data.ranges || [],
						type: 'arearange',
						color: '#7cb5ec',
						zIndex: 1
					}
				]
			};
			return options;
		};

		this.setCategoriesValueLineOption = function (data) {
			var self = this;
			var options = {
				chart: {
					type: 'spline'
				},

				title: {
					text: data.title || ""
				},

				xAxis: {
					categories: data.time
				},

				yAxis: {
					title: {
						text: data.yAxis || ""
					},
					min: 0,
					lineWidth: 1,
					plotBands: [
						{
							from: data.maxSettings,
							to: 9999,
							color: 'rgba(255, 0, 0, 0.1)'
						},
						{
							from: data.minSettings,
							to: -9999,
							color: 'rgba(255, 0, 0, 0.1)'
						}
					]
				},

				legend: {
					enabled: false
				},

				series: [
					{
						name: data.name || "",
						data: data.data || [],
						zones: self.zones(data)

					}
				]
			};
			return options;
		};

		this.sethalfPieOption = function (data) {
			var options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: null
        },
        tooltip: {
    	    pointFormat: '比例 : <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#eee',
                    connectorColor: '#ddd',
                    formatter: function() {
                        return ' '+ this.point.name +' : '+ parseInt(this.percentage / 100 * data.total);
                    }
                },
                size: 200,
                innerSize: '130'
            }
        },
        series: [{
            type: 'pie',
            name: data.name || "",
            data: data.data,
            color: '#7cb5ec',
        }]
    };
    	return options;
		};

		this.setPieOption = function (data) {
			var options = {
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false
		        },
		        title: {
		            text: null
		        },
		        tooltip: {
		    	    pointFormat: '比例 : <b>{point.percentage:.1f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: true,
		                    color: '#eee',
		                    connectorColor: '#ddd',
		                    formatter: function() {
		                        return ' '+ this.point.name +' : '+ parseInt(this.percentage / 100 * data.total)+ ' 个';
		                    }
		                },
		                size: 200
		            }
		        },
		        series: [{
		            type: 'pie',
		            name: data.name,
		            data: data.data,
		            color: '#7cb5ec',
		        }]
	    	};
	    	return options;
		};

		this.selectTypeChart = function (type, data) {
			var options = {};
			switch(type) {
				case "line": 
					options = this.setTimeValueLineOption(data);
					break;
				case "bar":
					options = this.setTimeValueBarOption(data);
					break;
				case "allBar":
					options = this.setCategoriesValueBarOption(data);
					break;
				case "allLine":
					options = this.setCategoriesValueLineOption(data);
					break;
				case "halfpie":
					options = this.sethalfPieOption(data);
					break;
				case "pie":
					options = this.setPieOption(data);
					break;
			}
			return options;
		};

		this.render = function (chartId, data, type) {
			$('#{0}'._format(chartId)).highcharts(this.selectTypeChart(type, data));
		};
	}

	highCharts.prototype = {

	};

})(jQuery);