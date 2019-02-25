//等待接收方接收视频通话界面

import React, { Component } from 'react';
import '../css/acceptVideo.css';

class AcceptVideo extends Component{
  render(){
    return(
      <div className='box'>
        <div className='avaWrap'><img src='' alt='' className='offerAva'/></div>
        <p className='Tip'>是否接收来至于...的视频通话</p>
        <div className='State'>
          <img alt='' src='http://192.168.31.69:8080/img/break.png' className='accept'/>
          <img alt='' src='http://192.168.31.69:8080/img/hang.jpg' className='cancel'/>
        </div>
      </div>
    )
  }
}
export default AcceptVideo;
