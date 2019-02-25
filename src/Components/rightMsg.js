//消息显示栏右侧消息模型
import React, { Component } from 'react';
import '../css/rightMsg.css';
import ChatClient from '../ChatClient';

class RightMsg extends Component{
    constructor(props){
        super(props);
        this.state = {
          isImage : false,
          content : '',
        }
    }
    // //替换表情
    fn( str ){
      let re = /\[[\u4e00-\u9fa5]{2}\]/g;
      let rex = /http/g;
      // ...
      if( re.test(str) ){
        let word = str.split(re);
        let src = str.match(re);
        src = src.map((item)=>{
          if( ChatClient.faceLibary[item] ){
            return <img src={ChatClient.faceLibary[item]} alt=''/>
          }else{
            return item
          }
        })
        let all = new Array(src.length+word.length).fill(0);
        for (var i = 0; i < all.length; i++) {
          for( var n = 0; n < word.length; n++ ){
              all.splice(i,1,word[n]);
          }
          if( (i+2)%2 === 1 ){
            for(var j = 0; j < src.length; j++){
              all.splice(i,1,src[j]);
            }
          }
        }
        // ...
        return all;
      }else{
        if( rex.test(str) ){
          this.setState({isImage:true,content:str});
        }else{
          return str
        }
      }
    }
    render(){
        let {src } = this.props;
        let {isImage,content} = this.state;
        return(
            <div className='msgWrap'>
                <img src={src} className='rightImg' alt=''/>
                <p className='msg'>
                  {isImage ? <img src={content && content} className='sendImg'/> : this.changeCon()}
                </p>
            </div>
        )
    }
    changeCon(){
      let {content} = this.props;
      return this.fn(content);
    }
}
export default RightMsg;
