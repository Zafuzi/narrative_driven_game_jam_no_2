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
		visible: 1,
		done: 0,
		next: 1000,
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
		done: 0,
		next: 500,
		content: `
			<h3>Anomaly detected at Station 4</h3>
			<p>Station 4 has lost power</p>
			<p>Connect the wire to bring the station back online.</p>
		`
	},
	{
		id: 2,
		title: "Dr. Carson",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>Station 4</h3>
			<br/>
			<p> Sorry about the outage. I tripped on those damn cables carrying my lunch back to my workstation. Noodles everywhere. I’ll ask Stacy to clean it up.</p>
			<br/>
			<p> Regards, </p>
			<p> Dr. Carson </p>
		`,
		next: 500
	},
	{
		id: 3,
		title: "Mr. Grey",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>Station 4</h3>
			<br/>
			<p> Everything looks good down here, Dr. Carson explained the situation and you got everything back online quickly enough, so no need to report anything to the higher ups. </p>
			<p> Oh! Also, welcome to the team. Glad to have another <em>normie</em> around here. These scientists are a bit nuts </p>
			<br/>
			<p> See ya around, </p>
			<p> Mr. Grey </p>
		`,
		next: 1000
	},
	{
		id: 4,
		title: "URS - AUTOMATED MONITORING",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>Anomaly detected at Station 1</h3>
			<p>Press space to move the station back into the currents</p>
		`
	}
];


function populate_viewer( content ) {
	if( content.length == 0 ) {
		// nothing to do
		return;
	}
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
		if( c.id == 4 ) {
			c.content = `<canvas id="bar_game" width=300 height=300></canvas>` + c.content;
			r8_viewer.update( [c], (e, d, i) => {
				bar_game();
			})
			return;
		}

		r8_viewer.update( [c], (e, d, i) => {
			messages[ c.id ].done = 1;
		});
	} else {
		r8_viewer.update( c )
	}
}

let r8_message; // message template
var messages_need_update = false;
let T = 0;

function main_game_loop() {
	T++;
	render_messages();
	window.requestAnimationFrame( main_game_loop );
}
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
				m.trim_content = m.trim_content.slice(0, 120);
			}
			a.push(m);
		})
		r8_message.update(a, (e, d, i) => {
			e.addEventListener("click", function(ev) {
				d.read = true;
				// set the time we clicked on this to time showing the next message
				d.read_time = T;
				e.classList.add("message_read");
				populate_viewer( [d] );
			});
		})
	}


	let nn = current_message + 1;
	let cm = messages[ current_message ];
	let nm = messages[ nn ];
	// if next message and next message is not visible
	// and current message is done
	// and current message has waited long enough
	// show the next message
	if( nm && !nm.visible && cm.done && T > cm.next + (cm.read_time || 0) ) {
		show_message( nn );
	}

}

function start_game() {

	let main_game = document.querySelector("#main_game");
	main_game.classList.remove("hid");
	setTimeout(function() {
		main_game.classList.add("active");
	}, 300);

	show_message(0);
	if( DEV ) {
		messages.forEach( m => {
			show_message(m.id);
		});
	}
	window.requestAnimationFrame( main_game_loop );

}

function show_message(id, timeout) {
	if( ! messages[id] ) return;
	messages[id].visible = 1;
	messages_need_update = true;
}

let r8_viewer;
function init() {
	r8_viewer = rplc8("#view_message");
		populate_viewer([]);
		let main_menu = document.querySelector("#main_menu");
		let play_button = document.querySelector("#play_button");

	play_button.addEventListener("click", function() {
		main_menu.classList.remove("active");	
		setTimeout(function() {
			main_menu.classList.add("hid");	
			start_game();
		}, 300);
	})

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

	let frame = null;

	let canvas = QS("#power_game")[0];
			console.log( canvas );
			canvas.style.backgroundColor = "#111";
			
	let ctx = canvas.getContext('2d');
			ctx.lineJoin = "round";

	let grid_size = 5;
	let tile_width = tile_height = canvas.width / grid_size;
	let point_radius = tile_width / 2;
			ctx.lineWidth = point_radius / 2;

	let mouse_down = false;

	let points = [
			{ color: "red", x: 0, y: 0, connected: null, line_drawn: 0 },
			{ color: "red", x: 4, y: 4, connected: null, line_drawn: 0 },

			{ color: "green", x: 1, y: 0, connected: null, line_drawn: 0 },
			{ color: "green", x: 2, y: 4, connected: null, line_drawn: 0 },
			
			{ color: "blue", x: 2, y: 0, connected: null, line_drawn: 0 },
			{ color: "blue", x: 0, y: 4, connected: null, line_drawn: 0 },

			{ color: "magenta", x: 3, y: 0, connected: null, line_drawn: 0 },
			{ color: "magenta", x: 3, y: 4, connected: null, line_drawn: 0 },

			{ color: "yellow", x: 4, y: 0, connected: null, line_drawn: 0 },
			{ color: "yellow", x: 1, y: 4, connected: null, line_drawn: 0 },
	];

	let fill_color = "blank";
	let current_point, current_line;

	let update = function() {

		let connected_count = 0;
		// if mouse is down
		// and we clicked on a point
		// set the current point
		points.forEach( p => {
			if( mouse_down ) {
				if( current_point == p ) return;
				if( p.connected ) return;
				let click = AABB( mx, my, 1, 1, p.x * tile_width, p.y * tile_height, tile_width, tile_height );
				if( click ) {
					if( current_point && current_point.color == p.color ) {
						// match!
						current_point.connected = p;
						p.connected = current_point;
						current_point = null;
					} else {
						current_point = p;
					}
				}
			}

			if( p.connected ) { connected_count++; }
		});

		if( connected_count == points.length ) {
			messages[1].done = 1;
			messages[1].read_time = T; // reset read time to actuall mean done time in this case
			showAlert("okay", "Power restored");
		}	

	}

	let draw = function() {
		ctx.clearRect( 0, 0, canvas.width, canvas.height );
		points.forEach( p => {
				ctx.beginPath();
				ctx.fillStyle = p.color;
				ctx.arc( p.x * tile_width + point_radius, p.y * tile_height + point_radius, point_radius - 10, 0, 2 * Math.PI);
				ctx.fill();
				ctx.closePath();
				if( p.connected ) {
					ctx.strokeStyle = p.color;
					ctx.beginPath();
					ctx.moveTo( p.x * tile_width + point_radius, p.y * tile_width + point_radius );
					ctx.lineTo( p.connected.x * tile_width + point_radius, p.connected.y * tile_width + point_radius );
					ctx.closePath();
					ctx.stroke();
				}
		});

		// draw a line from the current point to the mouse
		if( mouse_down && current_point ) {
				ctx.strokeStyle = current_point.color;
				ctx.beginPath();
				ctx.moveTo( current_point.x * tile_width + point_radius, current_point.y * tile_width + point_radius );
				ctx.lineTo( mx, my );
				ctx.closePath();
				ctx.stroke();
		}
	}

	let loop = function() {
		if( messages[1].done == 1 ) {
			window.cancelAnimationFrame( frame );
			loop = null;
			return;
		}
		update();
		draw();
		frame = window.requestAnimationFrame( loop );
	}

	canvas.addEventListener("mousedown", () => { mouse_down = true; } );
	canvas.addEventListener("mouseup", () => { mouse_down = false; current_point = null; } );
	canvas.addEventListener("mousemove", update_mouse);

  frame = window.requestAnimationFrame(loop); // Start game!

	// Updates mouse pos and info!
	function update_mouse(e) {
		mx = (e.clientX || e.pageX) - canvas.getBoundingClientRect().left;
		my = (e.clientY || e.pageY) - canvas.getBoundingClientRect().top;
	}
}

// Detects collision between 2 rectangles...
function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
	return (x1 < x2 + w2) && (x1 + w1 > x2) && (y1 < y2 + h2) && (y1 + h1 > y2);
}

