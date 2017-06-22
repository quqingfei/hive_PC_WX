$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-map');
  $.hive.init(options, function () {
    function MapPage() {
      this.dataCenter = $.hive.getDataCenterIntance();
    }

    $.extend(MapPage.prototype, {
      init: function () {
        var self = this;

        this.bindEvents();
        this.getAllLocations();

        Metronic.addResizeHandler(function () {
          self.resizeMapView();
        });
      },

      bindEvents: function () {
        var self = this;

        $("#hive-map-all").click(function () {
          if($(this).is(".hive-map-span-actived")) {
            return;
          }

          self.switchActivedStatus("#hive-map-unNormal", "#hive-map-all");   

          self.getAllLocations();   
        });

        $("#hive-map-unNormal").click(function () {
          if($(this).is(".hive-map-span-actived")) {
            return;
          }
          self.switchActivedStatus("#hive-map-all", "#hive-map-unNormal");  

          self.getUnnormalDevicesLocations();   
        });
      },

      getAllLocations: function () {
        $.hive.startPageLoading();

        this.switchActivedStatus("#hive-map-unNormal", "#hive-map-all");

        this.dataCenter.getAllDevicesLatestLocations(this.getLocationSucceedCallback, this.getLocationFailedCallback);
      },

      getUnnormalDevicesLocations: function () {
        this.switchActivedStatus("#hive-map-all", "#hive-map-unNormal");  

        this.dataCenter.getAllDevicesLatestLocations(this.getLocationSucceedCallback, this.getLocationFailedCallback);
      },

      generateMap: function (data) {
        $("#mapContainer").empty();
        $.hive.initMap({
          containerId: 'mapContainer',
          data: data,
          marker: {
            click: function (data) {
              $.hive.showDeviceDetails(data.id);
            }
          },
          areaChanged: function (map) {
              AMap.event.addListener(map, "moveend", function () {
                  map.getCity(function(data){
                      if(data['province'] && (typeof data['province'] === 'string')){
                          var zoom = map.getZoom();
                          $('.hive-map-span1').text((zoom <= 5 && "全国") 
                                                    ||
                                                   (zoom > 6 && data['city'])
                                                    ||
                                                   data['province']);
                      }
                  });
              });
          },
          settings: {
            center: (data.items.length == 0 ? null : { longitude: data.items[0].longitude, latitude:data.items[0].latitude })
          }
        });
      },

      getLocationSucceedCallback: function (res) {
        var devices = res.result.data.devices;
        var data = { items: [] };

        $.each(devices, function (index, item) {
          if(item.location.latitude && item.location.longitude) {
            data.items.push({
              id: item.id,
              longitude: item.location.longitude,
              latitude: item.location.latitude
            });
          }
        });

        currentPageObj.generateMap(data);

        $.hive.stopPageLoading();

        currentPageObj.resizeMapView();
      },

      getLocationFailedCallback: function (err) {
        $.hive.logErrorAndHideLoading(err);
      },

      resizeMapView: function () {
        $('.hive-map-body').css('min-height', ($('.page-content').height() - 60) + 'px');
      },

      switchActivedStatus: function (from, to) {
        $(to).addClass("hive-map-span-actived");
        $(from).removeClass('hive-map-span-actived'); 
      }
    });

    var currentPageObj = new MapPage();
    currentPageObj.init();

  });
});
