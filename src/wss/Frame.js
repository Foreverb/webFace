const Frame = {
/**
 * 解码
 * @param {buffer} e 十六进制类型的数据
 */ 
decodeDataFrame (buffer) {
  var stream = [];
  var i = 0,j,s;
  var frame = {
  // 解析前两个字节的基本数据
    FIN: buffer[i] >> 7,
    Opcode: buffer[i ++] & 15,
    Mask: buffer[i] >> 7,
    PayloadLength: buffer[i ++] & 0x7F
  };
  // 处理特殊长度126和127
  if(frame.PayloadLength === 126)
    frame.PayloadLength = (buffer[i ++] << 8) + buffer[i ++];
  if(frame.PayloadLength === 127)
    i+=4, // 长度一般用四字节的整型，前四个字节通常为长整形留空的
    frame.PayloadLength = (buffer[i ++] << 24) + (buffer[i ++] << 16) + (buffer[i ++] << 8) + stream[i ++];
  // 判断是否使用掩码
  if(frame.Mask){
    // 获取掩码实体
    frame.MaskingKey = [buffer[i ++],buffer[i ++],buffer[i ++],buffer[i ++]];
    // 对数据和掩码做异或运算
  for(j = 0; j < frame.PayloadLength; j ++){
      stream.push(buffer[i + j] ^ frame.MaskingKey[j % 4]);
    }
  } else {
    stream = buffer.slice(i, frame.PayloadLength); // 否则直接使用数据
  }
  if(!frame.FIN) return false;
  // 数组转换成缓冲区来使用
  if(stream.length) stream = new Buffer(stream);
  
  // 如果有必要则把缓冲区转换成字符串来使用
  stream = stream.toString();
  // 设置上数据部分
  frame.PayloadData = stream;
  stream = [];
  // 返回数据帧
  return frame;
},
encodeDataFrame (data){
  var head = [];
  var body = new Buffer(data.PayloadData);
  var l = body.length;
  // 输入第一个字节
  head.push((data.FIN << 7) + data.Opcode);
  // 输入第二个字节，判断它的长度并放入相应的后续长度消息
  // 永远不使用掩码
  if(l < 126) {
    head.push(l);
  } else if(l < 0x10000) {
    head.push(126, (l & 0xFF00) >> 8,l & 0xFF);
  } else {
    head.push(
      127, 0, 0, 0, 0, // 8字节数据，前4字节一般没用留空
      (l&0xFF000000)>>24,(l&0xFF0000)>>16,(l&0xFF00)>>8,l&0xFF
    );
  }
  // 返回头部分和数据部分的合并缓冲区
  return Buffer.concat([new Buffer(head), body]);
}
}
module.exports = Frame;