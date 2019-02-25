/**
 * 文件处理服务器
 */

let express = require("express");
let app = express();
// 移动文件需要使用fs模块
let fs = require('fs');
let https = require('https');
let http = require('http');
let multer  = require('multer');//用express的第三方中间件 multer 实现文件上传功能。

const hostName = '140.82.16.201';
// const hostName = '192.168.31.69';
var SSLPORT = '19999';

let keypath=process.cwd()+'/server.key';
let certpath=process.cwd()+'/server.crt';
let options = {

  key: fs.readFileSync(keypath),
 cert: fs.readFileSync(certpath)

};

let httpsServer = https.createServer(options, app);


//中间件

let upload = multer({dest:"file/images"});
//允许跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// upload.single('thumbnail'),接受一个以 thumbnail 命名的文件。这个文件的信息保存在 req.file。

 app.post('/xxxx',upload.single('thumbnail'),function(req, res) {
  //  console.log(req.file);
   let {path,originalname} = req.file;

   let ext = (originalname).split('.')[1];

     fs.rename(path, path+'-'+ext, (err) => {
    //  fs.rename(path, path+'-'+encodeURIComponent(originalname), (err) => {
      if (err) throw err;
      console.log('Rename complete!');
      res.send( 'https://'+hostName + ":" + SSLPORT + '/' + path+'-'+ext );
     });
  });

  app.get('/file/images/*',function(req,res){
    // console.log(req,req.path);
    fs.readFile('/Users/lyn/Desktop/test/webFace/newWebsocket/fs' + req.path,'binary',(err, file)=>{
      // fs.readFile('/root/test/webFace/webFace/newWebsocket/fs' + req.path,'binary',(err, file)=>{
      if (err) throw err;
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.write(file,'binary');
      res.end();
    })
  });

  httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: ', SSLPORT);
  });
