// 消息显示栏
import React, { Component } from 'react';
import '../css/rightTop.css';
import LeftMsg from './leftMsg';
import RightMsg from './rightMsg';
import ChatClient from '../ChatClient';
import GetVideoMsg from './getVideoMsg';

class RightTop extends Component{
  constructor(props){
    super(props);
  }
  render(){
    let {chatModePid,chatRecode,
      onlineUserList,videoMsg,
      videoReqInfo,profile,
      agreeVideo} = this.props;
    let {id,ava} = profile;
    // console.log(chatModePid);
    return(
      <div className='rightTop'>
        <div className='title'>
          <p>{ chatModePid===-1 ? '公共频道' : onlineUserList.map((item)=>{return item.profile.id===chatModePid ? item.profile.nick : null}) }</p>
        </div>
        <div className='publicBack'>
          {
            this.bornMsg()
          }
          {
            videoMsg ? <GetVideoMsg videoReqInfo={videoReqInfo} agreeVideo={agreeVideo} id={id} chatModePid={chatModePid} src={ava}/> : null
          }
        </div>
      </div>
    )
  }
  //生成消息
  bornMsg(){
    let {chatRecode,chatModePid,profile,onlineUserList} = this.props;
    let {id,ava} = profile;
    let El;
    for (let item in chatRecode) {
      // console.log(chatRecode);
      // debugger
      if (chatRecode.hasOwnProperty(item)) {
        let arr = item === ''+chatModePid ? chatRecode[item] : [];
        El = arr.map((item,index)=>{return !item.content ?
        <RightMsg content={item} src={ava} key={index}/> :
        <LeftMsg content={item.content.content} src={item.content.src} key={Math.random()*100000}/>})
      }
    }
    return El;
  }
}
export default RightTop;
