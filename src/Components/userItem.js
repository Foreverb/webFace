//在线用户模型
import React, { Component } from 'react';
import '../css/userItem.css';

class Item extends Component{
    constructor(props){
        super(props);
    }
    render(){
      let {profile,onChage,isActive} = this.props;
      let {nick,ava} = profile;
      let cls = ['publicCard','another',(isActive?'Actived':null)].join(' ');
      return(
            <div className={cls} onClick={()=>{onChage&&onChage()}}>
                <img src={ava} className='publicAvater' alt=''/>
                <p className='all'>{nick}</p>
            </div>
        )
    }
}
export default Item;
