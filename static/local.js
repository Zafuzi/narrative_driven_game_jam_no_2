document.addEventListener("DOMContentLoaded", dcl => {
	sleepless.globalize();
	init();
})

const DEV = false;

var keys_down = [];

var current_message = 0;

// anything with a visible: 1 will be shown in the messages list in the game
const messages = [
	{
		id: 0,
		title: "URS-1A - Dr. Treace",
		read: 0,
		visible: 0,
		content: `
			<h3>Welcome to URS-1A!</h3>
			<br/>
			<p>Abigail here! Hope you are settling in well. I know the first night down here can be a bit lonely, so I sent you my favorite song. It's not much company, but it's better than nothing!</p>
			<br/>
			<img src="https://media.giphy.com/media/l2JHZ0dIcyFo5UQGQ/giphy.gif">
			<p>See ya around :)</p>
			<br/>
			<em>Abigail Treace</em>
		`
	},
	{
		id: 1,
		title: "URS - AUTOMATED MONITORING",
		read: 0,
		visible: 0,
		content: `
			<h3>Anomaly detected at Station 4</h3>
			<p>Nascetur montes magnis feugiat velit nostra blandit magna eleifend, pharetra fringilla penatibus volutpat nulla mi cubilia, metus tortor a lectus quisque at mus. Suspendisse cum vulputate porta ridiculus venenatis etiam rutrum hac scelerisque platea phasellus posuere, lobortis lacinia curae nullam mauris imperdiet ut dapibus integer lacus. Eu in odio felis feugiat sed tortor viverra dui himenaeos fermentum consequat neque diam montes, mus dignissim blandit ut donec ac condimentum mattis vehicula egestas penatibus sodales varius.</p> <p>Erat per nibh facilisis sociis curae rutrum dui, dictumst mauris sollicitudin iaculis sagittis nullam ornare leo, nascetur luctus purus class pharetra feugiat. Non aliquam tincidunt volutpat per velit, molestie porttitor et habitasse primis, tempor nisl sagittis ante. Hendrerit etiam litora consequat leo torquent congue, mollis cubilia parturient sollicitudin gravida rhoncus suscipit, magna egestas odio fermentum purus.</p>
		`
	},
	{
		id: 2,
		title: "Dr. Carson",
		read: 0,
		visible: 0,
		content: `
			<h3>Station 4</h3>
			<p> Don’t mind the outage in my station. I tripped on those damn cables carrying my lunch back to my workstation. Noodles everywhere. I’ll ask Stacy to clean it up and I’ll get the pumps online in about 10 minutes.</p>
			<p> Regards, </p>
			<p> Dr. Carson </p>
		`
	},
	{
		id: 3,
		title: "URS - AUTOMATED MONITORING",
		read: 0,
		visible: 1,
		content: ` <h3>Anomaly detected at Station 1</h3> `
	}
];


function populate_viewer( content ) {
	let c = Object.assign({}, content[0]);
	if( c ) {
		current_message = c.id;
		if( c.id == 1 ) {
			c.content = `<canvas id="power_game" width=300 height=300></canvas>` + c.content;
			r8_viewer.update( [c], (e, d, i) => {
				power_game();
			})
			return;
		}
		if( c.id == 3 ) {
			c.content = `<canvas id="bar_game" width=300 height=300></canvas>` + c.content;
			r8_viewer.update( [c], (e, d, i) => {
				bar_game();
			})
			return;
		}
		r8_viewer.update( [c] );
	} else {
		r8_viewer.update( c )
	}
}

let r8_message; // message template
var messages_need_update = false;
function render_messages() {
	if( ! r8_message )
		r8_message = rplc8("#message");

  // only update if there are changes
	if( messages_need_update ) {
		messages_need_update = false;
		let a = [];
		messages.filter(a => a.visible).reverse().forEach(m => {
			m.class = m.read ? "message_read" : "";
			m.trim_content = m.content.split("\n")[1];
			if( m.trim_content ) {
				console.log(m.trim_content)
				m.trim_content = m.trim_content.slice(0, 120);
			}
			a.push(m);
		})
		r8_message.update(a, (e, d, i) => {
			e.addEventListener("click", function(ev) {
				d.read = true;
				e.classList.add("message_read");
				populate_viewer( [d] );
			});
		})
	}
}

function start_game() {

	let main_game = document.querySelector("#main_game");
	main_game.classList.remove("hid");
	setTimeout(function() {
		main_game.classList.add("active");
	}, 300);

	render_messages();
	let interval = 2000;
	if( DEV ) { interval = 100; }

	setInterval(function() {
		render_messages();
	}, interval);

	show_message(3, 0);
	show_message(1, 0);
	show_message(0);
}

