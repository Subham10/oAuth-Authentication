var http = require('http');
var qs = require('querystring');
var utility=require('./utility');
var request=require('superagent');
var clientID = 'YOUR_CLIENT_ID';
var clientSecret = 'YOUR_CLIENT_SECRET';
var redirect_uri= 'http://your_ipaddress:8082/auth/github/callback'
http.createServer(function (req, res) {
    var p = req.url.split('/');
    pLen = p.length;
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
         return;
    }
    var loginURL='https://github.com/login/oauth/authorize';
    var authURL=utility.getAuthorizedUrl(loginURL,{
                  client_id:clientID,
                  redirect_uri: redirect_uri,
                  scope: ['repo', 'user'],
                  state: 'example return string'
    });
/** 
* Creating an anchor with authURL as href and sending as response
*/
    var body = '<a href="' + authURL + '"> Get Code </a>';
    if (pLen === 2 && p[1] === '') {
        res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' });
        res.end(body);
    } else if (pLen === 4 && p[1].indexOf('auth') === 0) {
        /** Github sends auth code so that access_token can be obtained */
        var qsObj = {};
        /** To obtain and parse code='...' from code?code='...' */
        qsObj = qs.parse(p[3].split('?')[1]);
        var url='https://github.com/login/oauth/access_token?client_id='+clientID+'&redirect_uri='+redirect_uri+'&client_secret='+clientSecret+'&code='+qsObj.code;
        request
        .post(url)
        .end(function(err, result) {
            var start=result.text.indexOf('=');
            var end=result.text.indexOf('&');
            var userURL='https://api.github.com/user?access_token='+result.text.substring(start+1,end);
            request.get(userURL, function(err, result){
                if (err) throw err;
                console.log(result.text);
                res.end(result.text);
            });
        });

    } else {
        // Unhandled url
        console.log("Unhandled URL");
        res.end("Unhandled URL");
    }
}).listen(8082);