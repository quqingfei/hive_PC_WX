(function ($) {
	$(window.document).ready(function () {
		$.extend($.hive, {
				
				settings: JSON.parse($("#hive-settings").val()),

				current_date: $("#hive-current-date").val(),

				validation: {
					isOutDate: function (date) {
						var now = (new Date($.hive.current_date)).getTime();
						var pass = (new Date(date)).getTime();
						var timeSpan = now - pass;
						var timeSpanHour = timeSpan / (1000 * 60 * 60);

						return timeSpanHour > $.hive.settings.max_no_data_time;
					},

					isTemperatureWarning: function (temp) {
						if(temp === null || temp === "") {
							return true;
						}
						return temp > $.hive.settings.max_temperature || temp < $.hive.settings.min_temperature;
					},

					isHumidityWarning: function (hum) {
						if(hum === null || hum === "") {
							return true;
						}
						return hum > $.hive.settings.max_humidity || hum < $.hive.settings.min_humidity;
					},

					isShakeWarning: function (shake) {
						if(shake === null || shake === "") {
							return true;
						}
						return shake > $.hive.settings.max_shake;
					},

					isEnergyWarning: function (energy) {
						if(energy === null || energy === "") {
							return true;
						}
						return energy > $.hive.settings.max_energy;
					},

					isLowPower: function (power) {
						if(power === null || power === "") {
							return true;
						}
						return power < $.hive.settings.min_power;
					}
				}
		});
	});
	
})(jQuery);