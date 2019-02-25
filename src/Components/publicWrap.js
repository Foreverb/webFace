//公共频道
import React, { Component } from 'react';
import '../css/public.css';
import { Switch } from 'antd';
import 'antd/dist/antd.css';

class PublicCard extends Component{
  constructor(props){
    super(props);
  }
  render(){
    let {src,chatModePid} = this.props;
    let cls =['publicCard',chatModePid===-1?'checked':null].join(' ');
    return(
      <div className={cls}>
        <img src={src} className='publicAvater'/>
        <p className='descript second'>公共频道</p>
      </div>
    )
  }
}

class PublicWrap extends Component{
  constructor(props){
    super(props);
  }
  render(){
    let {tip,chatModePid,isOpenPublic} = this.props;
    return(
      <div className='normal'>
        <div className='switch'>
          <Switch checkedChildren="开" unCheckedChildren="关"
           checked={isOpenPublic} onClick={()=>{chatModePid===-1 && this._changeStatus()}}/>
          <p className='descript'>{tip}</p>
        </div>
        <PublicCard src='https://raw.githubusercontent.com/Foreverb/foreverb.github.io/master/img/public.png' chatModePid={chatModePid}/>
      </div>
    )
  }
  _changeStatus(){
    let {onchange} = this.props;
    onchange && onchange();
  }
}
export default PublicWrap;
