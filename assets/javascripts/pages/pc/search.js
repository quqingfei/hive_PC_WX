$(document).ready(function () {
	var options = $.hive.getCurrentPageInfo('body-home-search');

	$.hive.init(options, function () {
		function Search() {

			this.dataCenter = $.hive.getDataCenterIntance();
			this.selectedProvince = "";
			this.selectedCity = "";

			this._getSearchString = function () {
				var str = decodeURI(decodeURI(window.location.href.split("?search=")[1]));
				$(".hive-search-link input").val(str);
				return str;
			};

			this._getDevicesInfo = function () {

			};

			this._deleteDevice = function (deviceId) {
				this.dataCenter.deleteDevice(deviceId, function (res) {
          if(res.code == 1000) {
            $tr.fadeOut(100);
            $tr.remove();
          }
    		}, function (err) {
    			console.log(err);
    		});
			};

			this._bindTableEvent = function () {
				var self = this;
				$('#hive-search-tbody tr').click(function () {
					$.hive.showDeviceDetails($(this).attr('data-deviceid'));
				});
				$('.hive-search-deleteLink').click(function (e) {
					var deviceId = $(this).parent('tr').attr('data-deviceid');
					bootbox.confirm({  
            buttons: {  
                confirm: {  
                    label: '确定'  
                },  
                cancel: {  
                    label: '取消' 
                }  
            },  
            message: '您确定要删除这个设备？',  
            callback: function(result) {  
                if(result) {
                  self._deleteDevice(deviceId);
                }
            }
          });
					e.stopPropagation();
				});
			};

			this._formatTime = function (data) {
				if(data) {
					var arr = data.split('/');
					return "{0}-{1}-{2}"._format(arr[2], arr[0], arr[1]);
				}
				return "";
			}

			this._initSendData = function () {
				var data = new Object();
				data.province = $('.hive-search-provinceSelect').find('option:selected').text();
				data.city = $('.hive-search-citySelect').find('option:selected').text() ;
				data.province = data.province ? data.province + "省": "";
				data.city = data.city ? data.city + "市" : "";
				data.status = $('.hive-search-statusSelect').val();
				data.begin_time = this._formatTime($('#hive-search-thisDay').val());
				data.end_time = this._formatTime($('#hive-search-thatDay').val());
				data.key = decodeURI(decodeURI(window.location.href.split("?search=")[1]));
				return data;
			}

			this._bindEvent = function () {
				var self = this;
				$("#hive-search-thisDay").datepicker();
				$("#hive-search-thatDay").datepicker();
				$('.hive-search-provinceSelect').change(function () {
					self.renderSelectCity($(this).val())
				});

				$('.hive-search-trigger').change(function () {
					$('#hive-search-tbody').empty();
					self.dataCenter.getSearchDevices(self._initSendData(), function (res) {
						if(res.code == 1000 && res.result.data.devices.length) {
							self._renderTable(res);
						}
					}, function (err) {
						console.log(err);
					}, this);
				});

			};

			this._getSelectString = function () {
				return $(".hive-search-provinceSelect").find('option:selected').text() + $(".hive-search-citySelect").find('option:selected').text();
			}

			this._tableSortRule = function () {

			};

			this._returnNormalData = function (arr, data) {
				return this._checkNull(arr) && data != null ? data : "-";
			};

			this._checkNull = function (data) {
				if(data && data.length) {
					return true;
				}
				return false;
			};

			this._initInsertData = function (devices) {
				var data = [];
				var self = this;
				$.each(devices, function (index, item) {
					var obj = new Object();
					obj.name = item.name;
					obj.id = item.id;
					obj.admin = "-";
					obj.temp = self._returnNormalData(item.humitures, item.humitures[0].temperature);
					obj.hum = self._returnNormalData(item.humitures, item.humitures[0].humidity);
					obj.shake = self._returnNormalData(item.shakes, item.shakes[0].shake);
					obj.location = "{0}{1}{2}{3}"._format(item.location.province || "", item.location.city || "", item.location.street || "", item.location.downtown || "");
					if(!$.trim(obj.location)) {
						obj.location = "-";
					} 
					obj.energy = (item.energy && item.energy.energy) ? item.energy.energy : "-";
					obj.image = (self._checkNull(item.pictures) && item.pictures[0].path) ? "有" : "无";
					obj.network = $.hive.validation.isOutDate(item.updated_at) ? "无连接" : "正常";
					obj.created_at = moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'); 
					data.push(obj);
				});
				return data;
			};

			this.renderDevicesTable = function () {
				var self = this;
				this.dataCenter.getSearchDevices({key: this._getSearchString()}, function (res) {
					if(res.code == 1000 && res.result.data.devices.length) {
						self._renderTable(res);
					}
				}, function (err) {
					console.log(err);
				}, this);
			};

			this._renderTable = function (res) {
				var $table = $('#hive-search-tbody');
				var devices = this._initInsertData(res.result.data.devices);
				$table.setTemplateElement("hive-search-tmpl");
	    	$table.processTemplate({ items: devices });
	    	this._bindTableEvent();
			};

			this.renderSelectCity = function (index) {
				var x = [35]; 
　　　　　　　 x[0]="" ;
　　　　　　　 x[1]=",北京,东城,西城,崇文,宣武,朝阳,丰台,石景山,海淀,门头沟,房山,通州,顺义,昌平,大兴,平谷,怀柔,密云,延庆" ;
　　　　　　　 x[2]=",上海,黄浦,卢湾,徐汇,长宁,静安,普陀,闸北,虹口,杨浦,闵行,宝山,嘉定,浦东,金山,松江,青浦,南汇,奉贤,崇明" ;
　　　　　　　 x[3]=",天津,和平,东丽,河东,西青,河西,津南,南开,北辰,河北,武清,红挢,塘沽,汉沽,大港,宁河,静海,宝坻,蓟县,大邱庄"; 
　　　　　　　 x[4]=",重庆,万州,涪陵,渝中,大渡口,江北,沙坪坝,九龙坡,南岸,北碚,万盛,双挢,渝北,巴南,黔江,长寿,綦江,潼南,铜梁,大足,荣昌,壁山,梁平,城口,丰都,垫江,武隆,忠县,开县,云阳,奉节,巫山,巫溪,石柱,秀山,酉阳,彭水,江津,合川,永川,南川"; 
　　　　　　　 x[5]=",石家庄,邯郸,邢台,保定,张家口,承德,廊坊,唐山,秦皇岛,沧州,衡水"; 
　　　　　　　 x[6]=",太原,大同,阳泉,长治,晋城,朔州,吕梁,忻州,晋中,临汾,运城"; 
　　　　　　　 x[7]=",呼和浩特,包头,乌海,赤峰,呼伦贝尔盟,阿拉善盟,哲里木盟,兴安盟,乌兰察布盟,锡林郭勒盟,巴彦淖尔盟,伊克昭盟" ;
　　　　　　　 x[8]=",沈阳,大连,鞍山,抚顺,本溪,丹东,锦州,营口,阜新,辽阳,盘锦,铁岭,朝阳,葫芦岛" ;
　　　　　　　 x[9]=",长春,吉林,四平,辽源,通化,白山,松原,白城,延边" ;
　　　　　　　 x[10]=",哈尔滨,齐齐哈尔,牡丹江,佳木斯,大庆,绥化,鹤岗,鸡西,黑河,双鸭山,伊春,七台河,大兴安岭" ;
　　　　　　　 x[11]=",南京,镇江,苏州,南通,扬州,盐城,徐州,连云港,常州,无锡,宿迁,泰州,淮安" ;
　　　　　　　 x[12]=",杭州,宁波,温州,嘉兴,湖州,绍兴,金华,衢州,舟山,台州,丽水" ;
　　　　　　　 x[13]=",合肥,芜湖,蚌埠,马鞍山,淮北,铜陵,安庆,黄山,滁州,宿州,池州,淮南,巢湖,阜阳,六安,宣城,亳州" ;
　　　　　　　 x[14]=",福州,厦门,莆田,三明,泉州,漳州,南平,龙岩,宁德" ;
　　　　　　　 x[15]=",南昌市,景德镇,九江,鹰潭,萍乡,新馀,赣州,吉安,宜春,抚州,上饶" ;
　　　　　　　 x[16]=",济南,青岛,淄博,枣庄,东营,烟台,潍坊,济宁,泰安,威海,日照,莱芜,临沂,德州,聊城,滨州,菏泽,博兴" ;
　　　　　　　 x[17]=",郑州,开封,洛阳,平顶山,安阳,鹤壁,新乡,焦作,濮阳,许昌,漯河,三门峡,南阳,商丘,信阳,周口,驻马店,济源" ;
　　　　　　　 x[18]=",武汉,宜昌,荆州,襄樊,黄石,荆门,黄冈,十堰,恩施,潜江,天门,仙桃,随州,咸宁,孝感,鄂州" ;
　　　　　　　 x[19]=",长沙,常德,株洲,湘潭,衡阳,岳阳,邵阳,益阳,娄底,怀化,郴州,永州,湘西,张家界" ;
　　　　　　　 x[20]=",广州,深圳,珠海,汕头,东莞,中山,佛山,韶关,江门,湛江,茂名,肇庆,惠州,梅州,汕尾,河源,阳江,清远,潮州,揭阳,云浮" ;
　　　　　　　 x[21]=",南宁,柳州,桂林,梧州,北海,防城港,钦州,贵港,玉林,南宁地区,柳州地区,贺州,百色,河池" ;
　　　　　　　 x[22]=",海口,三亚" ;
　　　　　　　 x[23]=",成都,绵阳,德阳,自贡,攀枝花,广元,内江,乐山,南充,宜宾,广安,达川,雅安,眉山,甘孜,凉山,泸州" ;
　　　　　　　 x[24]=",贵阳,六盘水,遵义,安顺,铜仁,黔西南,毕节,黔东南,黔南" ;
　　　　　　　 x[25]=",昆明,大理,曲靖,玉溪,昭通,楚雄,红河,文山,思茅,西双版纳,保山,德宏,丽江,怒江,迪庆,临沧" ;
　　　　　　　 x[26]=",拉萨,日喀则,山南,林芝,昌都,阿里,那曲" ;
　　　　　　　 x[27]=",西安,宝鸡,咸阳,铜川,渭南,延安,榆林,汉中,安康,商洛" ;
　　　　　　　 x[28]=",兰州,嘉峪关,金昌,白银,天水,酒泉,张掖,武威,定西,陇南,平凉,庆阳,临夏,甘南" ;
　　　　　　　 x[29]=",银川,石嘴山,吴忠,固原" ;
　　　　　　　 x[30]=",西宁,海东,海南,海北,黄南,玉树,果洛,海西" ;
　　　　　　　 x[31]=",乌鲁木齐,石河子,克拉玛依,伊犁,巴音郭勒,昌吉,克孜勒苏柯尔克孜,博 尔塔拉,吐鲁番,哈密,喀什,和田,阿克苏" ;
　　　　　　　 x[32]=",香港" ;
　　　　　　　 x[33]=",澳门" ;
　　　　　　　 x[34]=",台北,高雄,台中,台南,屏东,南投,云林,新竹,彰化,苗栗,嘉义,花莲,桃园,宜兰,基隆,台东,金门,马祖,澎湖" ;
				$('.hive-search-citySelect').empty();
				$.each(x[index].split(','), function (index, item) {
					$('.hive-search-citySelect').append('<option value="{1}">{0}</option>'._format(item, index));
				});
				$('.hive-search-citySelect option').eq(0).text("请选择");
			};

			this.renderSelectProvince = function () {
				var provinces=",北京,上海,天津,重庆, 河北,山西,内蒙古,辽宁,吉林,黑龙江,江苏,浙江,安徽,福建,江西,山东,河南,湖北,湖南,广东,广西,海南,四川,贵州,云南,西藏,陕西,甘肃,宁夏,青海,新疆,香港,澳门,台湾";
				$.each(provinces.split(','), function (index, item) {
					$('.hive-search-provinceSelect').append($('<option value="{1}">{0}</option>'._format(item, index)));
				});
				$('.hive-search-provinceSelect option').eq(0).text("请选择");
			};
		}

		$.extend(Search.prototype, {
			init: function () {
				this.renderDevicesTable();
				this.renderSelectProvince();
				this._bindEvent();
			}
		});

		var currentSearchPage = new Search();
		currentSearchPage.init();
	});
});