document.addEventListener("DOMContentLoaded", dcl => {
	sleepless.globalize();
	init();
})

const DEV = true;

var keys_down = [];

var current_message = 0;

// anything with a visible: 1 will be shown in the messages list in the game
var messages = [
	{ 
		id: 0, 
		title: "URS-1A - Dr. Treace", 
		read: 0,
		visible: 1,
		content: `
			<h3>Welcome to URS-1A</h3>
			<br/>
			<p>Abigail here! Hope you are settling in well. I know the first night down here can be a bit lonely, so I sent you my favorite song. It's not much company, but it's better than nothing!</p>
			<br/>
			<img src="https://media.giphy.com/media/3o7aTkzctUbDfzDJ84/giphy-downsized.gif">
			<p>See ya around :)</p>
			<br/>
			<em>Abigail Treace</em>
		`
	},
	{ 
		id: 1, 
		title: "Power Game", 
		read: 0,
		visible: 1,
		content: `
		<p>Nascetur montes magnis feugiat velit nostra blandit magna eleifend, pharetra fringilla penatibus volutpat nulla mi cubilia, metus tortor a lectus quisque at mus. Suspendisse cum vulputate porta ridiculus venenatis etiam rutrum hac scelerisque platea phasellus posuere, lobortis lacinia curae nullam mauris imperdiet ut dapibus integer lacus. Eu in odio felis feugiat sed tortor viverra dui himenaeos fermentum consequat neque diam montes, mus dignissim blandit ut donec ac condimentum mattis vehicula egestas penatibus sodales varius.</p> <p>Erat per nibh facilisis sociis curae rutrum dui, dictumst mauris sollicitudin iaculis sagittis nullam ornare leo, nascetur luctus purus class pharetra feugiat. Non aliquam tincidunt volutpat per velit, molestie porttitor et habitasse primis, tempor nisl sagittis ante. Hendrerit etiam litora consequat leo torquent congue, mollis cubilia parturient sollicitudin gravida rhoncus suscipit, magna egestas odio fermentum purus.</p>
		`
	},
	{ 
		id: 2, 
		title: "Dr. Carson", 
		read: 0,
		visible: 1,
		content: `
			<h3>Station 4</h3>
			Don’t mind the outage in my station. I tripped on those damn cables carrying my lunch back to my workstation. Noodles everywhere. I’ll ask Stacy to clean it up and I’ll get the pumps online in about 10 minutes.
			Regards,
			Dr. Carson
			Electrical Engineer
		`
	}
]


function populate_viewer( content ) {
  let c = Object.assign({}, content[0]); 
  c = [c];
  if( c[0] && c[0].id == 1 )
  {
    c[0].content = `<canvas id="power_game" width=300 height=300></canvas>` + content[0].content;
    r8_viewer.update( c, (e, d, i) => {
      power_game();
    })
  } else {
    r8_viewer.update( c )
  }
}


