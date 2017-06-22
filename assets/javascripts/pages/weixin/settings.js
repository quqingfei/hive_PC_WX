(function ($) {
	$(window.document).ready(function () {

		function wx_settings () {

			this.min_energy = "";
			this.max_energy = "";
			this.min_temperature = "";
			this.max_temperature = "";
			this.min_humidity = "";
			this.max_humidity = "";
			this.min_shake = "";
			this.max_shake = "";
			this.radius = "";
			this.ray = "";
			this.max_no_data_time = "";
			this.humiture_max_upload_time = "";
			this.shake_max_upload_time = "";
			this.picture_max_upload_time = "";
			this.infrared_max_upload_time = "";
			$.hive.buildObservable(this);

		}

		$.extend(wx_settings.prototype, {

			init: function () {

				this.bindCommonEvent();
				this.renderData();
				
			},

			dataCenter: $.hive.getDataCenterIntance(),

			bindCommonEvent: function () {

				var self = this;
				$('.wx-settings-confirm').show();
				$('.wx-settings-confirm').click(function () {
					self.postSettingsClickEvent();
				});
				$('.wx-settings-theme span').click(function () {
					self.themeSelectEvent(this);
				});
			},

			themeSelectEvent: function (self) {

				$(self).siblings('span').removeClass('select-theme');
				$(self).addClass('select-theme');

			},

			postSettingsClickEvent: function () {

				var data = this.initUpdateData();
				console.log(data);
				this.dataCenter.updateSettingsData(data, function (res) {

					if(res.code == 1000) {
						alert("修改成功");
						location.href = location.href;
					}
					else {
						alert("阀值修改出错");
					}

				}, this.errorAjax, this);

			},

			initUpdateData: function () {

				var data = {
					setting: {}
				};
				var arr = $('#wx-settingsForm').serializeArray();
				$.each(arr, function (index, item) {
					data.setting[item.name] = item.value.toString();
				});
				data.setting.theme = $('.select-theme').attr('data-themeType');
				return data;

			},

			renderData: function () {

				var self = this;
				$.each($.hive.settings, function (index, value) {

					if(self.hasOwnProperty(index)) {
						(self[index])(value);
					}

				});
				$('.wx-settings-theme span[data-themeType="{0}"]'._format($.hive.settings.theme)).addClass('select-theme');
			},

			errorAjax: function (err) {

				console.log(err);

			}

		});
		
		var obj = document.getElementById('wx-settingsForm');
		if(obj) {
			var wx_settingsObj = new wx_settings();
			ko.applyBindings(wx_settingsObj, obj);
			wx_settingsObj.init();
		}

	});
})(jQuery);