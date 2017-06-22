(function ($) {
  $.hive.geocoder = function (sn, longitude, latitude) {
    var data = {};
    AMap.service(["AMap.Geocoder"], function () {

      geocoder = new AMap.Geocoder({
        radius: 1,
        extensions: "all"
      }); 
      geocoder.getAddress(new AMap.LngLat(longitude, latitude), function (status, result) {

        if(status == "error") {
          alert("geocoder Error!");
        }
        else if (status == "no data") {
          alert("geocoder get no data !");
        }
        else {
          result = result.regeocode.addressComponent;
          data.sn = sn;
          data.longitude = longitude;
          data.latitude = latitude;
          data.contry = "中国";
          data.province = result.province;
          data.city = result.city;
          data.downtown = result.district;
          data.street = result.township;
          $.hive.inspection.sendDevicesInspection(data);
        }

      });

    });

  };

  $.hive.initMap = function (options) {
    return new GdMap(options);
  };

  var map = {};
  var markers = [];
  var infowindows = [];
  function GdMap(options){
      this.defaults = {
        containerId: '',
        data: {
          items: []
        },
        infowindowsEnabled: false,
        settings: {
          lang: 'zh-cn',
          center: null,
          zoom: 13,
          marker: {
            iconSize: {
              width: 28,
              height: 37
            },
            //iconUrl: 'http://webapi.amap.com/images/custom_a_j.png',
/*            iconOffset: {
              x: -28,
              y: 0
            },*/
            offset: {
              x: -8,
              y: -34
            },
            click: function () {}
          },
          infoWindow: {
            size: {
              width: 300,
              height: 0
            },
            autoMove: true,
            offset: {
              x: 0,
              y: -20
            }
          }
        },
        areaChanged: function (_map) {

        }
      };

      this.defaults = $.extend(true, this.defaults, options);

      //init the location when the page is loaded.
      this._initMap = function () {
        var settings = this.defaults.settings;

        if(settings.center && settings.center.longitude && settings.center.latitude) {
          var position = new AMap.LngLat(settings.center.longitude, settings.center.latitude);

          return new AMap.Map(this.defaults.containerId, {
              resizeEnable: true,
              lang: settings.lang,
              view: new AMap.View2D({
                  center: position,
                  zoom: settings.zoom
              })
          });
        } else {
          return new AMap.Map(this.defaults.containerId, {
              resizeEnable: true,
              lang: settings.lang,
              view: new AMap.View2D({
                //center: position,
                zoom: settings.zoom
              })
          });
        }
      };

      //init the marker point when the data arrived and insert this point into marker array.
      this._addMarker = function(point){
        var settings = this.defaults.settings;
        var size = new AMap.Size(settings.marker.iconSize.width, settings.marker.iconSize.height);
        //var iconOffset = new AMap.Pixel(settings.marker.iconOffset.x, settings.marker.iconOffset.y);

        return new AMap.Marker({
                  icon: new AMap.Icon({
                      size: size,//the size of the icon image
                      //image: settings.marker.iconUrl,
                      //imageOffset: iconOffset //the offset of the icon image
                  }),
                  position: new AMap.LngLat(point.longitude, point.latitude),
                  //offset: settings.marker.offset // point position relative to the longitude and latitude
                });
      };

      this._getContent = function (point) {
        //TODO:
      };
      
      //init the infoWindow when the data arrived and insert this infoWindow into window array.
      this._addInfoWindow = function(point){
        var infoWindow = this.defaults.settings.infoWindow;
        var size = new AMap.Size(infoWindow.size.width, infoWindow.size.height);
        var pixel = new AMap.Pixel(infoWindow.offset.x, infoWindow.offset.y);


        return new AMap.InfoWindow({
                  content: this._getContent(point),
                  size: size, // the size of infoWindow
                  autoMove: infoWindow.autoMove, 
                  offset: pixel // the location relative to the point
               });
      };

      this._initMarker = function(item){
          var marker = this._addMarker(item);

          if(this.defaults.infowindowsEnabled) {
            var infoWindow = this._addInfoWindow(item);
            infowindows.push(infoWindow);

            AMap.event.addListener(marker, "mouseover", function (e) {
              infoWindow.open(map, marker.getPosition());
            });
          }

          markers.push(marker);
          var self = this;

          AMap.event.addListener(marker, 'click', function (e) {
            self.defaults.marker.click(item);
          });
      };

      // render the data in the map
      this._render = function(data){
        map = this._initMap();
        markers = [];
        infowindows = [];
        for (var i = data.items.length - 1; i >= 0; i--) {
          this._initMarker(data.items[i]);
        };

        map.plugin(["AMap.MarkerClusterer"],function(){ //set points clusterer
            new AMap.MarkerClusterer(map,markers);
        });
        map.plugin(["AMap.ToolBar"], function () {
          var toolBar = new AMap.ToolBar();
          map.addControl(toolBar);
          toolBar.show();
          toolBar.showDirection();
          toolBar.showRuler();
        });
        map.setFitView(); //set the suitable view for user
        if(this.defaults.areaChanged) {
          this.defaults.areaChanged(map);
        } 
      };

      /*this.getLocation = function (longitude, latitude) {
        var geocoder;
        var lnglatXY = new AMap.LngLat(longitude, latitude);
        new AMap.plugin(["Amap.Geocoder"], function () {
          geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "base"
          });;
        });
        geocoder.getAddress(lnglatXY);
      }*/

      // start working here
      this.init();
  }

  GdMap.prototype = {
      // receive the data and init the points and infowindows
      init: function(){
          this._render(this.defaults.data);
      }
  };
})(jQuery);