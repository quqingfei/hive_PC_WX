(function ($) {
	$.hive = {		
		returnMoveDireaction: function (startX, startY, endX, endY) {
			var dy = startY - endY;
			var dx = startX - endX;
			var result = 0;
			if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
				return result;
			}
			var angle = Math.atan2(dy, dx) * 180 / Math.PI;
			if (angle >= -45 && angle < 45) {
				result = 4;
			}
			else if (angle >= 45 && angle < 135) {
				result = 1;
			}
			else if (angle >= -135 && angle < -45) {
				result = 2;
			}
			else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
				result = 3;
			}
			else {
				result = 0;
			}
			return result;
		},

		buildObservable: function (obj) {
			var to_s = Object.prototype.toString;
			for(var field in obj) {
				switch(to_s.call(obj[field])) {
					case "[object Number]":
					case "[object String]":
					case "[object Boolean]":
						obj[field] = ko.observable(obj[field]);
					break;

					case "[object Array]":
						obj[field] = ko.observableArray(obj[field]);
					break;

					case "[object Null]":
						obj[field] = ko.observable();
					break;
				}
			}
		},

		checkNormal: function (data) {
			var status = "设备运行正常";
			var validation = $.hive.validation;
			var humitures = data.humitures;
			var pictures = data.pictures;
			var rays = data.rays;
			var shakes = data.shakes;
			var energy = data.energy;
			var humituresAlarm = (humitures && validation.isOutDate(humitures[0].updated_at));
			var raysAlarm = (rays && validation.isOutDate(rays[0].updated_at));
			var shakesAlarm = (shakes && validation.isOutDate(shakes[0].updated_at));
			var energyAlarm = (energy && validation.isOutDate(energy.updated_at));
			var picturesAlarm = (pictures && validation.isOutDate(pictures[0].updated_at));
			if(humituresAlarm || raysAlarm || shakesAlarm || energyAlarm || picturesAlarm) {
				status = "设备超时";
				return status;
			}
			humituresAlarm = (humitures && (validation.isTemperatureWarning(humitures[0].temperature) || validation.isHumidityWarning(humitures[0].humidity)));
			shakesAlarm = (shakes && validation.isShakeWarning(shakes[0].shake));
			energyAlarm = (energy && validation.isEnergyWarning(energy.energy));
			if(humituresAlarm) {
				status = "温湿度异常";
			}
			else if(shakesAlarm) {
				status = "震动异常";
			}
			else if (energyAlarm) {
				status = "能耗异常";
			}
			else {
				return status;
			}
		}
	};

})(jQuery);