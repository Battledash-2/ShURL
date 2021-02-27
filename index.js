const port = 80;

const express = require("express");
const app = express();

const request = require('request');
const jsondb = require('simple-json-db');
const db = new jsondb('data/redirects.json');

app.set("views", express.static(__dirname+"/pages"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(express.static(__dirname+"/static"), express.Router(), express.urlencoded());
app.get('/create', (req,res)=>{
    res.render(__dirname+'/pages/create.ejs', {
        e: req.query.error || ""
    });
});
app.get('/create/success', (req,res)=>{
    res.render(__dirname+'/pages/success.ejs', {
        be: req.query.be || '',
        rd: req.query.rd || ''
    });
});
app.post('/create/finish', (req,res)=>{
    try {
        if((req.body.backend != null && req.body.backend.trim() != "") && (req.body.redirect != null && req.body.redirect.trim() != "")) {
            // success! values are set!
            let back = req.body.backend;
            let redi = req.body.redirect;
            if(back.includes('/')) return res.redirect('/create?error=Backend cannot include slashes');
            if(db.has(back) || back.toLowerCase().startsWith('create') || back.trim() == '') return res.redirect('/create?error=That backend is taken or unavailable');

            db.set(back, redi);
            return res.redirect('/create/success?be='+encodeURIComponent(back)+'&rd='+encodeURIComponent(redi));
        } else {
            res.redirect('/create?error=Missing values');
        }
    } catch(e) {
        res.redirect('/create?error=Missing values');
    }
});
app.get('/create/oops', (req,res)=>{
    res.render(__dirname+'/pages/oops.html');
});
app.get('/*', (req,res)=>{
    let s = req.url.substring(1).split('/');
    let part = s[0];

    // console.log(part, db.JSON().hasOwnProperty(part));
    if(db.JSON().hasOwnProperty(part)) {
        s.shift();
        res.redirect(db.get(part)+'/'+s.join('/'));
        // console.log(db.get(part)+'/'+s.join('/'));
    } else {
        res.sendFile(__dirname + '/pages/oops.html');
    }
});

app.listen(port, ()=>console.log("[Server] Listening on port :"+port));