function show_message(id, timeout) {
	if(DEV) {
		if( ! messages[id] ) return;
		messages[id].visible = 1;
		messages_need_update = true;
	} else {
		setTimeout(function() {
			if( ! messages[id] ) return;
			messages[id].visible = 1;
			messages_need_update = true;
		}, timeout || 1000);
	}
}

let r8_viewer;
function init() {
	r8_viewer = rplc8("#view_message");
		populate_viewer([{title:"", content:""}]);
		let main_menu = document.querySelector("#main_menu");
		let play_button = document.querySelector("#play_button");

	play_button.addEventListener("click", function() {
		main_menu.classList.remove("active");	
		setTimeout(function() {
			main_menu.classList.add("hid");	
			start_game();
		}, 300);
	})

	let o = {cmd: "log", msg: "Hello World!" }
	rpc( o, console.log, console.error );

	document.addEventListener("keydown", (ev) => {
		if( keys_down.indexOf(ev.key) == -1 ) {
			keys_down.push( ev.key );
		}
	})

	document.addEventListener("keyup", (ev) => {
		keys_down.splice(keys_down.indexOf(ev.key), 1);
	})

	if( ! DEV ) {
		main_menu.classList.remove("hid");	
		setTimeout(function() {
			main_menu.classList.add("active");	
		}, 300);
	} else {
		start_game();
	}
}

