$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-group');

  $.hive.init(options, function () {
    var pageType = $.hive.menuBar.parseGroupPageUrl();

    function Group() {
      this.group = null;
      this.groups = null;
      this.devices = null;
      this.total = 0;
      this.colorUsedIndex = 0;
      this.selectedDevices = [];
      this.groupAction = "new";
      this.currentEditGroupId = null;
      var self = this;

      this.addSelectdDevices = function (value) {
        this.selectedDevices.push(value);

        $("#hive-devices-selected-display").find("span").text(this.selectedDevices.length);
      };

      this.resetSelectedDevices = function () {
        this.selectedDevices = [];
        $("#hive-devices-selected-display").find("span").text(this.selectedDevices.length);
      };

      this.replaceSelectedDevices = function (newArr) {
        this.selectedDevices = newArr;
        $("#hive-devices-selected-display").find("span").text(this.selectedDevices.length);
      };

      this.parseDevicePercent = function (group, color) {
        group.devices = group.device_ids ? group.device_ids : [];
        var temp = [];
        $.each(group.devices, function (index, d_id) {
          temp.push(parseInt(d_id));
        });
        group.devices = temp;
        group.num = group.devices.length;
        group.percent = (group.num == 0 ? 0 : (group.num / this.total) * 100).toFixed(2);
        group.color = color;
      };

      this.refreshGroup = function (group) {
        var specificGroupElem = $("#hive-group-id-" + group.id);
        specificGroupElem.find(".hive-single-group-name").text(group.name);
        specificGroupElem.find(".hive-single-group-devices").text("{0} ({1}%)"._format(group.num, group.percent));
        specificGroupElem.find(".hive-single-group-managerName").text(group.manager.full_name);
        specificGroupElem.find(".hive-single-group-managerPhone").text(group.manager.phone);
        specificGroupElem.find(".hive-single-group-description").text(group.description);
      };

      this.fillGroupForm = function (group) {
        $("#hive-group-newForm-groupName").val(group.name);
        $("#hive-group-newForm-description").val(group.description);
        $("#hive-group-newForm-managerName").val(group.manager.name);
        $("#hive-group-newForm-managerPwd").val();
        $("#hive-group-newForm-managerFullName").val(group.manager.full_name);
        $("#hive-group-newForm-managerPhone").val(group.manager.phone);
      }

      this.createAssignListitem = function (group, index) {
        var time = (new Date()).getTime() + index;
        var css_class = "hive-table-radomLabel-" + time;
        $("<label id='hive-assign-gList-label-" + group.id + "' class='"+ css_class + "'><i class='fa fa-stop'></i>&nbsp;<a data-id="+ group.id +" href=\"javascript:void(0);\">" + group.name + "</a></label>").appendTo("#hive-assign-gList");
        $("<style type='text/css'>." + css_class+ " .fa-stop:before{ color: " + group.color + ";}</style>").appendTo("body");
      };

      this.hideGroupSection = pageType.toLowerCase() != "all";

      $('#hive-device-form').validate({
        debug: true,
        rules: {
            "hive-group-newForm-groupName": {
              required: true
            },
            "hive-group-newForm-description": {

            },
            "hive-group-newForm-managerName": {
              required: true
            },
            "hive-group-newForm-managerPwd": {
              required: true,
              pwd_format: true
            },
            "hive-group-newForm-managerFullName": {
              required: true
            },
            "hive-group-newForm-managerPhone": {
              required: true,
              cell_phone_format: true
            }
        },
        messages: {
            "hive-group-newForm-groupName": {
              required: '必填'
            },
            "hive-group-newForm-description": {

            },
            "hive-group-newForm-managerName": {
              required: '必填'
            },
            "hive-group-newForm-managerPwd": {
              required: '必填',
              pwd_format: "请输入长度在6～25之间，并且至少包含一个数字、一个大写或小写字母的密码！"
            },
            "hive-group-newForm-managerFullName": {
              required: '必填'
            },
            "hive-group-newForm-managerPhone": {
              required: '必填',
              cell_phone_format: "手机号码格式不对！"
            }
        },

        highlight: function (element) {
            $(element).closest(".input-icon").addClass("has-error");
        },

        success: function(label) {
           $(label).closest(".input-icon").removeClass("has-error");
           $(label).closest(".input-icon").find("i").attr("title", "").removeClass("fa-times");
           $(label).remove();
        },

        errorPlacement: function(error, element) {
            error.addClass("hide");
            error.insertBefore(element);

            (function (el) {
              console.log(error.text());
                window.setTimeout(function () {
                  if($.trim(error.text())!= "")
                    el.closest('.input-icon').find('i').addClass("fa-times").attr("title", error.text());
                });
            })(element);
        }
      });

      this.editGroupEvent = function () {
        var action = $(this).attr("data-action");
        var groupId = $(this).attr("data-groupId");

        if(action == "edit") {
          self.groupAction = "edit";

          $.each(self.groups, function (index, g) {
            if(g.id == groupId) {
              self.currentEditGroupId = groupId;
              self.fillGroupForm(g);
              $("#hive-group-list").fadeOut(500);
              $(".hive-group-newForm").fadeIn(500);
            }
          });
        }

        if (action == "delete") {
          bootbox.confirm({  
            buttons: {  
                confirm: {  
                    label: '确定'  
                },  
                cancel: {  
                    label: '取消' 
                }  
            },  
            message: '您确定要删除这个设备组吗？',  
            callback: function(result) {  
              if(result) {
                self.deleteGroup(groupId);
              }
            }
          });
        }
      };

      this.emptyGroupForm = function () {
        $(".hive-group-newForm").find("input[type=text]").val("");
        $(".hive-group-newForm").find("input[type=password]").val("");
      };
    }

    $.extend(Group.prototype, {
      init: function () {
        this.showPageSectionByPageType();
        this.dataCenter = $.hive.getDataCenterIntance();
        this.bindEvent();
        this.getData();
      },

      showPageSectionByPageType: function () {
        if(!this.hideGroupSection) {
          $(".hive-group-section").removeClass("hide");
          $(".table-footer").removeClass("hide");
        }
      },

      getData: function () {
        var self = this;
        var getDevicesDeferred = $.Deferred(function (task) {
          self.getDevices(task);
        }).promise();
        var getGroupsDeferred = $.Deferred(function (task) {
          if(self.hideGroupSection) {
            self.groups = [];
            self.getGroup(task);
          } else {
            self.getGroups(task);
          }
        }).promise();

        $.hive.startPageLoading();
        $.when.apply($, [getGroupsDeferred, getDevicesDeferred]).done(function () {
          if(!self.hideGroupSection) {
            var groupsData = [];

            $.each(self.groups, function (index, group) {
              self.parseDevicePercent(group, CSS_COLOR_NAMES[self.colorUsedIndex]);
              self.colorUsedIndex++;

              groupsData.push(group);
            });

            self.groups = groupsData;
            self.renderGroups(self.groups);
          }

          self.processData(self.devices);
          self.renderTable(self.devices);

          $.hive.stopPageLoading();
        });
      },

      getGroups: function (task) {
        this.dataCenter.getGroups(function (res) {
          this.groups = res.result;
          task.resolve(res);
        }, function (err) {
          console.log(err);
          task.reject();
        }, this);
      },

      getGroup: function (task) {
        this.dataCenter.getGroup(pageType, function (res) {
          this.group = res.result;
          if (this.group) {
            this.deviceIdsOfCurrentGroup = this.group.device_ids;
          }
          
          task.resolve([]);
        }, function (err) {
          console.log(err);
          task.reject();
        }, this);
      },

      getDevices: function (task) {
        this.dataCenter.getAllDevicesLatestData("all", function (res) {
          this.devices = res.result.data.devices;
          this.total = res.result.data.total;
          task.resolve(res);
        }, function(err) {
          console.log(err);
          task.reject();
        }, this);
      },

      renderGroups: function (data) {
        var _data = { items: data };
        var $list = $("#hive-group-list");
        $list.setTemplateElement("hive-group-tmpl");
        $list.processTemplate(_data);

        var self = this;

        $(".grid-cell-editBar").find("a").click(this.editGroupEvent);
      },

      renderTable: function (data) {
        var self = this;
        var _data = { items: data };
        var $tableBody = $("#hive-devices-tbody");
        $tableBody.empty();
        $tableBody.setTemplateElement("hive-devices-tmpl");
        $tableBody.processTemplate(_data);

        $tableBody.find("input").click(function () {
          var _self = this;
          if(!this.disabled) {
            if($.inArray(this.value, self.selectedDevices) == -1) {
              self.addSelectdDevices(this.value);
            } else {
              self.replaceSelectedDevices($.grep(self.selectedDevices, function (item) {
                return _self.value != item;
              }));
            }
          }
        });
        $("#hive-assign-gList").empty();
        $.each(this.groups, function (index, group) {
          self.createAssignListitem(group, index);
        });

        $("#hive-assign-gList").find("a").click(function () {
          if(self.selectedDevices.length > 0) {
            self.assignDevicesToGroup($(this).attr("data-id"), self.selectedDevices);
          }
        });

        $tableBody.find('tr').click(function () {
          $.hive.showDeviceDetails($(this).attr("data-deviceId"));
        });

        $(".hive-devices-deleteLink").click(function (e) {
          var deviceId = $(this).parents("tr").attr("data-deviceId");
          var $tr = $(this).parents("tr");
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
                  self.deleteDevice(deviceId, $tr);
                }
            }
          });
          e.stopPropagation();
        });
        $('.hive-devices-switch').click(function (e) {
          var _self = this;
          var deviceId = $(this).parents("tr").attr("data-deviceId");
          var nowSwith = $(this).attr('data-switch') == "true" ? true : false;

          bootbox.confirm({
            buttons: {  
                confirm: {  
                    label: '确定'  
                },  
                cancel: {  
                    label: '取消' 
                }  
            },  
            message: '您确定要{0}这个设备？'._format(nowSwith ? "关闭" : "开启"),  
            callback: function(result) {
                if(result) {
                  if(nowSwith) {
                    $(_self).text('关');
                    $(_self).attr('data-switch','false');
                  }
                  else {
                    $(_self).text('开');
                    $(_self).attr('data-switch','true');
                  }
                  self.closeDevice(deviceId, nowSwith);
                }
            }
          });
          e.stopPropagation();
        });
        $('[type=checkbox]').click(function (e) {
          e.stopPropagation();
        });
      },

      deleteDevice: function(selectedId, $tr) {

        this.dataCenter.deleteDevice(selectedId, function (res) {
                if(res.code == 1000) {
                    $tr.fadeOut(100);
                    $tr.remove();
                } else {
                    bootbox.alert("删除失败", function () { });
                }
        }, function (err) {
          console.log(err);
        });
      },
      
      closeDevice: function (deviceId, nowswitch) {
        var self = this;
        var data = new Object();
        data.device_id = deviceId;
        data.off = nowswitch;
        this.dataCenter.postSwitchDevices(data, function (res) {
          if (res.code == 1000) {
            console.log(res);
          }
          else {
            self.reduceDevice(deviceId, nowswitch);
            bootbox.alert("修改失败", function () { 
            });
          }
        }, function (err) {
          self.reduceDevice(deviceId, nowswitch);
          bootbox.alert("修改失败", function () { 
          });
          console.log(err);
        }, this);
      },

      reduceDevice: function (deviceId, nowswitch) {
        var $obj = $('tr[data-deviceid={0}] .hive-devices-switch'._format(deviceId));
        if(nowswitch) {
          $obj.text('开');
          $obj.attr('data-switch', 'true');
        }
        else {
          $obj.text('关');
          $obj.attr('data-switch', 'false');
        }
      },

      bindEvent: function () {
        var self = this;

        $("#hive-group-newForm-info").tooltip();
        $(".hive-group-newBtn").click(function () {
          $("#hive-group-list").fadeOut(500);
          $(".hive-group-newForm").fadeIn(500);
          self.groupAction = "new";
          $(".hive-group-newForm").find("input[type=text]").val("");
        });

        $(".hive-group-openBtn").click(function () {
          if(!$("#hive-group-list").is(":visible")) {
            return;
          }

          if($(this).attr("data-status") == "close") {
            $("#hive-group-list"). animate(
              {
                maxHeight: "500px"
              }, 
              1000, 
              function () { 
                $("#hive-group-list").css("max-height", "none");
              });
            $(this).html("&and;展开");
            $(this).attr("data-status", "open");
          } else {
            $("#hive-group-list"). animate(
              {
                maxHeight: "200px"
              }, 
              1000, 
              function () {
              });
            $(this).html("&nu;展开");
            $(this).attr("data-status", "close");
          }
        });

        var $tableBody = $("#hive-devices-tbody");
          $("#hive-select-all").click(function () {
            while(self.selectedDevices.pop()){}
            $tableBody.find("input").each(function (index, input) {
              if(!input.disabled) {
                input.checked = true;
                self.addSelectdDevices(input.value);
              }
            });
          });

          $("#hive-select-cancel").click(function () {
            $tableBody.find("input").each(function (index, input) {
              if(input.checked == true) {
                input.checked = false;
              }
            }); 

            self.resetSelectedDevices();
          });

          $("#hive-group-createBtn").click(function () {
            //TODO: validtion here
            if(!$('#hive-device-form').validate().form()) {
              return;
            }
            var group_name = $("#hive-group-newForm-groupName").val();
            var group_description = $("#hive-group-newForm-description").val();
            var new_userName = $("#hive-group-newForm-managerName").val();
            var new_pwd = $("#hive-group-newForm-managerPwd").val();
            var full_name = $("#hive-group-newForm-managerFullName").val();
            var phone = $("#hive-group-newForm-managerPhone").val();
            var data = {
              group_name: group_name,
              description: group_description,
              user: {
                name: new_userName,
                password: new_pwd,
                full_name: full_name,
                phone: phone
              }
            };

            if(self.groupAction == "new") {
              self.createGroup(data);
            } else {
              self.editGroup(self.currentEditGroupId, data);
            }

            $("#hive-group-cancelBtn").trigger("click");
            self.emptyGroupForm();
          });

          $("#hive-group-cancelBtn").click(function () {
            $("#hive-group-list").fadeIn(500);
            $(".hive-group-newForm").fadeOut(500);
            self.emptyGroupForm();
          });
      },

      editGroup: function (groupId, updated) {
        var self = this;

        this.dataCenter.editGroup(groupId, updated, function (res) {
          var updated_group = res.result;

          $.each(self.groups, function (index, g) {
            if(updated_group.id == g.id) {
              self.parseDevicePercent(updated_group, g.color);
              g = updated_group;
              self.refreshGroup(g);
            }
          });
        }, function (err) {
          console.log(err);
        });
      },

      deleteGroup: function (groupId) {
        this.dataCenter.deleteGroup(groupId, function (res) {
          var $deletedGroup = $("#hive-group-id-" + groupId);
          $deletedGroup.fadeOut(200, function () {
            $deletedGroup.remove();
          });

          $("#hive-assign-gList-label-" + groupId).remove();
        }, function (err) {
          console.log(err);
        });
      },

      createGroup: function (group) {
        var self = this;

        this.dataCenter.createGroup(group, function (res) {
          //TODO: handle the failure
          var g = res.result;
          self.parseDevicePercent(g, CSS_COLOR_NAMES[self.colorUsedIndex++])
          self.groups.push(g);

          var $newGroupContainer = $("<div></div>");
          $newGroupContainer.setTemplateElement("hive-group-tmpl");
          $newGroupContainer.processTemplate({ items: [g] });
          var $newGroup = $newGroupContainer.children();
          $newGroup.appendTo("#hive-group-list");
          $newGroup.find("a").click(self.editGroupEvent);

          self.createAssignListitem(g, 0);
        }, function (err) { 
          console.log(err);
        });
      },

      assignDevicesToGroup: function (groupId, deviceIds) {
        var self = this;
        var group = null;

        $.each(this.groups, function (index, g) {
          if(g.id == groupId) {
            group = g;
          }
        });

        this.dataCenter.assignDevicesToGroup(groupId, deviceIds, function (res) {
          $("#hive-devices-tbody").find("tr").each(function (index, tr) {
            var $tr = $(tr);
            var deviceId = $tr.attr("data-deviceId");
            var input = $tr.find("input")[0];
            if($.inArray(deviceId, deviceIds) != -1) {
              input.disabled = true;

              $tr.find(".groupMarker").css("background-color", group.color).removeClass("hide");
            }

            if(input.checked) {
              input.checked = false;
            }
          });

        self.resetSelectedDevices();
        }, function (err) {
          console.log(err);
        });
      },

      validateData: function (data) {
        return (data === "" || data === null) ? "-" : data;
      },

      processData: function (devices) {
        var self = this;
        var temp_devices = [];
        var validation = $.hive.validation;
        if (this.hideGroupSection && !this.deviceIdsOfCurrentGroup) {
          this.devices = [];
        }

        $.each(devices, function (index, item) {
          if (self.deviceIdsOfCurrentGroup && self.deviceIdsOfCurrentGroup.indexOf(item.id) == -1) {
            return;
          }

          var hasWarning = false;
          var val = $.hive.validation;
          item.noCheckbox = self.hideGroupSection;
          //pic
          if(item.pictures.length > 0  && item.pictures[0].path != "" && !val.isOutDate(item.pictures[0].updated_at)) {
            item.pictureStatus = "有";
            item.picWarn = false;
            item.picturePower = validation.isLowPower(item.pictures[0].power);
          } else {
            item.pictureStatus = "-";
            hasWarning = true;
            item.picWarn = true;
          }

          //location
          item.location.address = (item.location.city || "") + (item.location.downtown || "") + (item.location.street || "");
          if(val.isOutDate(item.location.updated_at) || item.location.address.length == 0) {
            item.location.address = "-";
            item.locationWarn = true;
            hasWarning = true;
          } else {
            item,locationWarn = false;
          }

          //humidity
          if(val.isOutDate(item.humitures[0].updated_at)) {
            hasWarning = true;
            item.humitures[0].humidity = "-";
            item.humidityWarn = true;
          } else {
            item.temperaturePower = validation.isLowPower(item.humitures[0].power);
            if(val.isHumidityWarning(item.humitures[0].humidity)) {
              item.humitures[0].humidity = self.validateData(item.humitures[0].humidity);
              hasWarning = true;
              item.humidityWarn = true;
            } else {
              item.humidityWarn = false;
            }

            if (!item.humitures[0].humidity) {
              item.humitures[0].humidity = "-";
            }
          }
          

          //temp
          if(val.isOutDate(item.humitures[0].updated_at)) {
            hasWarning = true;
            item.humitures[0].temperature = "-";
            item.temperatureWarn = true;
          } else {
            item.temperaturePower = validation.isLowPower(item.humitures[0].power);
            if(val.isTemperatureWarning(item.humitures[0].temperature)) {
              item.humitures[0].temperature = self.validateData(item.humitures[0].temperature);
              hasWarning = true;
              item.temperatureWarn = true;
            } else {
              item.temperatureWarn = false;
            }

            if (!item.humitures[0].temperature) {
              item.humitures[0].temperature = "-";
            }
          }
          
          //shake
          if(val.isOutDate(item.shakes[0].updated_at)) {
            hasWarning = true;
            item.shakes[0].shake = "-";
            item.shakeWarn = true;
          } else {
            if(val.isShakeWarning(item.shakes[0].shake)) {
              item.shakes[0].shake = self.validateData(item.shakes[0].shake);
              item.shakePower = validation.isLowPower(item.shakes[0].power);
              hasWarning = true;
              item.shakeWarn = true;
            } else {
              item.shakeWarn = false;
            }

            if(!item.shakes[0].shake) {
              item.shakes[0].shake = "-";
            }
          }
          

          //energy
          if(val.isOutDate(item.energy.updated_at)) {
            //hasWarning = true;
            item.energy.energy = "-";
            item.energyWarn = true;
          } else {
            if(val.isEnergyWarning(item.energy.energy)) {
              item.energy.energy = self.validateData(item.energy.energy);
              //hasWarning = true;
              item.energyWarn = true;
            } else {
              item.energyWarn = false;
            }
          }
          item.energyWarn = false;

          //ray
          if(val.isOutDate(item.rays[0].updated_at)) {
            hasWarning = true;
            item.rays[0].count = "-";
            item.rayWarn = true;
          } else {
            item.rayPower = validation.isLowPower(item.rays[0].power);
            item.rays[0].count = self.validateData(item.rays[0].count);
            item.rayWarn = false;

            if (!item.rays[0].count) {
              item.rays[0].count = "-";
            }
          }

          item.hasWarning = hasWarning;
          item.networkStatus = (val.isOutDate(item.location.updated_at) 
                                &&
                                val.isOutDate(item.humitures[0].updated_at)
                                &&
                                val.isOutDate(item.shakes[0].updated_at)
                                &&
                                val.isOutDate(item.rays[0].updated_at)) ? '无连接' : '网络正常';

          if(item.networkStatus == "无连接") {
            item.netWorkWarn = true;
          } else {
            item.netWorkWarn = false;
          }

          item.color = "";
          item.switch = true;
          $.each(self.groups, function (g_index, group_item) {
            if($.inArray(item.id, group_item.devices) != -1) {
              item.color = group_item.color;
            }
          });

          temp_devices.push(item);
        });

        this.devices = temp_devices;
      }
    });

    var currentPageObj = new Group();
    currentPageObj.init();
  });
});