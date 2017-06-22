(function ($) {
	function DataCenter() {
		this._ajax = function (type, subUrl, data, success, error, context) {
			var _options = {
				type: type,
				url: subUrl,
				dataType: 'json',
				success: success,
				error: error,
				data: data
			};

			if(_options.type.toUpperCase() == "GET") {
				_options.url += ((_options.url.indexOf("?") > -1 ? "" : "?") + "&___t=" + (new Date).getTime());
			}

			if(context) {
				_options.context =  context;
			}

      		return $.ajax(_options);
		};

		this._get = function (url, data, success, error, context) {
			return this._ajax("GET", url, data, success, error, context);
		};

		this._post = function (url, data, success, error, context) {
			return this._ajax("POST", url, data, success, error, context);	
		};

		this._put = function(url, data, success, error, context) {
			var defaults = { _method: "put" };
			defaults = $.extend(defaults, data);
			return this._post(url, defaults, success, error, context);
		};

		this._delete = function(url, data, success, error, context) {
			var defaults = { _method: "delete" };
			defaults = $.extend(defaults, data);
			return this._post(url, defaults, success, error, context);
		};		
	}

	//NOTE: provide all the ajax interface here
	$.extend(DataCenter.prototype, {
		getDevicesStatus: function (success, error, context) {
			return this._get("/v1/devices/count", {}, success, error, context);
		},

		getSubDevicesAlarmNum: function (success, error, context) {
			return this._get("/v1/devices/sub_devices/alarm_num", {}, success, error, context);
		},

		getAllDevicesLatestHumiture: function (page, perPage, success, error, context) {
			var url = "/v1/devices/humitures?page={0}&per_page={1}"._format(page, perPage);
			return this._get(url, {}, success, error, context);
		},

		getAllDeviceLatestShake: function (page, perPage, success, error, context) {
			var url = "/v1/devices/shakes?page={0}&per_page={1}"._format(page, perPage);
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesLatestPicture: function (page, perPage, success, error, context) {
			var url = "/v1/devices/pictures?page={0}&per_page={1}"._format(page, perPage);
			return this._get(url, {}, success, error, context);
		},
		
		getAllDevicesLatestRay: function (page, perPage, success, error, context) {
			var url = "/v1/devices/rays?page={0}&per_page={1}"._format(page, perPage);
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesLatestEnergy: function (page, perPage, success, error, context) {
			var url = "/v1/devices/energies?page={0}&per_page={1}"._format(page, perPage);
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesLatestLocations: function (success, error, context) {
			return this._get("/v1/devices/locations", {}, success, error, context);
		},

		getAllUnnormalDevicesLatestLocations: function (success, error, context) {
			return this._get("/v1/devices/unormal/locations", {}, success, error, context);
		},

		getSingleDevice: function (deviceId, success, error, context) {
			return this._get("/v1/devices/" + deviceId, {}, success, error, context);
		},

		getSingleDeviceImages: function (time, deviceId, success, error, context) {
			return this._get("/v1/devices/{0}/images?time={1}"._format(deviceId, time), {}, success, error, context);
		},

		getAllDevicesLatestData: function (dataType, success, error, context) {
			return this._get("/v1/devices/latest?dataType={0}"._format(dataType), {}, success, error, context);
		},

		getAlldevicesInformation: function (success, error, context) {
			return this._get("/v1/devices/information",{},success,error,context);
		},

		getDevicesInfomationBySn: function (sn, success, error, context) {
			return this._get("/v1/devices/query?type=sn&value={0}"._format(sn), {}, success, error, context);
		},

		getGroups: function (success, error, context) {
			return this._get("/v1/device_groups", {}, success, error, context);
		},

		deleteGroup: function (groupId, success, error, context) {
			return this._delete("/v1/device_groups/{0}"._format(groupId), {}, success, error, context);
		},

		editGroup: function (groupId, data, success, error, context) {
			return this._put("/v1/device_groups/{0}"._format(groupId), data, success, error, context);
		},

		createGroup: function (data, success, error, context) {
			return this._post("/v1/device_groups", data, success, error, context);
		},

		getGroup: function (groupId, success, error, context) {
			return this._get("/v1/device_groups/{0}"._format(groupId), {}, success, error, context);
		},

		createDevice: function(data, success, error, context){
			return this._post("/v1/devices", data, success, error, context);
		},

		deleteDevice: function(device_id, success, error, context){
			return this._delete("/v1/devices/{0}"._format(device_id), {}, success, error, context);
		},

		assignDevicesToGroup: function (groupId, deviceIds, success, error, context) {
			return this._put("/v1/device_groups/devices_binding/{0}"._format(groupId),  { device_ids: deviceIds }, success, error, context);
		},

		getGroupNames: function (success, error, context) {
			return this._get("/v1/device_groups/names", {}, success, error, context);
		},

		getAllDevicesTemperatueStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_temperature/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesHumidtyStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_humidity/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesEnergyStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_energy/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesRayStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_ray/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesShakeStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_shake/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAllDevicesLocationStatistics: function (type, success, error, context) {
			var url = "/v1/statistic_devices/devices_location_by_city_or_province/{0}"._format(type.toUpperCase());
			return this._get(url, {}, success, error, context);
		},

		getAlldevicesImageStatistics: function (success, error, context) {
			var url = "/v1/statistic_devices/device_images";
			return this._get(url, {}, success, error, context);
		},

		getNotificationData: function (success, error, context) {
			return this._get("/v1/messages/my_unread_msgs", {}, success, error, context);
		},

		getSentMessages: function (success, error, context) {
			return this._get("/v1/messages/my_sent_msgs", {}, success, error, context);
		},

		getRecievedMessages: function(success,error,context) {
			return this._get("/v1/messages/my_recieved_msgs", {}, success, error, context);
		},

		createMessage:  function(data,success,error,context) {
			return this._post("/v1/messages", data, success, error, context);
		},

		deleteMessages: function (data, success, error, context) {
			return this._delete("/v1/messages", data, success, error, context);
		},

		markMessagesAsRead: function (data, success, error, context) {
			return this._put("/v1/messages", data, success, error, context);
		},

		getSpecificMessage:function(messge_id,success,error,context){
			var url = "/v1/messages/{0}"._format(messge_id);
			return this._get(url, {}, success, error, context);
		},

		getBgTempChartData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_temperature/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		getBgHumitureChartData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_humidity/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		getBgShakingChartData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_shake/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		getBgFlowrateChartData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_ray/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		getBgEnergyConsumptionChartData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_energy/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		getBgMapData: function (data, success, error, context) {
			var url = "/v1/statistic_devices/devices_location/{0}/{1}/{2}"._format(data.type, data.time, data.mac);
			return this._get(url, {}, success, error, context);
		},

		updateSingleDevice: function (data, device_id, success, error, context) {
			var url = "/v1/devices/{0}"._format(device_id);
			return this._put(url, data, success, error, context);
		},

		upLoadLogoFile: function (data, success, error, context) {
			var url = "/v1/settings#create_logo";
			return this._post(url, data, success, error, context);
		},

		getSettingsData: function (data, success, error, context) {
			var url = "/v1/settings#get_user_setting";
			return this._get(url, {}, success, error, context);
		},

		updateSettingsData: function (data, success, error, context) {
			var url = "/v1/settings#update";
			return this._post(url, data, success, error, context);
		},

		updateUserData: function (data,success,error,context){
			return this._post("/update_user",data,success,error,context);
		},

		getSearchDevices: function (data, success, error, context) {
			var url = "/v1/deveices/search_device";
			return this._get(url, data, success, error, context);
		},

		postSwitchDevices: function (data, success, error, context) {
			var url = "/v1/devices/switch";
			return this._post(url, data, success, error, context);
		},

		postDevicesInspection: function (data, success, error, context) {
			var url = "/v1/routing_inspection";
			return this._post(url, data, success, error, context);
		},

		postWeixinAuthentication: function (data, success, error, context) {
			var url = "/v1/weixin/auth";
			return this._post(url, data, success, error, context);
		}

	});

	$.hive.getDataCenterIntance = function () {
		return new DataCenter();
	};

})(jQuery);
