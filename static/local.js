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
		next: 400,
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
		next: 200,
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
		next: 400
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
		next: 200
	},
	{
		id: 4,
		title: "SPAM EMAIL ABOUT PIZZA",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>PIZZA! PIZZA! PIZZA!</h3>
			<img src="https://picsum.photos/300/300">
			<p>Up to 50% off with qualifying orders!</p>
			<br/>
			<p> DEV NOTE ask voice actor to do funny quip about getting pizza "20,000 leagues under"</p>
			<p> DEV NOTE keep these notes in here to satisfy the meta...</p>
			<p> DEV NOTE Maybe that's too on the nose?</p>
			<p> DEV NOTE Who cares, we are working for free. <em>WE</em> aren't even getting pizza.</p>
		`,
		next: 200
	},
	{
		id: 5,
		title: "URS - AUTOMATED MONITORING",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>Anomaly detected at Station 1</h3>
			<p>Press space to move the station back into the currents</p>
		`,
		next: 400
	},
	{
		id: 6,
		title: "URS - AUTOMATED MONITORING",
		read: 0,
		visible: 0,
		done: 0,
		content: `
			<h3>SECURITY FOOTAGE DIGEST - ${Date.now()}</h3>
			<p>Unauthorized entry into airlock D on Station 1.</p>
			<button id="report_button">REPORT</button>
		`
	},
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
		if( c.id == 5 ) {
			c.content = `<canvas id="bar_game" width=300 height=50></canvas>` + c.content;
			r8_viewer.update( [c], (e, d, i) => {
				bar_game();
			})
			return;
		}

		r8_viewer.update( [c], (e, d, i) => {
			messages[ d.id ].done = 1;
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
		});
	}


	let nn = current_message + 1;
	let cm = messages[ current_message ];
	let nm = messages[ nn ];
	// if next message and next message is not visible
	// and current message is done
	// and current message has waited long enough
	// show the next message
	if( ! cm.next ) cm.next = 200;
	if( ! nm.next ) nm.next = 200;
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

