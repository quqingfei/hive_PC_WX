(function ($) {
	$(window.document).ready(function () {
		function wx_message() {

			this.messages = [];
			this.isSend = false;
			this.content = "";
			this.name = "";
			this.subject = "";
			$.hive.buildObservable(this);
			this.init();

		}

		$.extend(wx_message.prototype, {

			dataCenter: $.hive.getDataCenterIntance(),

			init: function () {

				var self = this;
				this.initialIcon();
				if($('.wx-message').length > 0) {
					$('.wx-searchInput').hide();
				}
				$('li.clearfix input, .wx-message-sender').live('click', function (e) {
					self.checkBoxClick(this, e);
				});
				$('#wx-message-isRead').click(function () {
					self.markMessagesAsRead();
				});
				$('#wx-message-delete').click(function () {
					self.deleteClickEvent();
				});
				$('#hive-wx-messageSendBtn').click(function () {
					self.seedMessageEvent();
				});
				$(window.document).on('click', 'li.clearfix', function (e) {
					self.messagesClickEvent(this, e);
				});

			},

			initialIcon: function () {
				var self = this;
				var icon = $('.hive-weixin-topbar i.pull-right');
				icon.eq(2).addClass('showInbox').attr('data-type', 'inBox');
				icon.eq(1).addClass('showOutbox').attr('data-type', 'outBox');
				icon.eq(0).addClass('showNewMessage').attr('data-type', 'newMessage');
				icon.click(function () {
					self.navClick(this);
				});
				icon.eq(2).trigger('click');
			},

			messagesClickEvent: function (self, e) {

				var messageId = $(self).attr('data-messageid');
				$('.wx-messageContent').fadeIn();
				this.dataCenter.getSpecificMessage(messageId, function (res) {

					if(res.code == 1000) {
						console.log(res);
						var res = res.result;
						var type = $('.wx-message-body ul').attr('data-type');
						this.subject(res.message.subject);
						this.content(res.message.content);
						this.isSend((type == "sent") ? true : false);
						this.name(this.isSend() ? res.reciever_message[0].user_full_name : res.sender_message[0].user_full_name);
					}

				}, this.errorAjax, this);

			},

			seedMessageEvent: function () {

				var data = {};
				var isFault = false;
				var arr = $('#wx-messageForm').serializeArray();
				$.each(arr, function(index, item){
					if(!item.value) {
						console.log(item.value);
						isFault = true;
					}
					data[item.name] = item.value;
				});
				data.recievers = data.recievers.split(';');
				if(isFault) {
					alert("所填内容不能为空!");
					return;
				}
				this.dataCenter.createMessage({message: data}, function (res) {

					if(res.code == 1000) {
						alert("邮件发送成功.");
						$('#wx-messageForm *').val("");
					}
					else {
						alert("邮件发送失败.");
					}

				}, this.errorAjax, this);
			},

			navClick: function (self) {

				if($(self).parent('li').length) {
					$('.navbar-nav .pull-right').removeClass('selectIcon');
					$(self).addClass('selectIcon');
				}
				else {
					$(self).addClass('selectIcon').siblings('.pull-right').removeClass('selectIcon');
				}
				$('.messageSendBtn').fadeOut();
				$('.wx-newMessage').fadeOut();
				$('#hive-wx-messageBtn').fadeOut();
				$('.wx-messageContent').fadeOut();
				switch($(self).attr('data-type')) {
					case "inBox":
						$('.wx-message-body ul').attr('data-type', 'recieved');
						this.getRecievedMessages();
					break;
					case "outBox":
						$('.wx-message-body ul').attr('data-type', 'sent');
						this.getSentMessages();
					break;
					case "newMessage":
						$('.messageSendBtn').fadeIn();
						$('.wx-newMessage').fadeIn();
					break;
				}

			},

			checkBoxClick: function (self, e) {

				var inputObj = $(self).siblings('input').get(0);
				if(inputObj) {
					inputObj.checked = !inputObj.checked;
				}
				$(self).parent('li').toggleClass('isSelect');
				if($('.isSelect').length) {
					$('#hive-wx-messageBtn').fadeIn();
				}
				else {
					$('#hive-wx-messageBtn').fadeOut();
				}
				e.stopPropagation();

			},

			getSelectDevicesId: function () {
				var deviceIds = [];
				$('.isSelect').each(function (index, item) {
					deviceIds.push(parseInt($(item).attr('data-messageid')));
				});
				return deviceIds;
			},

			deleteClickEvent: function () {

				var msgIds = this.getSelectDevicesId();
				var type = $('.wx-message ul').attr('data-type');
				this.dataCenter.deleteMessages({data_type: type, message_ids: msgIds}, function (res) {

					if(res.code == 1000) {
						$('.isSelect').fadeOut("normal", function () {
							$('.isSelect').remove();
							$('#hive-wx-messageBtn').fadeOut();
						});
					}

				}, this.errorAjax, this);
			},

			markMessagesAsRead: function () {
				
				this.dataCenter.markMessagesAsRead({message_ids: this.getSelectDevicesId()}, function (res) {

					if(res.code == 1000) {
						if(res.result) {
							$('.isSelect').addClass('isRead');
							$('.isSelect input').trigger('click');
						}
					}

				}, this.errorAjax, this);
			},

			getRecievedMessages: function () {

				this.dataCenter.getRecievedMessages(function (res) {

					if(res.code == 1000) {
						this.processDataForRendering(res);
					}

				}, this.errorAjax, this);

			},

			getSentMessages: function () {

				this.dataCenter.getSentMessages(function (res) {

					if(res.code == 1000) {
						this.processDataForRendering(res);
					}

				}, this.errorAjax, this);

			},

			errorAjax: function (err) {
				console.log(err);
			},

			processDataForRendering: function (res) {
				while(this.messages.pop()) {}
   			var leng = res.result.messages.length;
   			if(leng == 0) {
   				window.setTimeout(function () {
   					alert('暂无邮件');
   				}, 200);
   				return;
   			}
   			res = res.result;
				if(leng > 0) {
					for(var i = 0; i < leng; i++) {
						var msg = res.messages[i];
						var fullName = "";
						var status = 1;
						var sendType = $('.wx-message-body ul').attr('data-type') == "sent";
						for(var j = 0; j < leng; j++) {
							if(!res.sender_messages[j]) {
								continue;
							}
							
							if(msg.sender_message_id == (sendType ? res.reciever_messages[j].id : res.sender_messages[j].id)) {
								fullName = (sendType ? res.reciever_messages[j].user_full_name : res.sender_messages[j].user_full_name);
								break;
							}
						}

						for(var k = 0; k < leng; k++) {
							if(msg.id == (sendType ? res.sender_messages[j].id : res.reciever_messages[j].id)) {
								status = (sendType ? res.sender_messages[j].status : res.reciever_messages[j].status);
								break;
							}
						}
						var date = new Date(msg.created_at);
						var year = this.formatDateNumber(date.getFullYear());
						var month = this.formatDateNumber(date.getMonth() + 1);
						var day = this.formatDateNumber(date.getDate());
						this.messages.push({
							messageName: fullName,
							messageTime: "{0}-{1}-{2}"._format(year, month, day),
							messageTitle: msg.subject,
							id: msg.id,
							recieverMessageRead: status == "read" || status == "trash",
							sendType: sendType
						});
					}
				}
 			},

 			formatDateNumber: function (num) {
 				return (num > 9) ? num : "0"+num;
 			}

		});

		var obj = document.getElementById('wx-message');
		if(obj) {
			ko.applyBindings(new wx_message(), obj);
		}

	});
})(jQuery);