function power_game() {

	// Detects collision between 2 rectangles...
	function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
		return (x1 < x2 + w2) && (x1 + w1 > x2) && (y1 < y2 + h2) && (y1 + h1 > y2); 
	}

	// Updates mouse pos and info!
	function update_mouse(e) {
		mouse_x = (e.clientX || e.pageX) - power_game_canvas.getBoundingClientRect().left;
		mouse_y = (e.clientY || e.pageY) - power_game_canvas.getBoundingClientRect().top;
	}

	// Retrieves point pos depending on i and j (Indexes)
	function point_pos(i, j) {
		return { x: j * tile_width, y: i * tile_height };
	}

	// function made to compare between drawing lines of connection and points of it!
	function is_connection_point(i, j) {
		var res = false;
		for (var o = 0; o < colors_points.length; o++) {
			if ((colors_points[o].start.i == i && colors_points[o].start.j == j) || (colors_points[o].end.i == i && colors_points[o].end.j == j)) {
				res = true;
			}
		}
		return res;
	}

	function get_connections() {
		var res = 0;
		
		for (var o = 0; o < lines.length; o++) {
			if (lines[o].length > 0) {
				if (colors_points[o].selected_from_start) {
					if ((lines[o][0].i == colors_points[o].start.i) && (lines[o][0].j == colors_points[o].start.j) && (lines[o][lines[o].length - 1].i == colors_points[o].end.i) && (lines[o][lines[o].length - 1].j == colors_points[o].end.j)) {
						res++;
					}
				} else if (colors_points[o].selected_from_end) {
					if ((lines[o][0].i == colors_points[o].end.i) && (lines[o][0].j == colors_points[o].end.j) && (lines[o][lines[o].length - 1].i == colors_points[o].start.i) && (lines[o][lines[o].length - 1].j == colors_points[o].start.j)) {
						res++;
					}
				}
			}
		}
		
		return res;
	}

	function cut_connection(c, d) {
		selected_from_start = false;
		selected_from_end = false;
		
		if (c) {
			lines[c] = [];
			colors_points[c].selected_from_start = false;
			colors_points[c].selected_from_end = false;
		}
		
		if (d) {
			lines[d] = [];
			colors_points[d].selected_from_start = false;
			colors_points[d].selected_from_end = false;
		}
		
		point_selected = false;
		point_color = -1;
	}

	function matches_in_array(e, a) {
		var res = 0;

		for (var o = 0; o < a.length; o++) {
			if (a[o].i == e.i && a[o].j == e.j) res++;
		}

		return res;
	}

	function check_lines_collision(c) {
		if (lines[c].length > 1) {
			var self_collide = false;
			// Iterate over line points, And detect similar, If found multiples of same point cut the connection directly!
			for (var x = 0; x < lines[c].length; x++) {
				if (matches_in_array(lines[c][x], lines[c]) > 1) {
					self_collide = true;
				}
			}

			if (self_collide) {
				cut_connection(c);
			}

			for (var y = 1; y < lines.length; y++) {
				if (lines[y].length > 1) {
					for (var z = 0; z < lines[y].length; z++) {
						for (var e = 0; e < lines[c].length; e++) {
							if (matches_in_array(lines[c][e], lines[y]) > 1) {
							cut_connection(y);
							//cut_connection(c, y);
							}
						}
					}
				}
			}
		}
	}

	var power_game_canvas = document.getElementById("power_game");
	var power_game_context = power_game_canvas.getContext("2d");
	var mouse_x = 0;
	var mouse_y = 0;
	var mouse_i = 0;
	var mouse_j = 0;
	var point_selected = false;
	var is_mouse_down = false;
	var selected_from_start	= false;
	var selected_from_end = false;
	var player_win_alerts = 0;		// Just stops at 1 so just alerts once when player wins!
	var collided_color = 0;
	var point_color = -1;
	var colors_count = 4;
	var colors_pal1 = [ "blank", "red", "green", "blue", "yellow" ];
	var colors_pal2 = [ "red", "green", "blue", "yellow", "blank" ];
	var tile_width = power_game_canvas.width / 5;
	var tile_height = power_game_canvas.height / 5;

	// Handling connection idea (Rabia):
	// 1. Player clicks on point. [x] 
	// 2. depending on color and when player moves mouse, Game pushes mouse pos but converts it to indexes i and j. [x]
	// 3. Converted result pushed to index of points depending on color (0: red, 1: green, 2: blue, 3: yellow) and so on. [x]
	// 4. If we stop on colored stuff, We don't push info and let player re-connect by re-sticking lines. [x]
	// 5. Else, Push info and draw line with rounded corner from first pos to second pos and so on. [x]
	// 6. Check for connecting point with point at end. [x]

	var lines = [ [], [], [], [] ];

	var colors_points = [
		{ start: { i: 0, j: 2 }, end: { i: 4, j: 1 }, connected_from_start: false, connected_from_end: false }, // red		(1 on grid)
		{ start: { i: 1, j: 1 }, end: { i: 2, j: 2 }, connected_from_start: false, connected_from_end: false }, // green	(2 on grid)
		{ start: { i: 2, j: 1 }, end: { i: 1, j: 3 }, connected_from_start: false, connected_from_end: false }, // blue		(3 on grid)
		{ start: { i: 0, j: 3 }, end: { i: 4, j: 2 }, connected_from_start: false, connected_from_end: false }, // yellow	(4 on grid)
	];

	// 0: none, 1: red, 2: green, 3: blue, 4: yellow
	// 5x5 rendered
	var grid = [
		[ 0, 0, 1, 4, 0 ],
		[ 0, 2, 0, 3, 0 ],
		[ 0, 3, 2, 0, 0 ],
		[ 0, 0, 0, 0, 0 ],
		[ 0, 1, 4, 0, 0 ],
	];

	function reset_game() {
		point_selected = false;
		is_mouse_down = false;
		selected_from_start = false;
		selected_from_end = false;
		player_win_alerts = 0;		  // Just stops at 1 so just alerts once when player wins!
		collided_color = 0;
		point_color = -1;
		
		grid = [
			[ 0, 0, 1, 4, 0 ],
			[ 0, 2, 0, 3, 0 ],
			[ 0, 3, 2, 0, 0 ],
			[ 0, 0, 0, 0, 0 ],
			[ 0, 1, 4, 0, 0 ],
		];
		
		lines = [ [], [], [], [] ];

		colors_points = [
			{ start: { i: 0, j: 2 }, end: { i: 4, j: 1 }, connected_from_start: false, connected_from_end: false }, // red	  (1 on grid)
			{ start: { i: 1, j: 1 }, end: { i: 2, j: 2 }, connected_from_start: false, connected_from_end: false }, // green	  (2 on grid)
			{ start: { i: 2, j: 1 }, end: { i: 1, j: 3 }, connected_from_start: false, connected_from_end: false }, // blue	  (3 on grid)
			{ start: { i: 0, j: 3 }, end: { i: 4, j: 2 }, connected_from_start: false, connected_from_end: false }, // yellow   (4 on grid)
		];
	}

	function draw_grid(i, j) {
		power_game_context.strokeStyle = "gray";
		power_game_context.fillStyle = "black";
		power_game_context.fillRect(j * tile_width, i * tile_height, tile_width, tile_height);
		power_game_context.strokeRect(j * tile_width, i * tile_height, tile_width, tile_height);
	}

	function draw_connection_points(i, j) {
		if (is_connection_point(i, j)) {
			if (grid[i][j] != 0) {
				power_game_context.beginPath();
				power_game_context.arc((j * tile_width) + (tile_width / 2), (i * tile_height) + (tile_height / 2), (tile_width / 2), 90, 180 * Math.PI); // Better?
				power_game_context.closePath();
				power_game_context.fill();
			}
		}
	}

	function draw_connection_lines(lines) {
		for (var i = 0; i < lines.length; i++) {
			power_game_context.strokeStyle = colors_pal2[i];

			for (var j = 1; j < lines[i].length; j++) {
				var p1 = point_pos(lines[i][j - 1].i, lines[i][j - 1].j);
				var p2 = point_pos(lines[i][j].i, lines[i][j].j);

				// Rounded connection lines
				power_game_context.lineWidth = 15;
				power_game_context.lineJoin = "round";
				power_game_context.beginPath();
				power_game_context.moveTo(p1.x + (tile_width / 2), p1.y + (tile_height / 2));
				power_game_context.lineTo(p2.x + (tile_width / 2), p2.y + (tile_height / 2));
				power_game_context.closePath();
				power_game_context.stroke();
				power_game_context.lineWidth = 1;
			}
		}
	}

	function update() {
		power_game_context.clearRect(0, 0, power_game_canvas.width, power_game_canvas.height);

		// Render grid
		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				draw_grid(i, j);
				power_game_context.fillStyle = colors_pal1[grid[i][j]]; 
				draw_connection_points(i, j);
				update_mouse_input(i, j);
			}
			draw_connection_lines(lines);
		}
	}

	function update_mouse_input(i, j) {
		// Assign i and j to mouse
		if (AABB(mouse_x, mouse_y, 1, 1, (j * tile_width), (i * tile_height), tile_width, tile_height)) {
			mouse_i = i;
			mouse_j = j;
			power_game_context.strokeStyle = "cyan";
			power_game_context.strokeRect((j * tile_width), (i * tile_height), tile_width, tile_height);

			// Add point to list of points of same color
			if (point_selected && is_mouse_down && point_color >= 0) {
				var point_obj = (lines[point_color].length > 1) ? lines[point_color][lines[point_color].length - 1] : lines[point_color][0];

				if (!point_obj) {
					if (selected_from_start) {
						point_obj = colors_points[point_color].start;
					} else {
						point_obj = colors_points[point_color].end;
					}
					lines[point_color].push({ i : point_obj.i, j: point_obj.j });
				}

			if (grid[mouse_i][mouse_j] == 0 || grid[mouse_i][mouse_j] - 1 == point_color) {
					if (point_obj.i != mouse_i || point_obj.j != mouse_j) {
						// If not diagonal, Push!
						var not_diagonal_1 = (mouse_i - point_obj.i != 0 && mouse_j - point_obj.j == 0);
						var not_diagonal_2 = (mouse_i - point_obj.i == 0 && mouse_j - point_obj.j != 0);

						if (not_diagonal_1 || not_diagonal_2) lines[point_color].push({ i : mouse_i, j: mouse_j });

						// If connected to end, Stop selected piece!
						if (selected_from_start) {
							if ((lines[point_color][lines[point_color].length - 1].i == colors_points[point_color].end.i) && (lines[point_color][lines[point_color].length - 1].j == colors_points[point_color].end.j)) {
								cut_connection();
							}
						} else if (selected_from_end) {
							if ((lines[point_color][lines[point_color].length - 1].i == colors_points[point_color].start.i) && (lines[point_color][lines[point_color].length - 1].j == colors_points[point_color].start.j)) {
								cut_connection();
							}
						}
					} else {
						lines[point_color].pop();
					}
				} else {
					if (point_obj.i != mouse_i || point_obj.j != mouse_j) {
						// If not diagonal, Push!
						var not_diagonal_1 = (mouse_i - point_obj.i != 0 && mouse_j - point_obj.j == 0);
						var not_diagonal_2 = (mouse_i - point_obj.i == 0 && mouse_j - point_obj.j != 0);

						if (not_diagonal_1 || not_diagonal_2) lines[point_color].push({ i : mouse_i, j: mouse_j });

						// If connected to end, Stop selected piece!
						if (selected_from_start) {
							if ((lines[point_color][lines[point_color].length - 1].i == colors_points[point_color].end.i) && (lines[point_color][lines[point_color].length - 1].j == colors_points[point_color].end.j)) {
								cut_connection();
							}
						} else if (selected_from_end) {
							if ((lines[point_color][lines[point_color].length - 1].i == colors_points[point_color].start.i) && (lines[point_color][lines[point_color].length - 1].j == colors_points[point_color].start.j)) {
								cut_connection();
							}
						}

					} else {
						lines[point_color].pop();
					}

					lines[collided_color] = [];
					lines[point_color]	= [];
					point_selected = false;
				}
			}
		}
	
		var matches = get_connections();
	
		if (matches == colors_count) {
			if (player_win_alerts++ == 1) showAlert("okay", "You win!"); // Alert won't be shown multiple times!
		}
	}

	function loop() {
		if (current_message == 1) {
			update();
			window.requestAnimationFrame(loop);
		}
	}

	power_game_canvas.onmousemove = function(e) { update_mouse(e); };

	power_game_canvas.ondblclick = function(e) {
		update_mouse(e);
	
		for (var i = 0; i < colors_points.length; i++) {
			var p1 = point_pos(colors_points[i].start.i, colors_points[i].start.j);
			var p2 = point_pos(colors_points[i].end.i, colors_points[i].end.j);

			//console.log("p1.x: " + p1.x + ", p1.y: " + p1.y);
			//console.log("p2.x: " + p2.x + ", p2.y: " + p2.y);

			var aabb_first_point = AABB(mouse_x, mouse_y, 1, 1, p1.x, p1.y, tile_width, tile_height);
			var aabb_second_point = AABB(mouse_x, mouse_y, 1, 1, p2.x, p2.y, tile_width, tile_height);
			if (aabb_first_point || aabb_second_point) {
				cut_connection(i);
			}
		}
	}

	if( keys_down.indexOf("r") > 0 ) {
		reset_game();
	}

	power_game_canvas.onmouseup = function(e) {
		update_mouse(e);
		is_mouse_down = false;
	};
  
	power_game_canvas.onmousedown = function(e) {
		update_mouse(e);
		is_mouse_down = true;
	
		for (var i = 0; i < colors_points.length; i++) {
			var p1 = point_pos(colors_points[i].start.i, colors_points[i].start.j);
			var p2 = point_pos(colors_points[i].end.i, colors_points[i].end.j);

			//console.log("p1.x: " + p1.x + ", p1.y: " + p1.y);
			//console.log("p2.x: " + p2.x + ", p2.y: " + p2.y);

			var aabb_first_point	= AABB(mouse_x, mouse_y, 1, 1, p1.x, p1.y, tile_width, tile_height);
			var aabb_second_point = AABB(mouse_x, mouse_y, 1, 1, p2.x, p2.y, tile_width, tile_height);

			if (aabb_first_point || aabb_second_point) {
				if (aabb_first_point) {
					selected_from_start = true;
					selected_from_end = false;
					colors_points[i].selected_from_start = true;
					colors_points[i].selected_from_end = false;
				} else {
					selected_from_start	= false;
					selected_from_end = true;
					colors_points[i].selected_from_start = false;
					colors_points[i].selected_from_end = true;
				}

				point_selected = !point_selected;
				point_color = i;
			}

			//console.log(point_selected);
			//console.log(point_color);
		}
	}

	window.requestAnimationFrame(loop); // Start game!
}

