document.addEventListener("DOMContentLoaded", dcl => {
	sleepless.globalize();
	init();
})


var keys_down = [];


function start_game() {
	showAlert( "info", "New Message" );
}

function init() {

	let main_menu = document.querySelector("#main_menu");
	let play_button = document.querySelector("#play_button");
	
	play_button.addEventListener("click", function() {
		main_menu.classList.remove("active");	
		setTimeout(function() {
			main_menu.classList.add("hid");	
			start_game();
		}, 300);
	})

	rpc({cmd: "ping"}, r => {
		showAlert("okay", r.data );
	}, err => {
		showAlert("fail", err );
	});

	let o = {cmd: "log", msg: "Hello World!" }
	rpc( o, console.log, console.error );


	main_menu.classList.add("active");	

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
}