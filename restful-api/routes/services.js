var Parse = require('parse').Parse;
var http = require('https');

var APP_ID = 'fp7oxuptKJ9ysesuXOeV4Ieul8ErSZklVwRslkJW';
var MASTER_KEY = 'HLpukqho21z1LaL7dUrPMRWI0jAu38NqmmL9qIfo';
Parse.initialize(APP_ID, MASTER_KEY);
//TODO: session token table

function checkUser(req, res, next){

    if(req.cookies.user!=undefined) {
        var user = JSON.parse(req.cookies.user);
        Parse.User.become(user.sessionToken, {
            success: function (res) {
                console.log('logged in with sessionToken');
                next();
            },
            error: function (err) {
                console.log('error logging in with sessionToken: ' + err);
            }
        });
    }
    console.log("not logged in");
    next();
}

module.exports = function (app) {
    //app.use(checkUser);
    var Secret = Parse.Object.extend("secrets");
    var Submissions = Parse.Object.extend("submissions");

    app.post("/api/secret/", function (req, res){
        console.log('submitting secret');
        var sec = new Secret();

        var mySecret = req.body.secret;
        mySecret.owner = Parse.User.current();
        mySecret.completed = 0;
        mySecret.submissions = 0;
        res.send(sec.save(mySecret));
    });

    app.get("/api/list", function(req, res){
        var query = new Parse.Query(Secret);
        query.find().then(function(results){
            res.send(results)
        });
    });

    app.get("/api/secret/:id", function(req, res){
        var query = new Parse.Query(Secret);
        query.include("owner");
        query.get(req.params.id,{}).then(function(r){
            r.attributes.username = r.get('owner').get('username');
            res.send(JSON.stringify(r.attributes));
        });
    });

    //TODO:make sure the rest of these work with the parsefactory
    app.post("/api/submission/", function (req, res){

        var query = new Parse.Query(Secret);
        query.get(req.body.secret.id,{
            success:function(res){
                res.increment("count");
                res.save();
            },
            error:function(err){
                console.log(err);
            }
        });

        var sub = new Submissions();
        sub.set("secretId", req.body.secret);
        sub.set("status", 'ip');
        sub.set("new", true);
        sub.set("body", req.body.submission);
        sub.set("image", req.body.img);
        sub.set("userId", req.body.user);
        sub.set("secretOwnerID", req.body.secret.get("ownerID"));

        res.send(sub.save(null,{}));
    });

    app.post("/api/login/", function(req, res){
        Parse.User.logIn(req.body.username, req.body.password, {}).then(function(data) {
            var user = Parse.User.current();
            user.attributes.sessionToken = user._sessionToken;
            user = JSON.stringify(user);
            res.cookie('user', user, {expires: new Date(Date.now() + 86400000)});
            res.send(Parse.User.current());
        });
    });

    app.get("/api/known/", function(req, res){
        //TODO: Fix known, wanted, owned, review
        var query = new Parse.Query(Submissions);
        query.include("secretID");
        query.equalTo("done", "yes");
        console.log(req.cookies.user);
        query.equalTo("userID", req.cookies.user);
        console.log(query.find());
        res.send(query.find());
    });

    app.get("/api/wanted/", function(req, res){
        var query = new Parse.Query(Submissions);
        query.include("secretID");
        query.equalTo("done", "ip");
        query.equalTo("userID", req.cookies.user);
        res.send(query.find());
    });

    app.get("/api/owned/", function(req, res){
        var query = new Parse.Query(Secret);
        query.equalTo("userID", req.user);
        res.send(query.find());
    });

    app.get("/api/review/", function(req,res){
        var query = new Parse.Query(Submissions);
        query.include("userID");
        query.equalTo("done", "ip");
        query.equalTo("ownerID", req.user);
        res.send(query.find());
    });

    app.delete("/api/secret/", function(req, res){
        res.send(req.body.secret.destroy());
    });

    app.post("/api/submission/approve", function(req,res){
        var query = new Parse.Query(Secret);
        var sub = req.body.sub;
        query.equalTo("objectId", sub.get("secretID").id);
        query.find().then(function(res){
            res[0].increment("completedCount");
            res[0].save();
        });

        sub.set("done", "yes");
        res.send(sub.save());
    });

    app.post("/api/submission/deny", function(req,res){
        var sub = req.body.sub;
        sub.set('done', 'no');
        res.send(sub.save());
    });

    app.get("/api/oauthCallback/", function(req, res){


        var req = http.get('https://foursquare.com/oauth2/access_token?client_id=15MIYO1ZBJHVKQOOJEPKR0DDL1N2BT20AETJCTU4LMF4QR2J'+
        '&client_secret=31SV4VGK5K5AHQIMTW1B0YVANQYMIEQA4ICVMB5EDIWOYKRA'+
        '&grant_type=authorization_code'+
        '&redirect_uri='+escape('http://secrets.ci.northwestern.edu')+
        '&code=' + req.body.code, function(res){
            console.log('res: '+res.body);
        }).on('error', function(e){
            console.log('got error: ' + e.mesage);
        });


        //store auth token in authToken table

        //wait and say if error or success

        //redirect
    })

};
