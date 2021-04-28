//表情栏
import React, { Component } from 'react';
import ChatClient from '../ChatClient';
import '../css/emjoi.css';
class Emjoi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iconCls: [
        'icon-xianxingbaozhu', 'icon-xianxingcaidan', 'icon-xianxingdagu', 'icon-xianxingchun', 'icon-xianxingguadeng',
        'icon-xianxingbolanggu', 'icon-xianxingbianpao', 'icon-xianxinghongbao', 'icon-xianxingdaofu', 'icon-xianxingfudai',
        'icon-xianxinglazhu', 'icon-xianxingjiaozi', 'icon-xianxingjiaozi', 'icon-xianxinghuaduo', 'icon-xianxingmenlianzhuangshi',
        'icon-xianxingmenlianzhuangshi', 'icon-xianxingqiqiu', 'icon-xianxingguali', 'icon-xianxingqiqiu', 'icon-xianxingmenlianzhuangshi',
        'icon-xianxinghulu', 'icon-xianxingtongbi', 'icon-xianxingdenglong', 'icon-xianxingduilian', 'icon-xianxingmaozi',
        'icon-xianxingshanzi', 'icon-xianxingtanghulu', 'icon-xianxingjiutan', 'icon-xianxingqiaoluo', 'icon-xianxingtangyuan',
        'icon-xianxingxinnianliwu', 'icon-xianxingyanhua', 'icon-xianxingtouzi', 'icon-xianxingpaozhang', 'icon-xianxingyuanbao',
        'icon-xianxingzhongguojie', 'icon-xianxingyuandenglong', 'icon-xianxingtongqianchuan', 'icon-xianxingzhuzi', 'icon-lianxiren',
        'icon-duoyun', 'icon-luxiang', 'icon-beiwanglu', 'icon-tianjia', 'icon-qq', 'icon-weibo', 'icon-jisuanqi', 'icon-shezhi',
        'icon-xinxi', 'icon-shoucang', 'icon-tuku', 'icon-taiyang', 'icon-shizhong', 'icon-yuedu', 'icon-youxi', 'icon-youxi',
        'icon-xiayu', 'icon-weixin', 'icon-shuibei', 'icon-sousuo'
      ]
    }
  }
  render() {
    return (
      <div className="flex">
        {
          this.state.iconCls.map((item, index) => {
            return <i className={'iconfont ' + item + ' red icon_item'} key={index} name={item} onClick={(e) => { this.clickToChekcIcon(e) }}></i>
          })
        }
      </div>
    )
  }
  clickToChekcIcon(e) {
    //输入框内填入表情
    let input = document.getElementsByClassName('input')[0];
    let str = input.innerText;
    //获取光标位置
    let pos = ChatClient.getCursortPosition(input);
    //将输入框内容截成两段
    let msg_1 = str.substring(0, pos);
    let msg_2 = str.substring(pos);
    //获取点击的表情的name属性
    let faceName = e.target || '';
    input.innerText = [msg_1, msg_2].join('') + faceName;
    ChatClient.setCaretPosition(input, pos + faceName.length);
    this.props.closeEmjoi(false)
  }
}
export default Emjoi;
