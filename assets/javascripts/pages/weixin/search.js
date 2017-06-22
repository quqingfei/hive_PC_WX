(function ($) {
	$(window.document).ready(function () {

		function wx_search() {

			this.searchs = [];
			$.hive.buildObservable(this);

		}

		$.extend(wx_search.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {
				this.renderDevices();
				this.bindCommonEvent();
			},

			bindCommonEvent: function () {
				$('.wx-search li').live('click', this.bindLiClickEvent);
			},

			bindLiClickEvent: function () {
				$.hive.deviceDetails.showDeviceDetails($(this).attr('data-id'));
			},

			_getSearchString: function () {
				var str = decodeURI(decodeURI(window.location.href.split("?search=")[1]));
				$(".wx-searchInput").val(str);
				return str;
			},

			renderDevices: function () {
				var self = this;
				$.when(this.getGroups(), this.getSearchDevices()).done(function () {
					$.each(self.devices, function (index, item) {
						var location = item.location;
						location = (location.country || "") + (((location.city == location.country) ? "" : location.city) || "") + (location.downtown || "") + (location.street || "");
						self.searchs.push({
							name: item.name,
							address: location,
							admin: "",
							id: item.id,
							isError: ($.hive.checkNormal(item) != "设备运行正常")
						});
					});
					$.each(self.groups, function (index, item) {

						$.each(item.device_ids, function (group, value) {
							$('.wx-search li[data-id={0}] .wx-search-admin'._format(value)).text(item.manager.full_name);
						});

					});
				});
			},

			getSearchDevices: function () {

				return this.dataCenter.getSearchDevices({key: this._getSearchString()}, function (res) {

					if(res.code == 1000) {
						this.devices = res.result.data.devices;
					}

				}, this.errorAjax, this);

			},

			getGroups: function () {

				return this.dataCenter.getGroups(function (res) {
					this.groups = res.result;
				}, this.errorAjax, this);

			},

			errorAjax: function (err) {
				console.log(err);
			}

		});

		var obj = document.getElementById('wx-search');
		var wx_searchObj = new wx_search();
		if(obj) {
			ko.applyBindings(wx_searchObj, obj);
			wx_searchObj.init();
		}

	});

})(jQuery);