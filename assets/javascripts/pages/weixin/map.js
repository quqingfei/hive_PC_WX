(function ($) {
	$(window.document).ready(function () {
		function wx_map () {
			this.dataCenter = $.hive.getDataCenterIntance();
		}

		$.extend(wx_map.prototype, {
			init: function () {
				$("#mapContainer").empty();
        $.hive.initMap({
          containerId: 'mapContainer',
          data: {},
          marker: {
            click: function (data) {
            }
          },
          areaChanged: function (map) {
          }
        });
			}
		});
		var mapObj = new wx_map();
		if(document.getElementById('mapContainer')) {
			mapObj.init();
		}
	});
})(jQuery);