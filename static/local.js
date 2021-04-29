document.addEventListener("DOMContentLoaded", dcl => {
	sleepless.globalize();
	init();
})

const DEV = false;

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
		id: 0, 
		title: "TEST EMAIL", 
		read: 0,
		visible: 1,
		content: `
		<p>Lorem ipsum dolor sit amet consectetur adipiscing elit eros, curae condimentum fermentum congue malesuada sociosqu fusce, class orci feugiat mattis mollis ligula sollicitudin. Lacus sem metus ad velit enim nec viverra rhoncus, duis fermentum pulvinar ornare purus curae placerat aenean, montes suspendisse consequat est eget gravida nisi. Nullam nostra ad ligula condimentum curae consequat ridiculus facilisi et porta ac nibh integer urna vel, risus nec dapibus sagittis pharetra eros taciti penatibus id mus non quisque cubilia.</p> <p>Dui viverra faucibus luctus nulla nisl facilisi vel rutrum, est curae placerat venenatis rhoncus blandit augue velit, ornare nisi euismod orci metus nibh et. Sociosqu netus ligula tristique sollicitudin ultricies quis scelerisque aenean libero iaculis dignissim, tempor viverra mus congue orci morbi phasellus eros luctus curabitur. Commodo egestas erat mi laoreet maecenas vitae sollicitudin sed eleifend semper, interdum nisl nullam potenti ante dignissim cubilia euismod per, dictum imperdiet felis scelerisque pellentesque ultricies faucibus aliquam rutrum.</p> <p>Semper nisi quis molestie consequat mollis morbi torquent praesent auctor, tempus mauris feugiat gravida fames scelerisque augue. Convallis ultricies fermentum luctus venenatis id neque non ante morbi duis, viverra sed quam porttitor metus velit fusce dictum. Platea neque sollicitudin nostra venenatis netus mus dui primis potenti odio cubilia litora ridiculus suspendisse, torquent velit eget aliquet tempor facilisi ut enim vehicula leo fusce varius. Conubia blandit posuere et integer gravida tempor eget vel dui, primis consequat orci elementum sagittis ornare nascetur etiam eleifend, hac lacus vehicula neque justo magna aliquam pharetra curae, leo magnis praesent varius porttitor cursus facilisis fusce.</p>
		<canvas width="300" height="300" id="test_canvas"></canvas>
		<p>Nascetur montes magnis feugiat velit nostra blandit magna eleifend, pharetra fringilla penatibus volutpat nulla mi cubilia, metus tortor a lectus quisque at mus. Suspendisse cum vulputate porta ridiculus venenatis etiam rutrum hac scelerisque platea phasellus posuere, lobortis lacinia curae nullam mauris imperdiet ut dapibus integer lacus. Eu in odio felis feugiat sed tortor viverra dui himenaeos fermentum consequat neque diam montes, mus dignissim blandit ut donec ac condimentum mattis vehicula egestas penatibus sodales varius.</p> <p>Erat per nibh facilisis sociis curae rutrum dui, dictumst mauris sollicitudin iaculis sagittis nullam ornare leo, nascetur luctus purus class pharetra feugiat. Non aliquam tincidunt volutpat per velit, molestie porttitor et habitasse primis, tempor nisl sagittis ante. Hendrerit etiam litora consequat leo torquent congue, mollis cubilia parturient sollicitudin gravida rhoncus suscipit, magna egestas odio fermentum purus.</p>
		`
	},
	{ 
		id: 0, 
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
	r8_viewer.update( content )
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
		// allow aria stuff to still work
		if( ev.key != "Tab" ) {
			ev.preventDefault();
		}

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