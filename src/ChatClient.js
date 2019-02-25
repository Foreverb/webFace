window.Mock = true;
//调用函数，与服务端进行交互
class ChatClient {
  emjoi = [
    './emoji/1.png','./emoji/2.png','./emoji/3.png',
    './emoji/4.png','./emoji/5.png','./emoji/6.png',
    './emoji/7.png','./emoji/8.png','./emoji/9.png',
    './emoji/10.png','./emoji/11.png','./emoji/12.png',
    './emoji/13.png','./emoji/14.png','./emoji/15.png',
    './emoji/16.png','./emoji/17.png','./emoji/18.png',
    './emoji/19.png','./emoji/20.png','./emoji/21.png',
    './emoji/22.png','./emoji/23.png','./emoji/24.png',
    './emoji/25.png','./emoji/26.png','./emoji/27.png',
    './emoji/28.png','./emoji/29.png','./emoji/30.png',
    './emoji/31.png','./emoji/32.png','./emoji/33.png',
    './emoji/34.png','./emoji/35.png','./emoji/36.png',
    './emoji/37.png','./emoji/38.png','./emoji/39.png',
    './emoji/40.png'
  ];
  Code = [
    '[e:~]','[e:!]','[e:@]','[e:#]','[e:$]',
    '[e:%]','[e:^]','[e:&]','[e:*]','[e:(]',
    '[e:)]','[e:Q]','[e:W]','[e:E]','[e:R]',
    '[e:T]','[e:Y]','[e:U]','[e:I]','[e:O]',
    '[e:P]','[e:A]','[e:S]','[e:D]','[e:F]',
    '[e:G]','[e:H]','[e:J]','[e:K]','[e:L]',
    '[e:Z]','[e:X]','[e:C]','[e:V]','[e:B]',
    '[e:N]','[e:M]','[e:<]','[e:>]','[e:?]'
  ];
  faceLibary = {'[文件]':'./img/file.png'}

  //获取当前光标位置
   getCursortPosition(element) {
      var caretOffset = 0;
      var doc = element.ownerDocument || element.document;
      var win = doc.defaultView || doc.parentWindow;
      var sel;
      if (typeof win.getSelection != "undefined") {//谷歌、火狐
        sel = win.getSelection();
        if (sel.rangeCount > 0) {//选中的区域
          var range = win.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();//克隆一个选中区域
          preCaretRange.selectNodeContents(element);//设置选中区域的节点内容为当前节点
          preCaretRange.setEnd(range.endContainer, range.endOffset);  //重置选中区域的结束位置
          caretOffset = preCaretRange.toString().length;
        }
      } else if ((sel = doc.selection) && sel.type != "Control") {//IE
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
      }
      return caretOffset;
    };

