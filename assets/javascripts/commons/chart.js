(function ($) {
  $.hive.initChart = function (options) {
    return new EchartsShow();
  };

  function EchartsShow() {
    this.day = ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24"];
    this.month = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];

    this._render =function(chartId, chartOption) {
        if($("#" + chartId + '-loading').attr('id'))
        {
          $("#" + chartId + '-loading').hide();
          $("#" + chartId + '-content').show();
        }
        var newChart = echarts.init(document.getElementById(chartId));
        newChart.setOption(chartOption);
        return newChart;
    };

    this._hoursValue = function (value) {
        var date = new Date(value);
        return date.getHours() + "时";
    };

    this._dayValue = function (value) {
        var date = new Date(value);
        return date.getDate() + "日"
    };

    this._setPositionOption = function(data) {
      this.positionOption = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient : 'vertical',
                x : 'right',
                y : '10',
                data:data.legend
            },
            calculable : true,
            series : [
                {
                    name:'位置分布',
                    type:'pie',
                    radius : ['50%', '70%'],
                    itemStyle : {
                        normal : {
/*                            label : {
                                show : false
                            },
                            labelLine : {
                                show : false
                            }*/
                        },
                        emphasis : {
                            label : {
                                show : true,
                                position : 'center',
                                textStyle : {
                                    fontSize : '20',
                                    fontWeight : 'bold'
                                }
                            }
                        }
                    },
                    data:data.area
                }
            ]
        };
    };

    this._setTemperatureOption = function(data) {
      this.temperatureOption = {
            tooltip : {
                trigger: 'axis'
            },
            xAxis : [
                {
                    type : 'category',
                    data : data.time
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} °C'
                    }
                }
            ],
            series : [
                {
                    name:'最低温度',
                    type:'bar',
                    stack: '1',
                    barWidth: 3,
                    itemStyle:{
                        normal:{
                            color:'rgba(0,0,0,0)'
                        },
                        emphasis:{
                            color:'rgba(0,0,0,0)'
                        }
                    },
                    data:data.min
                },
                {
                    name:'温度变化',
                    type:'bar',
                    stack: '1',
                    data:data.change,
                    markPoint : (function (data) {
                        var arr = { 
                            data: [],
                            symbol: 'pin'
                        };
                        $.each(data.change, function (index, item) {
                            if(item == 0) {
                                var obj = new Object();
                                obj.name = "当天温度 "
                                obj.value = data.min[index];
                                obj.xAxis = data.time[index].toString();
                                obj.yAxis = data.min[index];
                                arr.data.push(obj);
                            }
                        });
                        return arr;
                    })(data)
                }
            ]
      };
    };

    this._setShakingOption = function(data) {
      this.shakingOption = {
        tooltip : {
            trigger: 'axis'
        },     
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : data.time
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLabel : {
                    formatter: '{value} 次'
                }
            }
        ],
        series : [
            {
                name:'震动次数',
                type:'line',
                stack: '总量',
                data: data.count,
                itemStyle: {normal: {areaStyle: {type: 'default'}}}
            }
        ]
      };
    };

    this._setEnergyConsumptionOption = function(data) {
      this.energyConsumptionOption = {
            tooltip : {
                trigger: 'axis'
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : data.time
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} kw'
                    }
                }
            ],
            series : [
                {
                    name:'能耗',
                    type:'line',
                    smooth:true,
                    itemStyle: {normal: {areaStyle: {type: 'default'}}},
                    data: data.count,
                }
            ]
        };
    };
    
    this._setFlowrateOption = function(data) {
      this.flowRateOption = {
            tooltip : {
                trigger: 'axis'
            },     
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : data.time
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} 人'
                    }
                }
            ],
            series : [
                {
                    name:'人流量',
                    type:'line',
                    stack: '总量',
                    data: data.count,
                    itemStyle: {normal: {areaStyle: {type: 'default'}}}
                }
            ]
        };
    };

    this._setHumitureOption = function(data) {
        this.humitureOption = {
            tooltip : {
                trigger: 'axis'
            },
           
            xAxis : [
                {
                    type : 'category',
                    data : data.time
                }
            ],
            yAxis : [
                {
                    type : 'value',/*
                    data: [0, 20, 40, 60, 80, 100]*/
                    axisLabel : {
                        formatter: '{value} %'
                    }
                }
            ],
            series : [                                                                                                                                                                                                                                                                                                          
                {
                    name:'最低湿度',
                    type:'bar',
                    stack: '1',
                    barWidth: 3,
                    itemStyle:{
                        normal:{
                            color:'rgba(0,0,0,0)'
                        },
                        emphasis:{
                            color:'rgba(0,0,0,0)'
                        }
                    },
                    data:data.min
                },
                {
                    name:'湿度变化',
                    type:'bar',
                    stack: '1',
                    data:data.change,
                    markPoint : (function (data) {
                        var arr = { 
                            data: [],
                            symbol: 'pin'
                        };
                        $.each(data.change, function (index, item) {
                            if(item == 0) {
                                var obj = new Object();
                                obj.name = "当天湿度 "
                                obj.value = data.min[index];
                                obj.xAxis = data.time[index].toString();
                                obj.yAxis = data.min[index];
                                arr.data.push(obj);
                            }
                        });
                        return arr;
                    })(data)
                }
            ]
      };
    };

    this._setBgDayTemperatureOption = function (data) {
        this.bgDayTemperatureOption = {
            tooltip : {
                trigger: 'itme'
            },
            xAxis : [
                {
                    type : 'time',
                    splitNumber: 30,             
                    axisLabel : {
                        formatter: this._hoursValue
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} °C'
                    }
                }
            ],
            series : [
                {
                    type: 'scatter',
                    data: data,
                    symbolSize: 6
                },
                {
                    type: 'line',
                    data: data,
                    markLine : data.length == 0 ? null : {
                        data : [
                            [
                                {
                                    name: '最低气温',
                                    value: $.hive.settings.min_temperature,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.min_temperature
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.min_temperature
                                }
                            ],
                            [
                                {
                                    name: '最高气温',
                                    value: $.hive.settings.max_temperature,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.max_temperature
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.max_temperature
                                }
                            ]
                        ]
                    }
                }
            ]
        };
    };

    this._setBgDayHumitureOption = function (data) {
        this.bgDayHumitureOption = {
            tooltip : {
                trigger: 'item'
            },
            xAxis : [
                {
                    type : 'time',
                    splitNumber: 30,             
                    axisLabel : {
                        formatter: this._hoursValue
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} %'
                    }
                }
            ],
            series : [
                {
                    type: 'scatter',
                    data: data,
                    symbolSize: 6
                },
                {
                    type: 'line',
                    data: data,
                    markLine : data.length == 0 ? null : {
                        data : [
                            [
                                {
                                    name: '最低湿度',
                                    value: $.hive.settings.min_humidity,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.min_humidity
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.min_humidity
                                }
                            ],
                            [
                                {
                                    name: '最高湿度',
                                    value: $.hive.settings.max_humidity,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.max_humidity
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.max_humidity
                                }
                            ]
                        ]
                    }
                }
            ]
        };
    };

    this._setBgShakingOption = function (data) {
        this.bgShakingOption = {
            tooltip : {
                trigger: 'axis',
                padding: 5,
            },
            xAxis : [
                {
                    type : 'time',
                    splitNumber: 30,             
                    axisLabel : {
                        formatter: data.length > 24 ? this._dayValue : this._hoursValue
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} 次'
                    }
                }
            ],
            series : [
                {
                    type: 'scatter',
                    data: data,
                    symbolSize: 6
                },
                {
                    type: 'line',
                    data: data,
                    markLine : data.length == 0 ? null : {
                        data : [
                            [
                                {
                                    name: '最低震动',
                                    value: $.hive.settings.min_shake,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.min_shake
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.min_shake
                                }
                            ],
                            [
                                {
                                    name: '最高震动',
                                    value: $.hive.settings.max_shake,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.max_shake
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.max_shake
                                }
                            ]
                        ]
                    }
                }
            ]
        };
    };

    this._setBgEnergyConsumptionOption = function (data) {
        this.bgEnergyConsumptionOption = {
            tooltip : {
                trigger: 'item'
            },
            xAxis : [
                {
                    type : 'time',
                    splitNumber: 30,             
                    axisLabel : {
                        formatter: data.length > 24 ? this._dayValue : this._hoursValue
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} kw'
                    }
                }
            ],
            series : [
                {
                    type: 'scatter',
                    data: data,
                    symbolSize: 6
                },
                {
                    type: 'line',
                    data: data,
                    markLine : data.length == 0 ? null : {
                        data : [
                            [
                                {
                                    name: '最高能耗',
                                    value: $.hive.settings.max_energy,
                                    xAxis: -1,
                                    yAxis: $.hive.settings.max_energy
                                },
                                {
                                    xAxis: 30,
                                    yAxis: $.hive.settings.max_energy
                                }
                            ]
                        ]
                    }
                }
            ]
        };
    };

    this._setBgFlowrateOption = function (data) {
        this.bgFlowrateOption = {
            tooltip : {
                trigger: 'item'
            },
            xAxis : [
                {
                    type : 'time',
                    splitNumber: 30,             
                    axisLabel : {
                        formatter: data.length > 24 ? this._dayValue : this._hoursValue
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} 人'
                    }
                }
            ],
            series : [
                {
                    type: 'scatter',
                    data: data,
                    symbolSize: 6
                },
                {
                    type: 'line',
                    data: data
                }
            ]
        };
    };

    this._bindEvent = function(chart) {
      Metronic.addResizeHandler(function () {
        chart.resize();
      });
    };
    this._bindBgEvent = function(chart) {
        window.onresize = chart.resize;
    };
  }

