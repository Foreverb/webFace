//等待对方接受视频界面
import React, { Component } from 'react';
import '../css/videoWate.css';
import ChatClient from '../ChatClient';

class VideoWate extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='wrap'>
        <video className='localVideo' autoPlay='autoPlay' alt='' id="localVideo"></video>
        <div className='remote'>
          正在等待对方接听...
          <video className='remoteVideo' autoPlay='autoPlay' alt=''></video>
        </div>
        <div className='state' onClick={() => this.backMain()}>
          <img className='quit' src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/break.png' alt='' />
        </div>
      </div>
    )
  }
  backMain() {
    let { onClick } = this.props;
    onClick && onClick();
  }
}
export default VideoWate;
