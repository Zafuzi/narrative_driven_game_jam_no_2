
delete require.cache[module.filename]; // always reload
const HERE = require("path").dirname( module.filename );

require( "sleepless" ).globalize();

module.exports = function( input, okay, fail ) {

	const { cmd, msg } = input;

	if( cmd == "ping" ) {
		okay( "pong" );
		return;
	}

	if( cmd == "log" ) {
		log( msg );
		okay();
		return;
	}

	fail( "Invalid action: " + cmd );

};

