$(function() {
	$.todot = {
		color: {
			lines: "#009900", // # 00-FF [red] 00-FF [green] 00-FF [blue]
			text: "#000000"
		},
		height: 100,
		width: 100,
		thickness: 6,
		border: 6,
		padding: 5,
		context: null,
		dotnum: 0,
		hournum: 0,

		formatSeconds: function(secs) {
			secs = parseInt(secs || 0, 10);

			var pad = function(val) {
				return val < 10 ? "0"+val : ""+val;
			};

			var hours = pad(Math.floor(secs / 3600) % 24);
			var minutes = pad(Math.floor(secs / 60) % 60);
			var seconds = pad(secs % 60);

			return [hours, minutes, seconds].join(":");
		},

		// methods
		addCanvas: function(skip) {
			var opts = $.todot;

			// add canvas to body or ...
			var canvas = $("#magic-canvas")
				.find("canvas").remove().end()
				.append("<canvas style='margin: 0.5em' width='"+ opts.width +"' height='"+ opts.height +"'></canvas>")
				.find("canvas");
				
			// init and save to opts
			var context = opts.context = canvas.get(0).getContext("2d");

			// set number values
			opts.dotnum = 0;
			opts.hournum = opts.hournum + 1;

			// white
			context.clearRect(0, 0, opts.width, opts.height);
			context.fillStyle = "#FFFFFF";
			context.fillRect(0, 0, opts.width, opts.height);

			// black
			context.lineWidth = opts.border;
			context.fillStyle = "#000000";
			context.strokeRect(0, 0, opts.width, opts.height);
			context.fill();

			if (skip !== true) {
				localStorage["magictimestart"] = (new Date()).toLocaleTimeString(); 
				localStorage["magictimedot"] = Math.floor((new Date()).getTime() / 1E3);
			}

			// update
			$("#magic-time-start").text(localStorage["magictimestart"]);
			$("#magic-time-since").text(opts.formatSeconds(0));
		},
		reset: function() {
			var opts = $.todot;

			// reset
			localStorage["magicdots"] = 0;

			// reset all
			opts.hournum = 0;
			opts.context = null;
			opts.addCanvas();
		},
		addDot: function(skip) {
			var opts = $.todot;

			// real click by user
			if (skip !== true) {
				// update local storage
				var dots = localStorage["magicdots"] = parseInt(localStorage["magicdots"] || 0, 10) + 1;
				chrome.extension.sendMessage({type: "MagicDotAdded", dots: dots});

				// add title to button
				var lastdot = localStorage["lastdot"] = (new Date()).toLocaleTimeString();
				localStorage["magictimedot"] = Math.floor((new Date()).getTime() / 1E3);

				$("body,button,canvas,div").attr("title", lastdot);
				$("#magic-time-since").text(opts.formatSeconds(0));
			}

			// logic code
			var dotnum = opts.dotnum;
			var offset = 3*opts.thickness;
			var context = opts.context;

			// dots
			if (!context || dotnum > 9) {
				// new magic dots
				opts.addCanvas(skip);
			}
			else {
				if (dotnum < 4) {
					var x = dotnum < 2 ? opts.padding + offset : opts.width - opts.padding - offset;
					var y = dotnum ==0 || dotnum == 3 ? opts.padding + offset : opts.height - opts.padding - offset;

					context.beginPath();
					context.fillStyle = opts.color.lines;
					context.arc(x, y, opts.thickness, 0, Math.PI * 2, true);
					context.closePath();
					context.fill();
				}

				// lines
				else {
					var sline = dotnum % 4;
					var sx = sline < 2 ? opts.padding + offset : opts.width - opts.padding - offset;
					var sy = sline == 0 || sline == 3 ? opts.padding + offset : opts.height - opts.padding - offset;

					var eline = (sline + (dotnum > 7 ? 2 : 1)) % 4
					var ex = eline < 2 ? opts.padding + offset : opts.width - opts.padding - offset;
					var ey = eline == 0 || eline == 3 ? opts.padding + offset : opts.height - opts.padding - offset;


					context.beginPath();
					context.strokeStyle = opts.color.lines;
					context.lineWidth = opts.thickness;
					context.moveTo(sx, sy);
					context.lineTo(ex, ey);
					context.closePath();
					context.stroke()

					if (dotnum == 9) {
						context.fillStyle = opts.color.text;
						context.font= "bold 48px Courier New";
						context.fillText(""+opts.hournum, (opts.hournum > 9 ? 21 : 36), 64);
					}
				}

				// update dotnum
				opts.dotnum = opts.dotnum + 1;
			}
		}
	};

	var body = $("body");
	if (!body.hasClass("magic-init")) {
		var opts = $.todot;

		body.addClass("magic-init");

		// on show click the add button until we are back
		var dots = parseInt(localStorage["magicdots"] || 0, 10);
		for (var i=0; i<dots; i++) {
			opts.addDot(true);
		}

		// 2 buttons ...
		$("#magic-reset").on("click", opts.reset);
		$("#magic-dot").on("click", opts.addDot).focus();
		$("body,button,canvas,div").attr("title", localStorage["lastdot"] || "");
		$("#magic-time-start").text(localStorage["magictimestart"] || "");

		// time since
		var updateTime = function() {
			var formatSeconds = $.todot.formatSeconds;
			var lastdot = parseInt(localStorage["magictimedot"] || 0, 10);
			var nowdot = Math.floor((new Date()).getTime() / 1E3);

			if (lastdot && nowdot > lastdot) {
				$("#magic-time-since").text(formatSeconds(nowdot - lastdot));
			}
			else {
				$("#magic-time-since").text("00:00:00");
			}

			setTimeout(updateTime, 5E2);
		};
		updateTime();
	}
});
