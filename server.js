var signalR = require('signalr-client');
var client  = new signalR.client(
	"https://kioskserver-qa.azurewebsites.net/signalr",  //signalR service URL
	['DeviceHub'],                      // array of hubs to be supported in the connection
    2,                                //optional: retry timeout in seconds (default: 10)
    true                              //optional: doNotStart default false
);

client.serviceHandlers = { //Yep, I even added the merge syntax here.
    bound: function() { console.log("Websocket bound"); },
    connectFailed: function(error) { console.log("Websocket connectFailed: ", error); },
    connected: function(connection) { console.log("Websocket connected"); },
    disconnected: function() { console.log("Websocket disconnected"); },
    onerror: function (error) { console.log("Websocket onerror: ", error); },
    messageReceived: function (message) { console.log("Websocket messageReceived: ", message); return false; },
    bindingError: function (error) { console.log("Websocket bindingError: ", error); },
    connectionLost: function (error) { console.log("Connection Lost: ", error); },
    reconnecting: function (retry /* { inital: true/false, count: 0} */) {
        console.log("Websocket Retrying: ", retry);
        //return retry.count >= 3; /* cancel retry true */
        return true; 
    }
};

//#### From the client instance
setInterval(function () {
    console.log(client.state);
    client.invoke(
		'DeviceHub', // Hub Name (case insensitive)
		'registerConnection',	// Method Name (case insensitive)
		'9HB319802',
		);
}, 2000);

//#### From the hub instance
setTimeout(function() {
    (function sendMessage() {
        console.log("Client State Code: ", client.state.code);
        console.log("Client State Description: ", client.state.desc);
        console.log("==>> try to get hub");
       	var hub = client.hub('TestHub'); // Hub Name (case insensitive)

        // if not bound set the hub will be undefined
       	if (!hub) {
       	    console.log("==>> hub not found. retry in 10 seconds");
       	    setTimeout(sendMessage, 10000);
            return;
       	}
       	console.log("==>> send message");
        hub.invoke(
		    'Send',	// Method Name (case insensitive) 
		    'hub', 'invoked from hub' //additional parameters to match called signature
		    );

    })();
},3000);

console.log('Waiting!');
process.stdin.resume();

setTimeout(function() {
    client.end();
}, 1500);

client.start();
