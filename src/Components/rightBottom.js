//右下发送消息区域
import React, { Component } from 'react';
import '../css/rightBottom.css';
import ChatClient from '../ChatClient';
import FileUpload from '../fileUpload';
import Emjoi from './emjoi';
class RightBottom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cls_icon: ['iconCard'],
      isClick: true,
    }
  }
  render() {
    let { cls_icon, isClick } = this.state;
    let { chatModePid, profile, uploadFile } = this.props;
    let { id, ava } = profile;
    let socket = ChatClient.socket;
    cls_icon = cls_icon.join(' ');
    return (
      <div className='rightBottom'>
        <div className='statusCard'>
          <div className='emjoi'>
            <div className="point"></div>
            <img src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/emjoi.png' className='Emjoi' alt='' onClick={() => this.showEmjoi()} />
            <div className={cls_icon}><Emjoi closeEmjoi={(data) => this.closeEmjoi(data)} /></div>
          </div>
          <div className='file'>
            <img src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/file.png' className='File' alt='' />
            <form encType="multipart/form-data" id='fileIpt'>
              <input type='file' className='fileBtn' required name="thumbnail" onClick={(e) => { this.uploadFile(e.target, id, chatModePid, socket, profile, uploadFile) }} />
            </form>
          </div>
          {
            chatModePid !== -1 ? <div className='rtc' onClick={() => { this.startRtc() }}>
              <img src='https://www.easyicon.net/api/resizeApi.php?id=1136097&size=128' className='Rtc' alt='' />
            </div> : null
          }
        </div>
        <div className='input' onClick={(e) => { this.startSendMsg(e) }}
          onKeyDown={(e) => { e.keyCode === 13 && this._enterSend(e) }}></div>
        <div className='send'>
          <p className='tip'>按下 Ctrl + Enter 换行 </p>
          <button className='btn' onClick={() => this._startSend()}>发送</button>
        </div>
      </div>
    )
  }
  //根据isClick判断emjio是否显示
  judgeEmjoiShowOrClose() {
    if (this.state.isClick) {
      this.setState({ cls_icon: ['iconCard', 'show'] })
    } else {
      this.setState({ cls_icon: ['iconCard'] })
    }
  }
  //打开emjio
  showEmjoi() {
    this.setState({ isClick: !this.state.isClick })
    this.judgeEmjoiShowOrClose()
  }
  //关闭emjio
  closeEmjoi(state) {
    this.setState({ isClick: state })
    this.judgeEmjoiShowOrClose()
  }
  uploadFile(This, id, chatModePid, socket, profile, uploadFile) {
    FileUpload.uploadImage(This, id, chatModePid, socket, profile, uploadFile)
  }
  //发送消息
  startSendMsg(e) {
    e.target.setAttribute('contenteditable', true);
    // if( e.target.innerText!=='' ){
    //   ChatClient.setCaretPosition(e.target,e.target.innerText.length);
    // }
    e.target.focus();
  }
  _startSend() {
    let { onSendMsg } = this.props;
    let input = document.getElementsByClassName('input')[0];
    // console.log(input);
    let msg = input.innerText;
    onSendMsg && onSendMsg(msg);
    input.innerText = '';
  }
  _enterSend(e) {
    e.cancelBubble = true;
    e.preventDefault();
    this._startSend();
  }
  startRtc() {
    let { chatModePid, profile, uploadFile, startRtc } = this.props;
    let { id } = profile;
    let socket = ChatClient.socket;
    let that = this;
    let content = JSON.stringify({ content: profile, from: id, to: chatModePid, type: 'videoRquest' });
    socket.send(content);
    startRtc && startRtc();

    ChatClient.start(function () {
      console.log('发起方添加视频流', ChatClient.localStream);
      ChatClient.pc.addStream(ChatClient.localStream);
      ChatClient.pc.onaddstream = (event) => {
        //接收offer方的视频流，并显示出来

        console.log("Received remote stream");

        let stream = event.stream;
        // debugger
        //显示对方视频流
        console.log('显示接收方视频流', stream)
        let remoteVideo = document.getElementsByClassName('remoteVideo')[0];
        // let remoteVideo = ChatClient.remoteRef.current;
        remoteVideo.srcObject = stream;
      };
    })
  }
}
export default RightBottom;
