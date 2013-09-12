chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.type == "MagicDotAdded") {
		// already running and a new message is in - clear old
		var timeout = parseInt(localStorage["timeout"] || 0, 10);
		if (timeout) {
			clearTimeout(timeout);
		}

		// static values ~ for now
		var notification_opts = {
			type: "basic",
			title: "Magic Dots",
			message: "Good Job! Time to add a dot!",
			iconUrl: "icon-128.png"
		};

		// 5 minutes from now
		var expire = (new Date()).getTime() + (6 * 60E3) - 15E3;

		// function to notify
		var notify = function() {
			if ((new Date()).getTime() < expire) {
				localStorage["timeout"] = setTimeout(notify, 5E3);
			}
			else {
				chrome.notifications.create("magic_dots_"+ msg.dots, notification_opts, function(){});
			}
		};

		// start the process in 5s intervals ~ jic we miss it
		localStorage["timeout"] = setTimeout(notify, 5E3);
	}
});
