class FileUpload{
  //上传图片
  uploadImage(El,from,to,socket,profile,uploadFile){
    let {ava} = profile;
    El.onchange = function(e){
      let oData = new FormData();
      oData.append('thumbnail',e.target.files[0]);
      // debugger
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://140.82.16.201:19999/upload", true);
      xhr.send(oData);
      xhr.onload = function (oEvent) {
          if (xhr.status == 200 && xhr.readyState == 4) {
            console.log(xhr.responseText);
            uploadFile(xhr.responseText)
            let data = JSON.stringify({date:{content:xhr.responseText,src:ava},from:from,to:to,type:'chatMessage'})
            socket.send(data);
          }
      };
    }
  };
  //更新头像
  upgradeAva(El,from,to,socket,profile,updateAvatar){
    El.onchange = function(e){
      let oData = new FormData();
      oData.append('thumbnail',e.target.files[0]);
      // debugger
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://140.82.16.201:19999/upload", true);
      xhr.send(oData);
      xhr.onload = function (oEvent) {
          if (xhr.status == 200 && xhr.readyState == 4) {
            updateAvatar(xhr.responseText)
          }
      };
    }
  };
}
export default new FileUpload();
