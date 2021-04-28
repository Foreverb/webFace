//websocket服务
let uuid = require('uuid');
let sha1 = require('sha1');
// let sha2 = require('sha2');
var CircularJSON = require('circular-json');
let https = require('https');
let fs = require('fs');
// let hostName = '192.168.31.69';
let hostName = '172.16.30.90';
// let hostName = '127.0.0.1';
let port = '8888';
let Frame = require('./Frame.js');

let keypath=process.cwd()+'/private.key';
let certpath=process.cwd()+'/mydomain.crt';
// console.log(keypath,certpath)
let options = {
 key: fs.readFileSync(keypath),
 cert: fs.readFileSync(certpath)
};
//存储用户信息
let socketStorage = {};
//在线用户列表
let onlineUserList = [];
//存储离线用户信息
let offLineUserList = {};
//视频通话的总时长(s);
let allTime = 0;
function EventEmitter() {
    this.events = {};
}
//绑定事件函数
EventEmitter.prototype.on = function(eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
};
//触发事件函数
EventEmitter.prototype.emit = function(eventName, _) {
    var events = this.events[eventName],
        args = Array.prototype.slice.call(arguments, 1),
        i, m;
    if (!events) {
        return;
    }
    for (i = 0, m = events.length; i < m; i++) {
        events[i].apply(null, args);
    }
};
let EventDeal = new EventEmitter();
/**
 *
 * @param {string} content 消息内容
 * @param {uid} from 发送者
 * @param {uid} to 接收方
 * @param {string} type 消息的类型
 */
function msgModel(content,from,to,type){
    let msg = {
        content ,
        from    ,
        to      ,
        type
    }
    return CircularJSON.stringify(msg);
    // return JSON.stringify(msg);
}
/**
 * 协议升级
 */
