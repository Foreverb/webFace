//断线重连页面
import React, { Component } from 'react';
import '../css/breakLine.css';

class BreakLine extends Component{
  render(){
    return(
      <div className='breakMask'>
        <p className='content'>您已断线，请尝试刷新页面重新连接...</p>
      </div>
    )
  }
}
export default BreakLine;
