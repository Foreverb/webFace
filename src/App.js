import React, { Component } from 'react';
import './App.css';
import './iconfont.css'
import Information from './Components/information';
import PublicWrap from './Components/publicWrap';
import RightTop from './Components/rightTop';
import RightBottom from './Components/rightBottom';
import Item from './Components/userItem';
import ChatClient from './ChatClient';
// import FileUpload from './fileUpload';
import Mask from './Components/mask';
import VideoWate from './Components/videoWate';
import OnVideo from './Components/onVideo';
import BreakLine from './Components/breakLine';
// import './ReconnectingWebSocket';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      profile : {                     //用户信息对象
        ava          :   '',          //用户头像路径
        nick         :   '',          //用户昵称
        id           :   '',          //用户id
        isOpenPublic :   true,       //用户是否开启了公共频道
      },
      onlineUserList :   [],          //  在线用户列表
      chatRecode     :    {           //用户的聊天记录
        //其中的每一项都是由 uid:[]组成，数组中的每一项都是一个标准的messageModel
      },
      chatInputStaging:   {           //输入框暂存区
        //其中的每一项都是由 uid:{string}组成
      },
      isFaceTime     :   false,       //用户是否正在视频聊天
      waitVideo      :   false,       //  用户是否为等待界面
      videoMsg       :   false,       //  是否显示视频聊天消息（当接收到视频通话请求时，变为true）
      videoReqInfo   : null,           //视频聊天请求方的信息
      chatModePid    :   -1,          //正在聊天的模式(公聊，私聊)
      onclose        :  false,        //  断开连接
      breakLine      :  false,        //  断线重连界面
    }
  }
  componentWillMount(){
    //测试代码
    window.test_updateProfile = ()=>{
        // let {profile} = this.state;
        // 测试提交，昵称
        // profile.nick='杨古波';
        //关闭公共频道
        // profile.isOpenPublic=false;
        //修改头像
        // profile.ava='./img/public.png';
        // this.setState( {profile} )
        // this.setState({chatModePid:'865755342315476'});
        //是否正在视频通话
        // this.setState({isFaceTime:true});
        //等待视频通话界面
        // this.setState({waitVideo:true});
        //接收视频聊天消息
        // this.setState({videoMsg:true});
        // this.setState({breakLine:true});
    }
    //初始化socket
    // ChatClient.initSocket('wss://192.168.31.69:8888',ReconnectingWebSocket);
    ChatClient.initSocket('wss://172.16.30.90:8888');
    ChatClient.socket.onclose = (e)=>{
      console.log('socket 关闭');
      this.setState({breakLine:true,onclose:true});
    }
    ChatClient.socket.onopen = (e)=>{
      console.log('socket 开启');
      this.setState({breakLine:false,onclose:false})
    }
    ChatClient.on('userInfo',(data)=>{
      let profile = data.content;
      let {id} = profile;
      ChatClient.setCookieUid(id,id);
      this.setState({profile});
    })
    ChatClient.on('onlineUserList',(data)=>{
      let list = data.content;

        let {chatModePid} = this.state;

        let arr = [];
        for(var i=0;i<list.length;i++){
          arr.push(list[i].profile.id);
        }

        list.forEach((item,index)=>{
          if( arr.indexOf(chatModePid) === -1 ){
            this.setState({chatModePid:-1,isFaceTime:false,videoMsg:false,waitVideo:false})
          }
        })

      this.setState({onlineUserList:list});
    })
    ChatClient.on('chatMessage',(data)=>{
      //处理消息
      this.putMsg(data);
      //
      this.changeChatObj(data.from);
    })
    //挂断
    ChatClient.on('hangUp',(data)=>{
      console.log('挂断');
      this.setState({isFaceTime:false,videoMsg:false});
      ChatClient.pc.close();
      ChatClient.pc = null;
      ChatClient.localStream = null;
      this.putMsg(data);
      this.changeChatObj(data.from);
    })
    //拒绝
    ChatClient.on('refuseVideo',(data)=>{
      this.setState({waitVideo:false,isFaceTime:false});
      this.putMsg(data);
      this.changeChatObj(data.from);
    })
    //
    ChatClient.on('refuseHim',(data)=>{
      this.setState({videoMsg:false});
      this.putMsg(data);
      this.changeChatObj(data.from);
    })
    //更新头像
    ChatClient.on('updateProfile',(profile)=>{
      this.setState({profile});
    })
    //发起视频通话
    ChatClient.on('videoRquest',(data)=>{
      let info = data.content;
      let {id} = info;
      this.setState({videoMsg:true,videoReqInfo:info,chatModePid:id});
      ChatClient.mediaStreamTrack && ChatClient.mediaStreamTrack.stop();
    })
    //接受视频通话
    ChatClient.on('agreeVideo',(data)=>{
      let {profile,chatModePid} = this.state;
      let {id} = profile;
      let socket = ChatClient.socket;

      this.setState({waitVideo:false,isFaceTime:true});
      let localVideo = document.getElementsByClassName('localVideo')[0];
      // console.log(localVideo,ChatClient.localStream);
      localVideo.srcObject = ChatClient.localStream;

      ChatClient.pc.createOffer((sdp)=>ChatClient.changeSdpMsg(socket,id,chatModePid,sdp),ChatClient.handleError);
    })
    //交换sdp信息
    ChatClient.on('changeSdpMsg',(data)=>{
      console.log('接收到对方sdp')
      let {profile,chatModePid} = this.state;
      let {id} = profile;
      ChatClient.SetRemoteDescription(data,()=>{ChatClient.onAnswercandidate(id,chatModePid)});
    })
    //交换ice信息
    ChatClient.on('changeIceMsg',(data)=>{
      let candidate = data.content;
      console.log('接收到candidate ，本地添加 candidate')
      // console.log(candidate);
      if( candidate !== null ){
          ChatClient.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    })
    //接受ping
    ChatClient.on('__PING',()=>{
      let profile = this.state;
      let {id} = profile.profile;
      ChatClient.socket.send(ChatClient.msgModel('PONG',id, '', 'PONG'));
    });
    //接收到消息
    ChatClient.socket.onmessage = function(events){
      let data = JSON.parse(events.data);
      ChatClient.emit(data.type,data);
    }
  }

  //切换是否接收公共聊天消息
   publicSwitchChange() {
     let { profile } = this.state;
     let {id} = profile;
     profile.isOpenPublic = !profile.isOpenPublic;
     //mock模拟代码
     // ChatClient.switchPublic(profile).then(profile=>{
     //   let con = profile.content;
     //   ChatClient.emit('updateProfile',con);
     // });
     //真实代码
     let model = {content:profile,from:id,to:'',type:'updateProfile'};
     ChatClient.socket.send(JSON.stringify(model));
   }
   //修改昵称
   changeNick(nick){
     let { profile } = this.state;
     let {id} = profile;
     profile.nick = nick;
     //mock模拟代码
     // ChatClient.updateNick(profile).then(profile=>{
     //   let con = profile.content;
     //   ChatClient.emit('updateProfile',con);
     // });
     //真实代码
     let model = {content:profile,from:id,to:'',type:'updateProfile'};
     ChatClient.socket.send(JSON.stringify(model));
   }
   //修改头像
   changeAvatar(src){
     let { profile } = this.state;
     let {id} = profile;
     profile.ava = src;
     //mock模拟代码
     // ChatClient.updateAvater(profile).then(profile=>{
     //   let con = profile.content;
     //   ChatClient.emit('updateProfile',con);
     // });
     //真实代码
     let model = {content:profile,from:id,to:'',type:'updateProfile'};
     ChatClient.socket.send(JSON.stringify(model));
   }
   //发送消息
   sendMsg(msg){
     let {profile,chatRecode,chatModePid} = this.state;
     let {id,ava} = profile;
     //存储聊天记录
     chatRecode[chatModePid] = chatRecode[chatModePid] || [];
     chatRecode[chatModePid].push(msg);
     this.setState({chatRecode});
     //mock模拟代码
     // ChatClient.onMessage(profile,chatModePid).then((data)=>{
     //   ChatClient.emit('chatMessage',data);
     // });
     //真实代码
     let model;
     if( chatModePid === -1 ){
       model = {date:{content:msg,src:ava},from:id,to:'public',type:'chatMessage'};
     }else{
       model = {date:{content:msg,src:ava},from:id,to:chatModePid,type:'chatMessage'};
     }
     ChatClient.socket.send(JSON.stringify(model));
   }
  //接收到消息后的事件处理函数
  putMsg(data){
    let {chatRecode} = this.state;
    let id = data.from;
    chatRecode[id] = chatRecode[id] || [];
    chatRecode[id].push(data);
    // console.log(data);
    this.setState({chatRecode});
  }
  //接收到消息需要同步处理的事件
  changeChatObj(data){
    // let {chatModePid} = this.state;
    // let {from} = data;
    this.setState({chatModePid:data});
  }
  //切换私聊
  praviteModePid(uid) {
    console.log('聊天对象'+uid);
    this.setState({ chatModePid:uid });
  }
  //切换公聊
  publicModePid() {
    this.setState({ chatModePid: -1 });
  }
  render() {
    let {
      profile,
      onlineUserList,
      chatModePid,
      chatRecode,
      isFaceTime,
      waitVideo,
      videoMsg,
      videoReqInfo,
      onclose,
      breakLine
    } = this.state;
    let {isOpenPublic} = profile;
    // console.log(onlineUserList.profile);
    return (
      <div>
      {
        waitVideo ? <VideoWate onClick={()=>this.backMain()}/> : isFaceTime ? <OnVideo chatModePid={chatModePid} profile={profile}/> : <div className="App">
          {
            breakLine ? <BreakLine/> : null
          }
          <div className='left'>
            <Information profile={profile} onClick={(nick)=>{this.changeNick(nick)}}
            updateAvatar={(src)=>{this.changeAvatar(src)}} chatModePid={chatModePid}
            onclose={onclose}/>
            <div className='public' onClick={()=>{this.publicModePid()}}>
              <PublicWrap  tip='开启/关闭公共聊天模式' chatModePid={chatModePid}
               onchange={()=>{this.publicSwitchChange()}} isOpenPublic={isOpenPublic}/>
            </div>
            <div className='userList'>
            {
              onlineUserList && onlineUserList.map(user => <Item profile={user.profile} key={user.profile.id }
              isActive={user.profile.id === chatModePid} onChage={()=>{this.praviteModePid(user.profile.id)}}/>)
            }
            </div>
          </div>
          <div className='right'>
            {
              chatModePid===-1 && !isOpenPublic ? <Mask/> : null
            }
            <RightTop chatModePid={chatModePid} chatRecode={chatRecode}
            onlineUserList={onlineUserList} profile={profile} videoMsg={videoMsg}
            videoReqInfo={videoReqInfo} agreeVideo={()=>{this.setOnVideo()}}
            onclose={onclose}/>
            <RightBottom onSendMsg={(msg)=>{this.sendMsg(msg)}}
            startRtc={()=>this.belongFaceTime()} chatModePid={chatModePid} profile={profile}
            uploadFile={(str)=>{this.fileUpload(str)}} isFaceTime={isFaceTime}/>
          </div>
        </div>
      }
      </div>
    );
  }
  //进入视频聊天
  setOnVideo(){
    this.setState({isFaceTime:true});
  }
  //文件上传
  fileUpload(str){
    let {chatRecode,chatModePid} = this.state;
    //存储聊天记录
    chatRecode[chatModePid] = chatRecode[chatModePid] || [];
    chatRecode[chatModePid].push(str);
    this.setState({chatRecode});
  }
  //开始视频通话(1)
  belongFaceTime(){
    // console.log(ChatClient.localStream);
    this.setState({waitVideo:true});
  }
  //退出等待界面，返回主界面
  backMain(){
      this.setState({waitVideo:false})
  }
}

export default App;
