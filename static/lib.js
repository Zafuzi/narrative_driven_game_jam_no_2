rpc = function( o, okay = ()=>{}, fail = ()=>{} ) {
	fetch("/api/", {
		method:"POST",
		headers: {
			"Content-Type": "application/json"
		}, 
		body: o2j(o)
	})
	.then(res => {
		return res.json();
	})
	.then(obj => {
        if( ! obj ) {
			fail( "Invalid JSON response: " + json );
			return;
		}
		if( obj.error ) {
			fail( obj.error );
			return;
		}
		okay( obj );
	})
}

!function(){
    var lastBtn = null
    document.addEventListener('click',function(e){
        if (!e.target.closest) return;
        lastBtn = e.target.closest('button, input[type=submit]');
    }, true);
    document.addEventListener('submit',function(e){
        if ('submitter' in e) return;
        var canditates = [document.activeElement, lastBtn];
        lastBtn = null;
        for (var i=0; i < canditates.length; i++) {
            var candidate = canditates[i];
            if (!candidate) continue;
            if (!candidate.form) continue;
            if (!candidate.matches('button, input[type=button], input[type=image]')) continue;
            e.submitter = candidate;
            return;
        }
        e.submitter = e.target.querySelector('button, input[type=button], input[type=image]')
    }, true);
}();

let isAlertVisible = false;
let alertsToShow = [];
function showAlert( type, message, timeout ) {
    // only show one at a time for now
    // TODO increase to 3 and make them push down dynamically
    if( isAlertVisible ) {
        alertsToShow.push( {type, message, timeout} );
        return;
    } 
    let a = document.createElement("div");
        a.classList.add( "hid", "alert", "alert-"+type );
        a.innerHTML = message;
        a.addEventListener("click", function() {
            a.classList.remove('active');
            setTimeout( function() {
                if( a ) a.remove();
                isAlertVisible = false;
                runNextAlert();
            }, 300);
        });

    document.body.appendChild(a);
    isAlertVisible = true;

    a.classList.remove('hid'); 
    setTimeout( function() {
        a.classList.add('active');
        setTimeout( function() {
            a.classList.remove('active');
            setTimeout( function() {
                if( a ) a.remove();
                isAlertVisible = false;
                runNextAlert();
            }, 300);
        }, timeout || 3000);
    }, 300);
}

function runNextAlert() {
    if( alertsToShow.length == 0 ) return;
    let nextAlert = alertsToShow[0];
    showAlert( nextAlert.type, nextAlert.message, nextAlert.timeout );
    alertsToShow.splice(0, 1);
}