function bar_game() {
    var bar_game_canvas = document.getElementById("bar_game");
    var bar_game_context = bar_game_canvas.getContext("2d");
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
    
    document.addEventListener("keypress", function(e) {
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
  
    function loop() {
        update();
        render();
        window.requestAnimationFrame(loop);
    }
    
    window.requestAnimationFrame(loop); // Start bar game!
}

function binary_num_game() {
    // DEV NOTE (Rabia -> zafuzi): This game's canvas should be 600x130
    // DEV NOTE (Rabia -> zafuzi): Can you try it cause i think that game is broken and we should get bounding client rect?
    function randbit() {
        let masks = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
        let res = 0;
        
        for (var i = 0; i < masks.length; i++) {
            masks[i] = Math.floor(Math.random() * 2);
        }
        
        for (var i = 0; i < masks.length; i++) {
            if (masks[i]) res += bitmasks[i];
        }
        
        return res;
    }
    
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var frame = null;
    var logs = 0;
    
    var bitmasks = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
    var recs = [ 0, 0, 0, 0, 0, 0, 0, 0 ]; // If one of those is one, Trigger value by index from bitmasks
    var res1 = 0;
    var res2 = randbit();
    var mouse_x = 0;
    var mouse_y = 0;
    
    function update() {
        var res = 0;
        
        for (var i = 0; i < recs.length; i++) {
            if (recs[i]) {
                res += bitmasks[i];
            }
        }
        
        res1 = res;
        
        if (res1 == res2) {
            if (logs++ == 1) {
                showAlert("okay", "you win!");
            }
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "dodgerblue";
        
        for (var i = 0; i < recs.length; i++) {
            ctx.strokeRect((canvas.getBoundingClientRect().left - 152) - (64 * i), canvas.getBoundingClientRect().top + 64, 64, 64);
            ctx.font = "22px arial";
            ctx.strokeText(bitmasks[i].toString(), (canvas.getBoundingClientRect().left - 152) - (64 * i) + 22, canvas.getBoundingClientRect().top + 32);
            ctx.font = "32px arial";
            ctx.strokeText(recs[i].toString(), (canvas.getBoundingClientRect().left - 152) - (64 * i) + 22, canvas.getBoundingClientRect().top + 106);
            ctx.strokeText(" = " + res2.toString(), (canvas.getBoundingClientRect().left - 88), canvas.getBoundingClientRect().top + 106);
        }  
    }
    
    function loop() {
        /*
        if( messages[1].done == 1 ) {
            window.cancelAnimationFrame( frame );
            loop = null;
            return;
        }
        */
        update();
        draw();
        frame = window.requestAnimationFrame(loop);
    }
    
    document.addEventListener("click", function(e) {
        mouse_x = (e.clientX || e.pageX) - canvas.getBoundingClientRect().left;
        mouse_y = (e.clientY || e.pageY) - canvas.getBoundingClientRect().top;
        
        for (var i = 0; i < recs.length; i++) {
            // AABB for each rect...
            if (AABB(mouse_x, mouse_y, 1, 1, (canvas.getBoundingClientRect().left - 152) - (64 * i), canvas.getBoundingClientRect().top + 64, 64, 64)) {
                recs[i] = (recs[i] == 0) ? 1 : 0;
            }
        }
    });
    
    frame = window.requestAnimationFrame(loop); // Start game!
}

function keyhit() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.style.backgroundColor = "black";
    
    var frame = null;
    var levels = 4;
    var logs = 0;
    var current_level = 0;
    var current_key = 0;
    var key_names = [ "up", "down", "left", "right" ];
    var keys = [];
    var key_pressed = "";
    var hit = false;
    
    var imgs = [
        {
            img: new Image(),
            img_pressed: new Image(),
            src: "images/up.png",
            src_pressed: "images/up_pressed.png"
        },
        {
            img: new Image(),
            img_pressed: new Image(),
            src: "images/down.png",
            src_pressed: "images/down_pressed.png"
        },
        {
            img: new Image(),
            img_pressed: new Image(),
            src: "images/left.png",
            src_pressed: "images/left_pressed.png"
        },
        {
            img: new Image(),
            img_pressed: new Image(),
            src: "images/right.png",
            src_pressed: "images/right_pressed.png"
        },
    ];
    
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].img.src = imgs[i].src;
        imgs[i].img_pressed.src = imgs[i].src_pressed;
    }        
    
    // Initialize game levels
    for (var i = 0; i < levels; i++) {
        keys[i] = [];
        
        for (var j = 0; j < key_names.length; j++) {
            keys[i].push({ name: key_names[Math.floor(Math.random() * 4)], pressed: false });
        }
    }
    
    function img_from_dir(dir, pressed) {
        if (dir == "up") {
            if (pressed) {
                return imgs[0].img_pressed;
            } else {
                return imgs[0].img;
            }
        } else if (dir == "down") {
            if (pressed) {
                return imgs[1].img_pressed;
            } else {
                return imgs[1].img;
            }
        } else if (dir == "left") {
            if (pressed) {
                return imgs[2].img_pressed;
            } else {
                return imgs[2].img;
            }
        } else if (dir == "right") {
            if (pressed) {
                return imgs[3].img_pressed;
            } else {
                return imgs[3].img;
            }
        }
    }
    
    function update() {
        if (keys[current_level]) {
            if (hit) {
                if (key_pressed.toLowerCase().indexOf(keys[current_level][current_key].name) > -1) {
                    keys[current_level][current_key].pressed = true;
                    current_key++;
                }
                hit = false;
            }
            
            if (current_key == keys[current_level].length) {
                current_level++;
                hit = false;
                current_key = 0;
            }
        }
        
        if (current_level == levels) {
            if (logs++ == 1) {
                showAlert("okay", "You Win!");
                // Do something
            }
        }
    }
    
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (keys[current_level]) {
            for (var i = 0; i < keys[current_level].length; i++) {
                if (keys[current_level][i].pressed) {
                    ctx.drawImage(img_from_dir(keys[current_level][i].name, true), 120, i * 70 + 20, 48, 48);
                } else {
                    ctx.drawImage(img_from_dir(keys[current_level][i].name, false), 120, i * 70 + 20, 48, 48);
                }
            }
        }
    }
    
    document.addEventListener("keyup", function(e) {
        key_pressed = e.key;
        hit = true;
    });
    
    function loop() {
        /*
        if( messages[1].done == 1 ) {
			window.cancelAnimationFrame( frame );
			loop = null;
			return;
		}
        */
        update();
        render();
        frame = window.requestAnimationFrame(loop);
    }
    
    frame = window.requestAnimationFrame(loop);
}

// Detects collision between 2 rectangles...
function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
	return (x1 < x2 + w2) && (x1 + w1 > x2) && (y1 < y2 + h2) && (y1 + h1 > y2);
}