function bar_game() {
	var bar_game_canvas   = document.getElementById("bar_game");
	var bar_game_context  = bar_game_canvas.getContext("2d");
	bar_game_context.fillStyle = "green";
  
	var meter_percent = 100;
	var speed = 1;
	var speed_multiplier = 30;
	var player_win_alerts = 0;
  
	function reset_game() {
		meter_percent = 100;
	}
  
	function render() {
		bar_game_context.clearRect(0, 0, bar_game_canvas.width, bar_game_canvas.height);
		bar_game_context.fillRect(0, 0, meter_percent, bar_game_canvas.height);
	}
  
	function update() {
		if (!(meter_percent - speed < 0)) {
			meter_percent -= speed;
		} else {
			meter_percent = 0;
		}
    
		if (meter_percent > bar_game_canvas.width) {
			meter_percent = bar_game_canvas.width;
		}
	}
  
	function loop() {
		update();
		render();
		window.requestAnimationFrame(loop);
	}
  
	document.addEventListener("keyup", function(e) {
		if (e.key == "r") {
			reset_game();
		}
    
		if (e.key == " ") {
			meter_percent += speed * speed_multiplier;
      
			if (meter_percent >= bar_game_canvas.width - (speed * speed_multiplier)) {
				if (player_win_alerts++ == 1) {
					showAlert("okay", "You win!");
				}
			}
		}
	});
  
	window.requestAnimationFrame(loop);
}