function upgradeProtocol(request, socket, head){
  console.log('协议升级:' , socket);
    // 取出浏览器发送的key值
    let secKey = request.headers['sec-websocket-key'];

    // RFC 6455规定的全局标志符(GUID)
    const UNIQUE_IDENTIFIER = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    // 计算sha1和base64值
    let shaValue = sha1(secKey + UNIQUE_IDENTIFIER),
        base64Value = Buffer.from(shaValue, 'hex').toString('base64');

    //向协议升级请求头里写入，协议升级成功
    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${base64Value}\r\n` + '\r\n'
      );
}

/**
 * 打印消息
 * @param {string} msg 将要打印的消息
 */
function log(msg){
    console.log( new Date().toLocaleString() + ' : ' + msg );
}
/**
 * 获取在线的用户
 */
function listenSocketStorageState(){
    onlineUserList = [];
    log('获取在线的用户')
    for(var item in socketStorage){
        onlineUserList.push(socketStorage[item]);
    }
    dispatchOnlineUserList(onlineUserList)
}
/**
 * 获取在线用户列表，并且发送
 */
function dispatchOnlineUserList(onlineUserList){
    for(var item in socketStorage){
        log('发送在线用户列表')
        if( socketStorage[item] ){
            socketStorage[item]&&socketStorage[item].socket.write(
              Frame.encodeDataFrame(
                {FIN:1,Opcode:1,PayloadData: msgModel(onlineUserList,'','','onlineUserList')}
              )
            );
        }
    }
}
//修改用户信息（用户操作
function updateUserInfo(data){
  let obj = data.from;
  //发送用户更新后的信息
  if( socketStorage[obj] ){
    socketStorage[obj].profile = data.content;
    let Info = socketStorage[obj].profile;
    socketStorage[obj].socket.write(
      Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(Info,'',obj,'userInfo')})
    );
  }
  //发送在线用户列表
  onlineUserList = [];
  for(var item in socketStorage){
      onlineUserList.push(socketStorage[item]);
  }
  dispatchOnlineUserList(onlineUserList);
}
//转发用户发送的消息
function assignChatMsg(data){
  let msg = data.date;
  let from = data.from;
  let to = data.to;
  if( data.to === 'public' ){
    for( var item in socketStorage ){
      if( item !== from && socketStorage[item].profile.isOpenPublic ){
            socketStorage[item]&&socketStorage[item].socket.write(
              Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(msg,-1,to,'chatMessage')})
            );
        }
    }
  }else{
    socketStorage[to]&&socketStorage[to].socket.write(
      Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(msg,from,to,'chatMessage')})
    );
  }
};
function refuseHim(data){
  let msg = data.date;
  let from = data.from;
  let to = data.to;
  let type = data.type;
  socketStorage[to]&&socketStorage[to].socket.write(
    Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(msg,from,to,type)})
  );
}
//拒绝视频通话
function RefuseVideo(data){
  let msg = data.date;
  let from = data.from;
  let to = data.to;
  let type = data.type;
  socketStorage[to]&&socketStorage[to].socket.write(
    Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(msg,from,to,type)})
  );
}
//挂断
function hangUp(data){
  let con = data.date;
  let msg = '通话已挂断，时长：'+allTime+'s';
  con.content = msg;
  let from = data.from;
  let to = data.to;
  let type = data.type;
  socketStorage[to]&&socketStorage[to].socket.write(
    Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(con,'server',to,type)})
  )
  socketStorage[from]&&socketStorage[from].socket.write(
    Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(con,'server',from,type)})
  )
}

function videoMsgModel(data){
  let msg = data.content;
  let from = data.from;
  let to = data.to;
  let type = data.type;
  socketStorage[to]&&socketStorage[to].socket.write(
    Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel(msg,from,to,type)})
  );
}
//转发用户视频聊天请求消息
function dispatchVideoMsg(data){
  videoMsgModel(data);
}
//同意视频聊天
function dispatchAgreeVideo(data){
  videoMsgModel(data);

}
//转发sdp信息
function sendSdpMsg(data){
  videoMsgModel(data);
}
//转发ice信息
function sendIceMsg(data){
  videoMsgModel(data);
}

//------------------------

//WSS 服务初始化函数  initSocket
function initSocket(req, socket, head, id){
  // 记录用户请求信息
  var Cookies = {};
  // console.log(req,req.headers,req.headers.cookie);
  req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
      var parts = Cookie.split('=');
      Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  //回应用户协议升级请求(https=>wss)
   upgradeProtocol(req, socket, head);
   //获取用户信息
   let user = generateUserProfile( id, Cookies, socket );
   //发送用户信息
   dispatchUserInfo(user,socket);
}
//检查用户是否在线
function checkOnlineUserIsActive(){
  log('定时检查在线用户列表')
  let now = new Date().getTime();
  for( var user in socketStorage ){
    if( now > socketStorage[user].profile.last_active_time ){
      //用户很久没响应了，已经离线
      log('用户很久没响应了，已经离线');
      moveUserToOffline(user);
    }else{
      //用户很活跃，没有离线
      log('发送ping消息给用户')
      pingUser(user);//发送ping消息给用户
    }
  }
}
let server=https.createServer(options, function (req, res) {});
//收到客户端发送过来的协议升级请求
server.on('upgrade', (request, socket, head)=>{
  console.log('http upgrade https');
    let id = uuid.v4();

    //服务端初始化websocket
    initSocket(request, socket, head, id);

    listenSocketStorageState();

    //服务端接收数据侦听
    socket.on('data',buffer=>{
      if( Frame.decodeDataFrame(buffer).Opcode === 8 ){
          socket.end();
          delete socketStorage[id];
          return
      }
      let data = JSON.parse(Frame.decodeDataFrame(buffer).PayloadData);
      EventDeal.emit(data.type,data);
    })
})
//发送ping消息
function pingUser(uid){
  if( socketStorage[uid] ){
    socketStorage[uid].state = 'PING';
    socketStorage[uid].socket.write(Frame.encodeDataFrame({FIN:1,Opcode:1,PayloadData: msgModel('PING','',uid,'__PING')}))
  }
}
//将用户移入离线用户列表
function moveUserToOffline(uid){
  console.log('用户' + uid +'已离线');
  offLineUserList[uid] = socketStorage[uid];
  // console.log('离线用户列表'+offLineUserList)

  socketStorage[uid].socket.end();
  delete socketStorage.uid;

}
//设置用户活跃时间
function updateUserActiveTime( uid ){
  console.log('用户' + uid + '在线')
  //获取当前时间
  let now = new Date().getTime();
  let Active_time = now + (20*1000);
  //更新用户活跃时间
  socketStorage[uid].profile.last_active_time = Active_time;
}
//根据用户信息所在位置返回用户信息(在线用户列表，离线用户列表)
function generateUserProfile( id, cookie, Socket ){
  console.log(cookie);
  for( var item in cookie ){

    if( offLineUserList[item] ){
      //如果用户信息在[离线用户列表]
      console.log('offline如果用户信息在[离线用户列表]')
      offLineUserList[item].socket = Socket;
      socketStorage[item] = offLineUserList[item];
      //更新用户活跃时间
      updateUserActiveTime( item );
      delete offLineUserList[item];
      return socketStorage[item].profile;

    }else if( socketStorage[item] ){

      //如果用户信息在[在线用户列表]
      console.log('online如果用户信息在[在线用户列表]')
      socketStorage[item].socket = Socket;
      //更新用户活跃时间
      updateUserActiveTime( item );
      return socketStorage[item].profile;

    }
  }
    //发送用户信息
    let nick = id.substr(0,11);
    //初始化用户信息
    socketStorage[id] = {
      state : 'INIT', //INIT PING PONG
      profile : {
        id : id,
        nick : nick,
        ava : 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1031616880,656595316&fm=26&gp=0.jpg',
        isOpenPublic : true,
        last_active_time : new Date().getTime()+(20*1000),
      },
      socket : Socket,
    }
    return info = socketStorage[id].profile;
}
//分配用户信息
function dispatchUserInfo(user,socket){
  socket.write(Frame.encodeDataFrame(
    {FIN:1,Opcode:1,PayloadData: msgModel(user,'','','userInfo')}
  ));
}
/**
 * 处理接收到的PONG消息,更新在线用户状态
 * @param {uid}  id 用户的id
 */
function disposePongMsg(data){
    log('接收到PONG消息')
    let id = data.from;
    socketStorage[id].state = 'PONG';

    //更新用户活跃时间
    updateUserActiveTime( id )
}
// setInterval(()=>{dispatchPingMsg()},120*1000);
setInterval(function(){checkOnlineUserIsActive()},10*1000)
// ---------------------------
var timer = null;
EventDeal.on('updateProfile',(data)=>{
  updateUserInfo(data);
});
EventDeal.on('PONG',(data)=>{
  disposePongMsg(data);
});
EventDeal.on('chatMessage',(data)=>{
  assignChatMsg(data);
})
EventDeal.on('videoRquest',(data)=>{
  dispatchVideoMsg(data);
});
EventDeal.on('agreeVideo',(data)=>{
  dispatchAgreeVideo(data);
  timer = null;
  allTime = 0;
  timer = setInterval(()=>{
    allTime++;
  },1000)
});
EventDeal.on('hangUp',(data)=>{
  hangUp(data);
  clearInterval(timer);
});
EventDeal.on('changeSdpMsg',(data)=>{
  sendSdpMsg(data);
});
EventDeal.on('refuseVideo',(data)=>{
  RefuseVideo(data);
});
EventDeal.on('refuseHim',(data)=>{
  refuseHim(data);
});
EventDeal.on('changeIceMsg',(data)=>{
  sendIceMsg(data);
});
server.listen(port,hostName,()=>{console.log(`Server runing at ${hostName}:${port}`)})
