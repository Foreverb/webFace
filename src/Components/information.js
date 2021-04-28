//用户信息栏
import React, { Component } from 'react';
import '../css/information.css';
import FileUpload from '../fileUpload';
import ChatClient from '../ChatClient';
class Information extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startNick: ''
    }
  }
  render() {
    let { profile, onclose, updateAvatar, chatModePid } = this.props;
    let { nick, ava, id } = profile;
    let socket = ChatClient.socket;
    return (
      <div className='information'>
        <div className="avaAndNick">
          {/* <img src='' className='loading' alt='' /> */}
          <div className="avaWrap">
            <form encType="multipart/form-data" id='avaApgrade'>
              <input type='file' id="avaIpt" required name="thumbnail" onClick={(e) => { this.uploadFile(e.target, id, chatModePid, socket, profile, updateAvatar) }} />
            </form>
            <img src={ava} className='avater' alt='' onClick={()=>{this.dispatchInputClick()}}/>
          </div>
          <p className='nick' onClick={(e) => { this._startChange(e) }}
            onKeyDown={(e) => { e.keyCode === 13 && this._endChange(e) }}
            onBlur={(e)=>{this.nickBlur(e)}}>{nick}</p>
        </div>

        <div className='online' style={onclose ? { backgroundColor: 'red' } : { backgroundColor: 'green' }}></div>
      </div>
    )
  }
  //点击头像，触发input事件
  dispatchInputClick(){
    let ava_upload = document.getElementById('avaIpt');
    ava_upload.click()
  }
  //上传头像
  uploadFile(This, id, chatModePid, socket, profile, updateAvatar) {
    FileUpload.upgradeAva(This, id, chatModePid, socket, profile, updateAvatar)
  }
  //编辑nick
  _startChange(e) {
    //记录初始值
    this.setState({startNick: e.target.innerText})
    e.target.setAttribute('contenteditable', true);
    e.target.focus();
    // e.target.innerText = '';
  }
  //nick失焦
  nickBlur(e){
    if( !e.target.innerText ) {
      e.target.innerText = this.state.startNick
    }
  }
  _endChange(e) {
    let { onClick } = this.props;
    let inner = e.target.innerText;
    if (inner.length > 7 || inner.length < 2) {
      alert('请输入正确格式:输入内容长度必须为大于2小于8的有效字符');
      e.target.innerText = '';
      e.target.focus();
      return
    }
    e.target.setAttribute('contenteditable', false);
    e.target.blur();
    onClick && onClick(inner);
  }
}
export default Information;
