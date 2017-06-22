(function  ($) {
	function Notification () {
		this.autoQuery = $.getAutoQuery ({ timeout: 5 * 60 * 1000 });
		this.dataCenter = $.hive.getDataCenterIntance();
		var self = this;

		this.autoQuery.longPolling(function () {
			return self.getNotificationData();
		});

		this.getNotificationData = function () {
			return this.dataCenter.getNotificationData(function (res) {
				var $msgListContainer = $("#hive-topBar-msgList");  //UL
				var leng = res.result.messages.length;
				$(".hive-topBar-msgCenterTotal").text(leng);

				var data = { items: [] };
				if(res.result.messages.length > 0) {
					for(var i = 0; i < res.result.messages.length; i++) {
						var msg = res.result.messages[i];
						var senderFullName = "";

						for(var j = 0; j < res.result.sender_messages.length; j++) {
							if(msg.sender_message_id == res.result.sender_messages[j].id) {
								senderFullName = res.result.sender_messages[j].user_full_name;
								break;
							}
						}

						data.items.push({
							userName: senderFullName,
							created: moment(msg.created_at).format('YYYY-MM-DD'),
							subject: msg.subject,
							content: (msg.content.substring(0, 20) + "..."),
							id: msg.id
						});

						data.items.sort(function (left, right) {
							return left.created > right.created;
						});
					}
				}

	      $msgListContainer.empty();
        	$msgListContainer.setTemplateElement("hive-topBar-msgList-tmpl");
        	$msgListContainer.processTemplate(data);
			}, function (err) {
				console.log(err);
			}, this);
		};

		this.getNotificationData();
	}
	$.hive.notification = new Notification();
})(jQuery);