//接收视频通话的消息
import React, { Component } from 'react';
import '../css/getVideo.css';
import ChatClient from '../ChatClient';

class GetVideoMsg extends Component{
  render(){
    let {videoReqInfo,chatModePid,id,src} = this.props;
    // console.log(videoReqInfo);
    let {ava,nick} = videoReqInfo;
    let socket = ChatClient.socket;
    return(
      <div className='leftWrap'>
        <img src={ava} className='leftAvater' alt=''/>
        <div className='leftMsg'>
          <p className='title'>是否接收来自于{nick}的视频通话</p>
          <div className='change'>
            <span className='disagree' onClick={()=>{this.refuse(socket,id,chatModePid,src)}}>❌</span>
            <span className='agree' onClick={()=>{this.startRtc(socket,id,chatModePid)}}>✔️</span>
          </div>
        </div>
      </div>
    )
  }
  //拒绝视频通话
  refuse(socket,id,chatModePid,src){
    // let data = JSON.stringify({date:{content:'对方拒绝视频通话',src:src},from:id,to:chatModePid,type:'refuseVideo'});
    // socket.send(data);
    let data2 = JSON.stringify({date:{content:'您拒绝视频通话',src:src},from:chatModePid,to:id,type:'refuseHim'});
    socket.send(data2);
  }
  //交换sdp信息
  sendSdpMsgFun(sdp){
    let {chatModePid,id} = this.props;

    console.log('接收方：设置自身  description ')
    ChatClient.pc.setLocalDescription(sdp);

    let data = ChatClient.msgModel(sdp,id,chatModePid,'changeSdpMsg')
    ChatClient.socket.send(data);
  }

  startRtc(socket,id,chatModePid){

    let _this = this;
    console.log('视频聊天对象'+chatModePid);
    let content = JSON.stringify({content:'同意视频通话',from:id,to:chatModePid,type:'agreeVideo'});
    socket.send(content);
    let {agreeVideo} = this.props;
    agreeVideo && agreeVideo();

    ChatClient.start(function(){
        console.log('接收方添加视频流',ChatClient.localStream);
        ChatClient.pc.addStream(ChatClient.localStream);

        console.log('接收方：创建 answer')
        ChatClient.pc.createAnswer((sdp)=>_this.sendSdpMsgFun(sdp),ChatClient.handleError);
    })
  }
}
export default GetVideoMsg


//问题：接收方没有收到发起方的iceCandidate信息
