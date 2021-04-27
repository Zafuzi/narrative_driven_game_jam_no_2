document.addEventListener("DOMContentLoaded", dcl => {
	sleepless.globalize();
	init();
})

function init() {
	rpc({cmd: "ping"}, r => {
		showAlert("okay", r.data );
	}, err => {
		showAlert("fail", err );
	});

	let o = {cmd: "log", msg: "Hello World!" }
	rpc( o, console.log, console.error );
}
