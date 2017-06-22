(function  ($)  {
	function _switch(adel,deel,cla){
		$(adel).addClass(cla);
		$(deel).removeClass(cla);
	}

	$(document).ready(function () {
		var showSingleMessage = false;
		var currentMessageId = null;

		if(window.location.href.indexOf("?message_id") > -1) {
			currentMessageId = window.location.href.split('?message_id=')[1];
			showSingleMessage = true;
		}

		var options = $.hive.getCurrentPageInfo('body-home-inbox');

		$.hive.init(options, function () {
	  		function Inbox () {
  				this.dataCenter = $.hive.getDataCenterIntance();
  				this.currentSelectedMsgIds = [];
  				this.isCreating = false;
  				self = this;
  				this.resetSelectedMsgIds = function () {
  				 	this.currentSelectedMsgIds = []
  				};

  				this.addItemToSelectedMsgIds = function (item) {
  				 	if($.inArray(item, this.currentSelectedMsgIds) == -1) {
  				 		this.currentSelectedMsgIds.push(item);
  				 	} 
  				 };

  				this.removeOutOfSelectedMsgIds = function (item) {
  				 	if($.inArray(item, this.currentSelectedMsgIds) > -1) {
  				 		this.currentSelectedMsgIds = $.grep(this.currentSelectedMsgIds, function (itemValue, index) {
  				 			return itemValue != item;
  				 		});
  				 	} 
  				};
			  }

	      $.extend(Inbox.prototype , {
       		init: function () {
       			this.initEventsBinding();

       			if(showSingleMessage) {
       				this.getSpecificMessage(currentMessageId);
       			} else {
       				this.getRecievedMessages();
       			}
       		},

       		getStatusMsg: function(res) {
     				var leng = res.result.messages.length;
     				var $trs = $("#hive-receive-msg-table").find("tbody").find("tr");

       			for(var l = 0; l < leng; l++ ){
       				if(res.result.reciever_messages[l].status == "un_read") {
	       				$trs.each(function () {
   								if($(this).attr("data-messageid") == res.result.reciever_messages[l].id) {
   									$(this).removeClass("unread");
   								}
   							});
       				}
       			}	
       		},

       		getSpecificMessage: function (messageId) {
       			var self = this;

       			return this.dataCenter.getSpecificMessage(messageId, function(res){
       				var specificSubject = res.result.message.subject;
       				var specificContent = res.result.message.content;
       				var senderName = res.result.sender_message[0].user_full_name;

       				$(".hive-specific-msg .subject span").text(specificSubject);
       				$(".hive-specific-msg .content p").text(specificContent);
       				$(".hive-specific-msg .sendername span").text(senderName);
       				$(".hive-specific-msg").css("display","block");
       				$("table").addClass("hidden");

       				$.each(res.result.reciever_message, function (index, msg) {
       					if(msg.user_id == $.hive.settings.user_id && msg.status == "un_read") {
       						self.markAsRead([messageId]);
       					}
       				});
       			},this.errorCallback,this);
       		},

         	getRecievedMessages : function ()  {
         		var self = this;
         		this.buildRequest(function () {
         			return self.dataCenter.getRecievedMessages(self.getRecievedMessagesSucceed, self.errorCallback, self);
         		});
        	},

          getSentMessages : function () {
            var self = this;

         		this.buildRequest(function () {
         			return self.dataCenter.getSentMessages(self.getSentMessagesSucceed, self.errorCallback, self);
         		});
          },

          errorCallback: function (err) {
          	console.log(err);
          },

          requestCompleted: function () {
         		$.hive.stopPageLoading();
         		this.isCreating = false;
          },

          buildRequest: function (fn) {
           	$.hive.startPageLoading();
           	var request = fn();
           	request.done(this.requestCompleted);
          },

          showSpecificMessage: function(){
           	$(".hive-specific-msg").show();
						var specificMessageId = $(this).attr("data-messageid");
						$(".table").addClass("hidden");
						self.getSpecificMessage(specificMessageId);
          },

          getSentMessagesSucceed: function (res) {
           	var result = this.processDataForRendering(res);
           	var $table = $('#hive-send-msg-table .hive-msg-all-list');
      			$table.empty();
            $table.setTemplateElement("hive-msg-listItem-tmpl");
            $table.processTemplate(result);
           	if(res.result.messages.length == 0){
       				$("#hive-send-msg-table .btn-group .blackblue, #hive-send-msg-table .checker ").addClass("hidden");
         		} else {
	           	$table.find("tr").click(this.showSpecificMessage);
	           	$table.find("tr").find(".mail-checkbox").click(this.handleItemCheckbox);
         		}
          },

		      getRecievedMessagesSucceed: function (res) {
            var result = this.processDataForRendering(res);

           	var $table = $('#hive-receive-msg-table .hive-msg-all-list');
	      		$table.empty();
            $table.setTemplateElement("hive-msg-listItem-tmpl");
            $table.processTemplate(result);

            self.getStatusMsg(res);

            if(res.result.messages.length == 0) {
         			$("#hive-receive-msg-table .btn-group .blackblue, #hive-receive-msg-table .checker").addClass("hidden");
         		} else {
       				$table.find("tr").click(this.showSpecificMessage);
							$table.find("tr").find(".mail-checkbox").click(this.handleItemCheckbox);
         		}
          },

   				handleItemCheckbox: function (e) {
   					if($(this).attr("checked")){
   						$(this).parents("span").addClass("checked");
   					}else{
   						$(this).parents("span").removeClass("checked");
   					}
						if(this.checked) {
							self.addItemToSelectedMsgIds(this.value);
						} else {
							self.removeOutOfSelectedMsgIds(this.value);
						}
						if(e.stopPropagation) {
							e.stopPropagation();
						}
					},

        	processDataForRendering: function (res) {
       			var leng = res.result.messages.length;
       			this.initPagination(leng);
       			var data = { items: [] };

						if(leng > 0) {
							for(var i = 0; i < leng; i++) {
								var msg = res.result.messages[i];
								var senderFullName = "";
								var status = 1;

								for(var j = 0; j < leng; j++) {
									if(!res.result.sender_messages[j]) {
										continue;
									}
									
									if(msg.sender_message_id == res.result.sender_messages[j].id) {
										senderFullName = res.result.sender_messages[j].user_full_name;
										break;
									}
								}

								for(var k = 0; k < leng; k++) {
									if(msg.id == res.result.reciever_messages[k].id) {
										status = res.result.reciever_messages[k].status;
										break;
									}
								}

								data.items.push({
									userName: senderFullName,
									created: moment(msg.created_at).format('YYYY-MM-DD'),
									subject: msg.subject,
									id: msg.id,
									recieverMessageRead: status == "read"
								});

								data.items.sort(function (left, right) {
									return left.created > right.created;
								});
							}
						}

						return data;
     			},

         	createMessage: function(data) {
         		var self = this;
         		this.buildRequest(function () {
        			self.isCreating =true;
         			
         			return	self.dataCenter.createMessage({ message: data }, function (res) {
     						//TODO:
           			$('.inbox-nav .sent').trigger("click");
           		}, self.errorCallback, self);
         		});
         	},

         	deleteMsgs: function (msgIds, dataType) {
       			var self = this;
         		this.buildRequest(function () {
         			return  self.dataCenter.deleteMessages({ data_type: dataType, message_ids: msgIds}, function (res) {
       					//TODO: handle the response type from back-end

         				switch(dataType) {
         					case "sent":
         						$.each(msgIds, function (index, item) {
         							$("#hive-send-msg-table").find("tbody").find("tr").each(function () {
         								if($(this).attr("data-messageid") == item) {
         									$(this).remove();
         								}
         							});
         						});
         					break;

         					case "recieved":
           					$.each(msgIds, function (index, item) {
         							$("#hive-receive-msg-table").find("tbody").find("tr").each(function () {
         								if($(this).attr("data-messageid") == item) {
         									$(this).remove();
         								}
         							});
         						});
         					break;
         				}
         			}, self.errorCallback, self);
         		});
         	},

         	markAsRead: function (msgIds) {
         		var self = this;

         		this.buildRequest(function () {
         			return self.dataCenter.markMessagesAsRead({ message_ids: msgIds }, function (res) {
         				//TODO:
       					$.each(msgIds, function (index, item) {
     							$("#hive-receive-msg-table").find("tbody").find("tr").each(function () {
     								if($(this).attr("data-messageid") == item) {
     									$(this).removeClass("unread");
     								}
     							});
     						});
         			}, self.errorCallback, self);
         		});
         	},

         	initPagination: function (leng) {
						var pagenum = 1;
						if(leng / 30 <= 1) {
							pagenum = 1;
						} else  {
							pagenum = Math.ceil(leng / 30);
						}
						$(".pagenum").text(pagenum);
						$(".Rmsg-total").text(leng);
         	},

         	initEventsBinding: function () {
         		var self = this;
						$('.inbox-nav .compose-btn').click(function() {
							_switch(".table",".inbox-newform","hidden");
							$(".hive-specific-msg").hide();
						});

						$('.inbox-nav .inbox').click(function() {
							_switch(".inbox-newform","table","hidden");
							_switch(this,".inbox-nav .sent","active");
							_switch("#hive-send-msg-table","#hive-receive-msg-table","hidden");
							$("#hive-receive-msg-table").show();
							$(".hive-specific-msg").hide();
							$("table thead span").removeClass("checked");
							$("table thead input[type=checkbox]").removeAttr("checked");
							self.getRecievedMessages();
						});

						$('.inbox-nav .sent').click(function() {
							_switch(this,".inbox-nav .inbox","active");
							_switch("#hive-receive-msg-table","#hive-send-msg-table","hidden");
							$("#hive-receive-msg-table").hide();
							_switch(".inbox-newform",".table","hidden");
							$(".hive-specific-msg").hide();
							$("table thead span").removeClass("checked");
							$("table thead input[type=checkbox]").removeAttr("checked");
							self.getSentMessages();
						});
						$('.btn-group').click(function() {
							_switch(this, ".open");
						});

						var handleSelectedAllCheckbox = function ($table) {
							$table.find(".mail-checkbox").attr("checked", this.checked);
							var $spans = $table.find(".hive-msg-all-list  span");

              if( $spans.hasClass("checked")) {
					      $spans.removeClass("checked");
					    } else {
					      $spans.addClass("checked");
					    }

							self.resetSelectedMsgIds();
				      if(this.checked) {
				       	var values = [];
					       $table.find(".hive-msg-all-list ").find("input").each(function () {
					       	if($(this).is(":checked")) {
					       		self.addItemToSelectedMsgIds(this.value);
					       	}
					      });
				      } 
						};

						var hanldeMarkAsDeleteEvent = function () {
							if(self.currentSelectedMsgIds.length == 0) {
								return false;
							}
							var dataType = $(this).attr("data-type");
							self.deleteMsgs(self.currentSelectedMsgIds, dataType);
						};

						var handleMarkAsReadEvent = function () {
							if(self.currentSelectedMsgIds.length == 0) {
								return false;
							}
							self.markAsRead(self.currentSelectedMsgIds);
						};

						var $receivedTable = $("#hive-receive-msg-table");
						$receivedTable.find(".mail-group-checkbox").click(function () {
							handleSelectedAllCheckbox.apply(this, [$receivedTable] );
						});
						$receivedTable.find(".del").click(hanldeMarkAsDeleteEvent);

						var $sentTable = $("#hive-send-msg-table");
						$sentTable.find(".mail-group-checkbox").click(function () {
							handleSelectedAllCheckbox.apply(this, [$sentTable] );
						});
						$sentTable.find(".del").click(hanldeMarkAsDeleteEvent);
						$receivedTable.find(".read").click(handleMarkAsReadEvent);
          	
          	$("#hive-inbox-createMsgForm").bind({
          		"submit": function () {
          			if(self.isCreating) 
          			{
          				return false;
          			}

					      var recieveName = $(".controls input[name=usernames]").val();
            		var subject = $(".controls input[name=subject]").val();
            		var content = $(".inbox-form-group textarea[name=message]").val();

          			if( self.checkEmpty(recieveName) ||  self.checkEmpty(subject) || self.checkEmpty(content)) {
          				alert("所填内容不能为空!");
          				return false;
          			} 

        				window.setTimeout(function () {
        					self.createMessage({
            				subject: subject,
            				content: content,
            				recievers: recieveName.split(';')
            			});
        				}, 0);
        				$(".inbox-content input , .inbox-content textarea").val("");
          			return false;
          		}
          	});
         	},

         	checkEmpty: function (value) {
         		if(!value) {
         			return true;
         		}

         		return  value .replace(/(^\s*)|(\s*$)/g, "") == "" ;
        	}
				});

			var currentPage = new Inbox();
			currentPage.init();
		});
	});
})(jQuery);