    //设置光标位置
    setCaretPosition(element, pos) {
        var range, selection;
        if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
          range = document.createRange();//创建一个选中区域
          range.selectNodeContents(element);//选中节点的内容
          if(element.innerHTML.length > 0) {
            try {
              range.setStart(element.childNodes[0], pos); //设置光标起始为指定位置
            } catch (error) {
              console.log('....');
            }
          }
          range.collapse(true);       //设置选中区域为一个点
          selection = window.getSelection();//获取当前选中区域
          selection.removeAllRanges();//移出所有的选中范围
          selection.addRange(range);//添加新建的范围
        }
        else if (document.selection)//IE 8 and lower
        {
          range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
          range.moveToElementText(element);//Select the entire contents of the element with the range
          range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
          range.select();//Select the range (make it the visible selection
        }
      };

    servers = {
      "iceServers": [
          {
              "url": "stun:stun.l.google.com:19302"
          },{
            'url': 'stun:stunserver.org'
          },{
            'url': 'stun:stun.softjoy.com'
          },{
            'url': 'stun:stun.voiparound.com'
          },
          {
          'url':'turn:127.0.0.1',
          'credential': 'ling1234',
          'username': 'ling'
          }
        ]
      };
      timer = null;
  //在线用户列表
  onlineUserList = [];
  /**
  * 当前和服务端的连接是否正常
  * 如果一段时间没有收到服务器的消息，或者 socket 对象主动抛出了 onclose，则此值会被重设
  */
  isOnline = false;
  /**
  * 通过new websocket()实例化出的对象
  * 供客户端与服务端交互
  */
  socket = null;
  /**
  * 初始化websocket
  * socket对象
  * 连接socket服务器、设置 socket 对象
  */
  initSocket(host){
    // return this.socket = new reconnectingWebSocket(host);
    return this.socket = new WebSocket(host);
  }
  //消息模型，需要发送给服务端的消息
  msgModel(content,from,to,type){
    let msg = {
        content ,
        from    ,
        to      ,
        type
    }
    return JSON.stringify(msg);
  }
  /**
  * 是一个供我们视频聊天的通道，需要通过new RTCPeerConnection来实例化
  */
  pc = new RTCPeerConnection(this.servers)
  /**
  * 存储本地视频流
  */
  localStream = null;
  //关闭摄像头
  mediaStreamTrack = null;
  /**
  * 存储对方视频
  */
  RemoteStream = null;

  //本地视频流显示标签
  // localRef = '';
  //远程视频流显示标签
  // remoteRef = '';

  /**
  * 存放自定义事件和自定义事件对应事件处理函数
  */
  events = {};
  //事件列表库
  EventLibrary = {
    userInfo : [],
    onlineUserList : [],
    chatMessage : [],
    updateProfile : [],
    __PING : [],
    videoRquest : [],
    changeSdpMsg : [],
    changeIceMsg : []
  };
  /**
  * 设置一个消息事件侦听
  */
  on(eventName,callback){
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  }

  /**
  * 触发通过on绑定的事件
  */
  emit(eventName, _){
    let events = this.events[eventName];
    let args = Array.prototype.slice.call(arguments, 1);
    if( !events ){
        return;
    }
    for(let i = 0,m = events.length;i < m;i++){
        events[i].apply(null, args);
    }
  }
  /**
  * 更新昵称
  * {newNick} 新的昵称(string)
  */
  updateNick(data){
    //模拟代码
    let id = data.id;
    let model = {content:data,from:id,to:'',type:'updateProfile'};
    return new Promise((res)=>{
      setTimeout(function(){
          res(model);
      },2000)
    });
  }

  /**
  * 更新头像
  * {avaSrc} 新的图片路径，通过文件处理服务器返回
  */
  updateAvater(data){
    //模拟代码
    let id = data.id;
    let model = {content:data,from:id,to:'',type:'updateProfile'};
    return new Promise((res)=>{
      setTimeout(function(){
          res(model);
      },2000)
    })
  }

  /**
  * 更新公共频道开关状态
  * {status} 开关的状态(Boolean)
  */
  switchPublic(data){
    //模拟代码
    let id = data.id;
    let model = {content:data,from:id,to:'',type:'updateProfile'};
    return new Promise((res)=>{
      setTimeout(function(){
          res(model);
      },2000)
    })
  }
  //接收消息
  onMessage(profile,chatModePid){
    let to = profile.id;
    return new Promise((resolve,reject)=>{
      let msg = JSON.stringify({
        content:{
          msg:'hello你好[文件]',
          id:chatModePid,
          ava:'./img/emjoi.png',
          isOpenPublic:true,},
          from:chatModePid,
          to:to,
          type:'chatMessage'
        })
      resolve(msg);
    })
  }

// ------------ 视频聊天区 ----------------

  //存储本地视频流,并显示
  goStream (stream,callBack) {
    console.log("Received local stream",stream);

    this.mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[1]
    let localVideo = document.getElementsByClassName('localVideo')[0];
    console.log("显示本地视频流",localVideo,stream);
    localVideo.srcObject = stream;
    //存储视频流
    this.localStream = stream;
    callBack && callBack();
  }
  handleError(){console.log('handleError')};
  //请求开启本地摄像头，并存储视频流
  start(callBack) {
    console.log("Requesting local stream");
    let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    getUserMedia.call(navigator, {
            // audio: true,
            video: true
        },(stream)=>{
            this.goStream(stream,callBack);
        },(error)=>{
            console.log("getUserMedia error: ", error);
        });
  };
  //接收方设置icecandidate
  onAnswercandidate(id,chatModePid){
    let _this = this;
      console.log('设置完成后，设置 onicecandidate');

      this.pc.onicecandidate = function(event){
          let content = _this.msgModel(event.candidate,id,chatModePid,'changeIceMsg');
          _this.socket.send(content);
      }
  }
  //设置远程sdp信息
  SetRemoteDescription(data,callBack){
    console.log('设置远程 description')
    this.pc.setRemoteDescription(data.content);
    //设置当接收到视频流时：回调
    this.pc.onaddstream = (event)=>{
      //接收offer方的视频流，并显示出来

      console.log("Received remote stream");

      let stream = event.stream;

      //显示对方视频流
      console.log('显示发起方视频流',stream)
      let remoteVideo = document.getElementsByClassName('remoteVideo')[0];
      remoteVideo.srcObject = stream;
    };
    callBack();
  }
  changeSdpMsg(socket,from,to,sdp){
    let that = this;
    console.log('发起方：设置自身  description ')
    this.pc.setLocalDescription(sdp);

    let data = JSON.stringify({content:sdp,from,to,type:'changeSdpMsg'});
    // console.log(isFaceTime);
    socket.send(data);

    this.pc.onicecandidate = function(event){
        let content = that.msgModel(event.candidate,from,to,'changeIceMsg');
        that.socket.send(content);
    }
  }
  //设置cookie值
  setCookieUid(name,value){
      var Days = 1;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days*24*60*60*1000);
      document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
  }
  //获取cookie值
  getCookie(name){

      var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)"); //正则匹配
      if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
      }
      else{
       return null;
      }
  }

}
export default new ChatClient();
