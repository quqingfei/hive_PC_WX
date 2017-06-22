(function ($) {

	$(window.document).ready(function () {

		function topBar() {
			this.lists = [];
			$.hive.buildObservable(this);
		}

		$.extend(topBar.prototype, {

			detailsToggleOpenClick: function (ev, e) {
				if(e.toElement.className.indexOf('fa-reorder') > -1) {
					$('.wx-leftside').addClass('wx-leftside-show');
					$('.wx-black').addClass('wx-black-show');
				}
				else {
					if($('.wx-deviceChart-show').length) {
						$.hive.deviceChart.deviceChartHide();
					}
					else {
						$.hive.deviceDetails.hideDeviceDetails();
					}
				}
				
				return false;
			},

			bindsearchClickEvent: function (e) {

				$('.wx-searchInput').addClass('wx-searchInput-show');
				$('.wx-searchInput').trigger('focus');
				return false;
			},

			bindSearchEvent: function (e) {

				if(e.keyCode == 13 && this.value.length > 0) {
					window.location.href = "/weixin/search?search={0}"._format(encodeURI(encodeURI(this.value)));
				}
				else {
					(e.keyCode == 13) ? $('.wx-searchInput').removeClass('wx-searchInput-show').val('') : "";
				}

			},

			QRcodeClick: function () {

			},

			topListToggleOpenClick: function () {

				if($('.wx-deviceChart-show').length || $('.wx-deviceDetails-show').length) {
					return false;
				}

				$('.wx-toplist').addClass('wx-toplist-show');

				$.hive.topBar.timeOut = setTimeout(function () {
					$('.wx-toplist').removeClass('wx-toplist-show');
				}, 3000);
				
				return false;
			},

			initTopBar: function () {
				for(var i in arguments) {
					this.lists.push({
						listName: arguments[i],
						listNum: parseInt(i) + 1
					});
				}
			},

			bindListClick: function () {

			},

			bindCommonClickEvent: function () {
				$('.wx-nav-list').live('click', this.topListToggleOpenClick);
				$('.wx-nav-QRcode').live('click', this.QRcodeClick);
				$('.wx-searchInput').keyup(this.bindSearchEvent);
				$('.wx-nav-search').click(this.bindsearchClickEvent);
			},

			hideIcon: function () {

				if($('.wx-settings, .wx-map, .wx-newDevice').length) {
					$('.hive-weixin-topbar .pull-right').hide();
				}

				if(!$('.wx-message, .wx-newDevice, .wx-inspection').length) {
					$('.wx-nav-QRcode').hide();
				}

				if($('.wx-newDevice').length) {
					$('.wx-nav-QRcode').show();
				}

			},

			init: function () {
				this.bindCommonClickEvent();
				this.hideIcon();
			}

		});

		$.hive.topBar = new topBar();
		ko.applyBindings($.hive.topBar, document.getElementById('hive-weixin-topbar'));
		$.hive.topBar.init();
	});

})(jQuery);