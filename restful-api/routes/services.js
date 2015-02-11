var Parse = require('parse').Parse;
var http = require('https');

var APP_ID = 'fp7oxuptKJ9ysesuXOeV4Ieul8ErSZklVwRslkJW';
var MASTER_KEY = 'HLpukqho21z1LaL7dUrPMRWI0jAu38NqmmL9qIfo';
Parse.initialize(APP_ID, MASTER_KEY);

function checkUser(req, res){
  if(req.cookies.user){
    console.log('logged in');
  }
}

module.exports = function (app) {

  //app.use(checkUser);
  var Secret = Parse.Object.extend("secrets");
  var Submissions = Parse.Object.extend("submissions");

  app.post("/api/secret", function (req, res){
    var sec = new Secret();
    res.send(sec.save(req.body));
  });

  app.get("/api/list", function(req, res){
    var query = new Parse.Query(Secret);
    res.send(query.find());
  });

  app.get("/api/secret/:id", function(req, res){
    var query = new Parse.Query(Secret);
    query.include("ownerID");
    res.send(query.get(req.params.id,{}));
  });

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

  app.post("/api/secret/", function(req,res){
    var sec = new Secret();
    sec.set("objectId", req.body.secret.id);
    sec.set("Name", req.body.user);
    sec.set("Secret", req.body.secret.title);
    sec.set("Category", req.body.secret.category);
    sec.set("secretLocation", req.body.secret.location);
    sec.set("Directions", req.body.secret.secret);
    sec.set("conditionForSharingWithSomeoneElse", req.body.secret.task);
    sec.set("Summary", req.body.secret.description);
    sec.set("Image", req.body.secret.image);
    sec.set("ownerID", req.body.user);
    sec.set("completedCount",0);
    sec.set("count", 0);

    res.send(sec.save());
  });

  app.post("/api/mapmyrun/", function (req, res){
    if(req.body.done){
      console.log('done');
      res.send({done:true});
    }
    else {
      console.log('not done');
      res.send({done:false});
    }
  });

  app.post("/api/login/", function(req, res){
    Parse.User.logIn(req.body.username, req.body.password, {}).then(function(data) {
      var user = JSON.stringify(Parse.User.current());
      res.cookie('user', user, {expires: new Date(Date.now() + 86400000)});
      res.send(Parse.User.current());
    });
  });

  app.get("/api/known/", function(req, res){
    var query = new Parse.Query(Submissions);
    query.include("secretID");
    query.equalTo("done", "yes");
    query.equalTo("userID", req.user);
    res.send(query.find());
  });

  app.get("/api/wanted/", function(req, res){
    var query = new Parse.Query(Submissions);
    query.include("secretID");
    query.equalTo("done", "ip");
    query.equalTo("userID", req.user);
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
