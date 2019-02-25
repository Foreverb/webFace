//表情栏
import React, { Component } from 'react';
import ChatClient from '../ChatClient';
import '../css/emjoi.css';
class Emjoi extends Component{
  constructor(props){
    super(props);
  }
  //在输入框内添加表情
  setEmjoi(e){
    this.setState({cls_icon : ['iconCard']})
    let input = document.getElementsByClassName('input')[0];
    let str = input.innerText;
    //获取光标位置
    let pos = ChatClient.getCursortPosition(input);
    //将输入框内容截成两段
    let msg_1 = str.substring(0,pos);
    let msg_2 = str.substring(pos);
    //获取点击的表情的name属性
    let faceName = e.target.name;
    input.innerText = [msg_1,msg_2].join(faceName);
    ChatClient.setCaretPosition(input,pos+faceName.length);
  }
  render(){
    let {className} = this.props;
    return(
      <ul className={className}>
          <span className='point'></span>
          {
            <li className='emjoi_1'>
              <img src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/file.png' className='img_1'
               onClick={(e)=>this.setEmjoi(e)} name='[文件]' alt=''/>
            </li>
          }
      </ul>
    )
  }
}
export default Emjoi;
