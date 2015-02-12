var http = require("http");
var RememberTheMilk = require("./rtm.js");
var fs = require("fs");

var api_key = "6d37c47cb0ec8868d4a4019906b1d73c";
var api_sec = "970e6f9232c64a8a";


var rtm = new RememberTheMilk(api_key, api_sec, "delete");

rtm.get('rtm.auth.getFrob', function(resp){
    var frob = resp.rsp.frob;
    var authUrl = rtm.getAuthUrl(frob);

    console.log('Please visit the following URL in your browser to authenticate:\n');
    console.log(authUrl, '\n');
    console.log('After authenticating, press any key to resume...');

    process.stdin.resume();

    process.stdin.on("data", function(){
        rtm.get('rtm.auth.getToken', {frob: frob}, function(resp){
            console.log("getting info");
            if (!resp.rsp.auth) {
                console.log('Auth token not found. Did you authenticate?\n');
                process.exit(1);
            }

            rtm.auth_token = resp.rsp.auth.token;

            console.log("fetching tasks");
            rtm.get('rtm.tasks.getList', function(resp){
                var i, list;

                var tasks=[];
                for (i = 0; i < resp.rsp.tasks.list.length; i++) {
                    list = resp.rsp.tasks.list[i];
                    if (list.taskseries !== undefined){
                        for(j = 0; j < list.taskseries.length; j++){
                            task = list.taskseries[j];
                            tasks[tasks.length+1] = task;
                        }
                    }
                }

                fs.writeFileSync("export.json", JSON.stringify(tasks));

                console.log("export.js");
                process.exit();
            });
        });
    });
});