function start_game() {
	let main_game = document.querySelector("#main_game");
	main_game.classList.remove("hid");
	setTimeout(function() {
		main_game.classList.add("active");
	}, 300);

	// build out a list of messages that will be sent to the user
	// make those messages be sent after a condition is met
	// this may require proxies? to handle watching data and what not
	// basically, ask the server what message I should display next like MHR does
	// so I finish scenario 1, move onto scenario 2. But check that scenario 2 has all conditions met

	// for example you click the welcome message from URS-1A and that finishes scenario 1
	// but scenario 2 isnt ready until station 4 goes down. Dr. Carson then sends you a message, and that's the start of scenario 2

	let r8_message = rplc8("#message");
	let a = [];
	messages.filter(a => a.visible).reverse().forEach(m => {
		m.class = m.read ? "message_read" : "";
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
    mouse_x = e.clientX || e.pageX;
    mouse_y = (e.clientY || e.pageY) - 240;
  }
  
  // Retrieves point pos depending on i and j (Indexes)
  function point_pos(i, j) {
    return { x: j * 50, y: i * 50 };
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
  
 
  function check_connection(c) {
    if (lines[c].length > 1) {
      var start_i       = colors_points[c].start.i;
      var end_i         = colors_points[c].end.i;
      var start_j       = colors_points[c].start.i;
      var end_j         = colors_points[c].end.i;
      var arr_start_i   = lines[c][0].i;
      var arr_end_i     = lines[c][lines[c].length - 1].i;
      var arr_start_j   = lines[c][0].j;
      var arr_end_j     = lines[c][lines[c].length - 1].j;
    
      var i_con         = (start_i == arr_start_i || start_i == arr_end_i || end_i == arr_start_i || end_i == arr_end_i);
      var j_con         = (start_j == arr_start_j || start_j == arr_end_j || end_j == arr_start_j || end_j == arr_end_j);
    
      if (i_con && j_con) {
        colors_connected[c] = true;
      }
    }
  }
  
  /*
  function check_victory() {
    var matches = 0;
    
    for (var x = 0; x < colors_connected.length; x++) {
      if (check_connection(x)) matches++;
      console.log("color " + x + " connected: " + colors_connected[x]);
    }
    
    console.log(matches);
    if (matches == colors_connected.length) alert("YOU WON!");
  }
  */
  
  var power_game_canvas     = document.getElementById("power_game");
  var power_game_context    = power_game_canvas.getContext("2d");
  var mouse_x               = 0;
  var mouse_y               = 0;
  var mouse_i               = 0;
  var mouse_j               = 0;
  var logs                  = 0;
  var point_selected        = false;
  var selected_from_start   = false;
  var selected_from_end     = false;
  var collided_color        = 0;
  var point_color           = -1;
  var colors_connected      = [ false, false, false, false ];
  
  // Handling connection idea (Rabia):
  // 1. Player clicks on point. [x] 
  // 2. depending on color and when player moves mouse, Game pushes mouse pos but converts it to indexes i and j. [x]
  // 3. Converted result pushed to index of points depending on color (0: red, 1: green, 2: blue, 3: yellow) and so on. [x]
  // 4. If we stop on colored stuff, We don't push info and let player re-connect by re-sticking lines. [x]
  // 5. Else, Push info and draw line with rounded corner from first pos to second pos and so on. [x]
  // 6. Check for connecting point with point at end. [x]
  
  // TODO:
  // 1. Disallow diagonal movement (Without corrupt connecting).
  // 2. Reset line if collision with other lines of other colors or with same line itself.
  // 3. Better way to detect victory!
  var lines = [ [], [], [], [] ];
  
  var colors_points = [
    { start: { i: 0, j: 0 }, end: { i: 4, j: 0 } }, // red
    { start: { i: 0, j: 2 }, end: { i: 4, j: 1 } }, // green
    { start: { i: 0, j: 3 }, end: { i: 4, j: 2 } }, // blue
    { start: { i: 0, j: 4 }, end: { i: 4, j: 4 } }, // yellow
  ];

  // 0: none, 1: red, 2: green, 3: blue, 4: yellow
  // 5x5 rendered
  var grid = [
    [ 1, 0, 2, 3, 4 ],
    [ 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0 ],
    [ 1, 2, 3, 0, 4 ],
  ];
  
  function draw_grid(i, j) {
    power_game_context.strokeStyle = "gray";
    power_game_context.fillStyle = "black";
    power_game_context.fillRect(j * 50, i * 50, 50, 50);
    power_game_context.strokeRect(j * 50, i * 50, 50, 50);
  }
  
  function draw_connection_points(i, j) {
    if (is_connection_point(i, j)) {
      if (grid[i][j] != 0) {
        power_game_context.beginPath();
        power_game_context.arc((j * 50) + 25, (i * 50) + 25, 25, 90, 180 * Math.PI); // Better?
        power_game_context.closePath();
        power_game_context.fill();
      }
    }
  }
  
  function draw_connection_lines(lines) {
    for (var i = 0; i < lines.length; i++) {
      if (i == 0) {
        power_game_context.strokeStyle = "red";
      } else if (i == 1) {
        power_game_context.strokeStyle = "green";
      } else if (i == 2) {
        power_game_context.strokeStyle = "blue";
      } else if (i == 3) {
        power_game_context.strokeStyle = "yellow";
      } else {
        power_game_context.strokeStyle = "blank";  // Don't draw anything else!
      }
      
      for (var j = 1; j < lines[i].length; j++) {
        var p1 = point_pos(lines[i][j - 1].i, lines[i][j - 1].j);
        var p2 = point_pos(lines[i][j].i, lines[i][j].j);
        
        // Rounded connection lines
        power_game_context.lineWidth = 15;
        power_game_context.lineJoin = "round";
        power_game_context.beginPath();
        power_game_context.moveTo(p1.x + 25, p1.y + 25);
        power_game_context.lineTo(p2.x + 25, p2.y + 25);
        power_game_context.closePath();
        power_game_context.stroke();
        power_game_context.lineWidth = 1;
      }
    }
  }

  function render() {
    power_game_context.clearRect(0, 0, power_game_canvas.width, power_game_canvas.height);
    
    // Render grid
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        draw_grid(i, j);
        
        // Assign i and j to mouse
        if (AABB(mouse_x, mouse_y, 1, 1, (j * 50), (i * 50), 50, 50)) {
          mouse_i = i;
          mouse_j = j;
          power_game_context.strokeStyle = "cyan";
          power_game_context.strokeRect((j * 50), (i * 50), 50, 50);
          
          // Add point to list of points of same color
          if (point_selected && point_color >= 0) {
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
                lines[point_color].push({ i : mouse_i, j: mouse_j });
              }/* else {
                lines[point_color].pop();
              }*/
              
            } else {
              if (point_obj.i != mouse_i || point_obj.j != mouse_j) {
                lines[point_color].push({ i : mouse_i, j: mouse_j });
              }/* else {
                lines[point_color].pop();
              }*/
              
              lines[collided_color] = [];
              lines[point_color] = [];
              point_selected = false;
            }
          }
        }
        
        if (grid[i][j] == 1) {
          power_game_context.fillStyle = "red";
        } else if (grid[i][j] == 2) {
          power_game_context.fillStyle = "green";
        } else if (grid[i][j] == 3) {
          power_game_context.fillStyle = "blue";
        } else if (grid[i][j] == 4) {
          power_game_context.fillStyle = "yellow";
        } else {
          power_game_context.fillStyle = "blank";  // Don't draw anything else!
        }
        
        draw_connection_points(i, j);
      }
      draw_connection_lines(lines);
    }
  }
  
  function update() {
    var matches = 0;
    
    for (var x = 0; x < colors_connected.length; x++) {
      if (check_connection(x)) matches++;
      // console log is very very slow operation when done lot and lots of times
      // console.log("color " + x + " connected: " + colors_connected[x]);
    }
    
    // console.log(matches);
    if (matches == colors_connected.length) alert("YOU WON!");
  }
  
  function loop() {
    render();
    update();
    window.requestAnimationFrame(loop);
    
    //if (logs++ == 20) console.log(lines[0]);
  }
  
  power_game_canvas.onmousemove = function(e) { update_mouse(e); };
  
  power_game_canvas.ondblclick = function(e) {
    update_mouse(e);
    
    for (var i = 0; i < colors_points.length; i++) {
      var p1 = point_pos(colors_points[i].start.i, colors_points[i].start.j);
      var p2 = point_pos(colors_points[i].end.i, colors_points[i].end.j);
      
      //console.log("p1.x: " + p1.x + ", p1.y: " + p1.y);
      //console.log("p2.x: " + p2.x + ", p2.y: " + p2.y);
      
      var aabb_first_point = AABB(mouse_x, mouse_y, 1, 1, p1.x, p1.y, 50, 50);
      var aabb_second_point = AABB(mouse_x, mouse_y, 1, 1, p2.x, p2.y, 50, 50);
      
      if (aabb_first_point || aabb_second_point) {
        selected_from_start     = false;
        selected_from_end       = false;
        lines[i]                = []; // Clear!
        point_selected          = false;
        point_color             = i;
      }
    }
  }
  
  power_game_canvas.onmousedown = function(e) {
    update_mouse(e);
    
    for (var i = 0; i < colors_points.length; i++) {
      var p1 = point_pos(colors_points[i].start.i, colors_points[i].start.j);
      var p2 = point_pos(colors_points[i].end.i, colors_points[i].end.j);
      
      //console.log("p1.x: " + p1.x + ", p1.y: " + p1.y);
      //console.log("p2.x: " + p2.x + ", p2.y: " + p2.y);
      
      var aabb_first_point  = AABB(mouse_x, mouse_y, 1, 1, p1.x, p1.y, 50, 50);
      var aabb_second_point = AABB(mouse_x, mouse_y, 1, 1, p2.x, p2.y, 50, 50);
      
      if (aabb_first_point || aabb_second_point) {
        if (aabb_first_point) {
          selected_from_start   = true;
          selected_from_end     = false;
        } else {
          selected_from_start   = false;
          selected_from_end     = true;
        }
        
        point_selected = !point_selected;
        point_color = i;
      }
      
      //console.log(point_selected);
      //console.log(point_color);
    }
  };
  
  window.requestAnimationFrame(loop); // Start game!
}