EchartsShow.prototype = {
  initTemperatureChart:function(chartId, data) {
    this._setTemperatureOption(data);
    this.temperatureChart = this._render(chartId,this.temperatureOption);
    this._bindEvent(this.temperatureChart);
  },

  initShakingChart:function(chartId, data) {
    this._setShakingOption(data);
    this.shakingChart = this._render(chartId, this.shakingOption);
    this._bindEvent(this.shakingChart);
  },

  initEnergyConsumptionChart:function(chartId, data) {
    this._setEnergyConsumptionOption(data);
    this.energyConsumptionChart = this._render(chartId, this.energyConsumptionOption);
    this._bindEvent(this.energyConsumptionChart);
  },

  initFlowrateChart:function(chartId, data) {
    this._setFlowrateOption(data);
    this.flowrateChart = this._render(chartId, this.flowRateOption);
    this._bindEvent(this.flowrateChart);
  },

  initHumitureChart:function(chartId, data) {
    this._setHumitureOption(data);
    this.humitureChart = this._render(chartId, this.humitureOption);
    this._bindEvent(this.humitureChart);
  },

  initPositionChart:function(chartId, data) {
    this._setPositionOption(data);
    this.positionChart = this._render(chartId,this.positionOption);
    this._bindEvent(this.positionChart);
  },

  initBgFlowrateChart: function (chartId, data) {
    this._setBgFlowrateOption(data);
    if(this.bgFlowrateChart) {
        this.bgFlowrateChart.setOption(this.bgFlowrateOption);
    }
    this.bgFlowrateChart = this._render(chartId, this.bgFlowrateOption);
    this._bindBgEvent(this.bgFlowrateChart);
  },

  initBgShakingChart: function (chartId, data) {
    this._setBgShakingOption(data);
    if(this.bgShakingChart) {
        this.bgShakingChart.setOption(this.bgShakingOption);
    }
    this.bgShakingChart = this._render(chartId, this.bgShakingOption);
    this._bindBgEvent(this.bgShakingChart);
  },

  initBgEnergyConsumptionChart: function (chartId, data) {
    this._setBgEnergyConsumptionOption(data);
    if(this.bgEnergyConsumptionChart) {
        this.bgEnergyConsumptionChart.setOption(this.bgEnergyConsumptionOption);
    }
    this.bgEnergyConsumptionChart = this._render(chartId, this.bgEnergyConsumptionOption);
    this._bindBgEvent(this.bgEnergyConsumptionChart);
  },

  initBgDayTemperatureChart: function (chartId, data) {
    this._setBgDayTemperatureOption(data);
    this.bgDayTemperatureChart = this._render(chartId, this.bgDayTemperatureOption);
    this._bindBgEvent(this.bgDayTemperatureChart);
  },

  initBgDayHumitureChart: function (chartId, data) {
    this._setBgDayHumitureOption(data);
    this.bgDayHumitureChart = this._render(chartId, this.bgDayHumitureOption);
    this._bindBgEvent(this.bgDayHumitureChart);
  }

};

})(jQuery);