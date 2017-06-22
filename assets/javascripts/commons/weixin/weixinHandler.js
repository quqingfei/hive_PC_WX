(function ($) {
	$.hive.weixinHandler = {
		getLocation: function (successCB, error) {
			if(!this.IsConfig) {
				this.config();
			}
			wx.ready(function () {
				wx.getLocation({
			    type: 'wgs84',
			    success: function (res) {
		        // var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
		        // var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
		        // var speed = res.speed; // 速度，以米/每秒计
		        // var accuracy = res.accuracy; // 位置精度
		        successCB(res);
			    }
				});
			});

			wx.error(function (res) {
				error(res);
				this.IsConfig = false;
			});
			
		},

		scan: function (successCB, error) {
			if(!this.IsConfig) {
				this.config();
			}
			wx.ready(function () {
				successCB = successCB;
				wx.scanQRCode({
			    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			    scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			    success: function (res) {
				    successCB(res);
					}
				});
			});
			wx.error(function (res) {
				error(res);
				this.IsConfig = false;
			});

		},

		chooseImage: function (successCB) {
			wx.chooseImage({
		    count: 1, // 默认9
		    sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
		    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
		    success: function (res) {
		      successCB(res);
		    }
			});
		},

		config: function () {
			var dataCenter = $.hive.getDataCenterIntance();
			dataCenter.postWeixinAuthentication({}, function (res) {
				if(res.code == 1000) {
					res = res.result;
					var url = window.location.href;
					signature =  hex_sha1("jsapi_ticket={0}&noncestr={1}&timestamp={2}&url={3}"._format(res.jsapi_ticket, res.noncestr, res.timestamp, url));
					wx.config({
						debug: false,// 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
						appId: res.appid,// 必填，公众号的唯一标识
						timestamp: res.timestamp,// 必填，生成签名的时间戳
						nonceStr: res.noncestr,// 必填，生成签名的随机串
						signature: signature,// 必填，签名，见附录1
						jsApiList: ["scanQRCode", "hideOptionMenu", "hideMenuItems", "hideAllNonBaseMenuItem", "getLocations"]// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					});
					this.IsConfig = true;
				}
			}, function (err) {
				alert("error weixin")
				this.IsConfig = false;
			}, this);
		}

	};
})(jQuery);