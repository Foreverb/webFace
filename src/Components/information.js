//用户信息栏
import React, { Component } from 'react';
import '../css/information.css';
import FileUpload from '../fileUpload';
import ChatClient from '../ChatClient';
class Information extends Component{
  constructor(props){
    super(props);
  }
  render(){
    let {profile,onclose,updateAvatar,chatModePid} = this.props;
    let {nick,ava,id} = profile;
    let socket = ChatClient.socket;
    return(
      <div className='information'>
        <img src='' className='loading' alt=''/>
        <div style={{display:'inlineBlock'}}>
          <form encType="multipart/form-data" id='avaApgrade'>
            <input type='file' required name="thumbnail" onClick={(e)=>{this.uploadFile(e.target,id,chatModePid,socket,profile,updateAvatar)}}/>
          </form>
          <img src={ava} className='avater' alt=''/>
        </div>
        <p className='nick' onClick={(e)=>{this._startChange(e)}}
        onKeyDown={(e)=>{e.keyCode === 13 && this._endChange(e)}}>{nick}</p>
        <span className='online' style={onclose ? {backgroundColor:'red'} : {backgroundColor:'green'}}></span>
      </div>
    )
  }
  uploadFile(This,id,chatModePid,socket,profile,updateAvatar){
    FileUpload.upgradeAva(This,id,chatModePid,socket,profile,updateAvatar)
  }
  _startChange(e){
    e.target.setAttribute('contenteditable',true);
    e.target.focus();
    e.target.innerText = '';
  }
  _endChange(e){
    let {onClick} = this.props;
    let inner = e.target.innerText;
    if( inner.length > 7 || inner.length < 2 ){
      alert('请输入正确格式:输入内容长度必须为大于2小于8的有效字符');
      e.target.innerText = '';
      e.target.focus();
      return
    }
    e.target.setAttribute('contenteditable',false);
    e.target.blur();
    onClick && onClick(inner);
  }
}
export default Information;
