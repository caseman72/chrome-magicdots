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

		// methods
		addCanvas: function() {
			var opts = $.todot;

			// add canvas to body or ...
			var canvas = $("body")
				.append("<canvas style='margin: 0.5em' width='"+ opts.width +"' height='"+ opts.height +"'></canvas>")
				.find("canvas:last");

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
		},
		reset: function() {
			// reset
			localStorage["magicdots"] = 0;

			// remove all canvases
			$("body").find("canvas").remove();

			// reset all
			$.todot.context = null;
			$.todot.dotnum = 0;
			$.todot.hournum = 0;
			$.addCanvas();
		},
		addDot: function(skip) {
			var opts = $.todot;

			// real click by user
			if (skip !== true) {
				// update local storage
				var dots = localStorage["magicdots"] = parseInt(localStorage["magicdots"] || 0, 10) + 1;
				chrome.extension.sendMessage({type: "MagicDotAdded", dots: dots});
			}

			// logic code
			var dotnum = opts.dotnum;
			var offset = 3*opts.thickness;
			var context = opts.context;

			// dots
			if (!context || dotnum > 9) {
				// new magic dots
				opts.addCanvas();
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
		body.addClass("magic-init");

		// on show click the add button until we are back
		var dots = parseInt(localStorage["magicdots"] || 0, 10);
		for (var i=0; i<dots; i++) {
			$.todot.addDot(true);
		}

		// initally show first canvas
		if (!dots) {
			$.todot.addDot();
		}

		// 2 buttons ...
		$("#magic-reset").on("click", $.todot.reset);
		$("#magic-dot").on("click", $.todot.addDot).focus();
	}
});
