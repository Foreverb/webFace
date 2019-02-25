//正在视频通话的页面
import React, { Component } from 'react';
import '../css/onVideo.css';
import ChatClient from '../ChatClient';

class OnVideo extends Component{
  constructor(props){
    super(props);
    // ChatClient.localRef = React.createRef();
    // ChatClient.remoteRef = React.createRef();
  }
  render(){
    return(
      <div className='wrap'>
        <video className='localVideo' autoPlay='autoPlay' alt=''></video>
        <div className='remote'>
          <video className='remoteVideo' autoPlay='autoPlay' alt=''></video>
        </div>
        <div className='states'>
          <img className='hangup' src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/break.png'
          alt='' onClick={()=>{this.hangUpVideo()}}/>
        </div>
      </div>
    )
  }
  hangUpVideo(){
    let {chatModePid,profile} = this.props;
    let {id,ava} = profile;
    let content = JSON.stringify({date:{content:'',src:ava},from:id,to:chatModePid,type:'hangUp'});
    ChatClient.socket.send(content);
  }
}
export default OnVideo;
