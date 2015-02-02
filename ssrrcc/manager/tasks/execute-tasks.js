var dir = __dirname+'/../../../../bluestorm-manager';





var spawn = require('child_process').spawn;

var child;
process.on('message',function(data){

	child = spawn("grunt", [data.type], { cwd: dir });
	child.stdout.on('data', function (data) {
		if(data) {
			var d = data.toString().trim();
	  		console.log(d);
	  		if(d=="Waiting...") {
	  			process.send({
	  				state: 'ended'
	  			});
	  		}
            if(d.indexOf('Done, without error')!=-1) {
                process.send({
                    state: 'ended',
                    prod: true
                });
            }
		}
	});

	child.stderr.on('data', function (data) {
	  console.log('stderr: ' + data);
	});
});

process.on('close', function (code) {
    console.log('child process exited with code ' + code);
});

process.on('SIGINT', function() {
    if(child) {
        child.kill('SIGHUP');
        child = null;
    }
});

process.on('uncaughtException',function(err){
	console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});

process.on('exit', function(code) {
    console.log('EXIIIIIIT');
})