const getBaiduToken = function () {
    return new Promise((resolve, reject) => {
        //自行获取APIKey、SecretKey
        const apiKey = 'AVzVKQv9GGeDcn4HG4IycvFf';
        const secKey = 'a33ymiq1ZacAGqMlZloOBLcXG75txorB';
        const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secKey}`;
        var params={};
		this.request(tokenUrl,params,function (res) {
                resolve(res);
            }, function (res) {
			//	console.log('网络错误，请重试！'+JSON.stringify(res));
                reject(res);
            });
    });
}

//封装识别方法
const getImageClassify = function(tokenUrl, data){
    return new Promise((resolve, reject) => {
        const detectUrl = `https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=${tokenUrl}`;
		this.request(detectUrl,data,function (res) {
		//	console.log(JSON.stringify(res));
                resolve(res);
            }, function (err) {
			//	console.log('网络错误，请重试！'+JSON.stringify(err));
                reject(err);
            });
			
    });
}

const getDetect = function(tokenUrl, data){
    return new Promise((resolve, reject) => {
        const detectUrl = `https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=${tokenUrl}`;
		this.request(detectUrl,data,function (res) {
		//	console.log(JSON.stringify(res));
                resolve(res);
            }, function (err) {
			//	console.log('网络错误，请重试！'+JSON.stringify(err));
                reject(err);
            });
			
    });
}


function AIPImageClassify(image){
	return new Promise((resolve,reject) =>{
		getBaiduToken().then((res) => {
		//	console.log(JSON.stringify(res));
			//console.log(res.access_token);
			let token = res.access_token;
			return token;
			
		}).then(function(token){
			let data = {"image": image};
			getImageClassify(token,data).then(function(res){
//				console.log('api结果:'+JSON.stringify(res));
				resolve(res);
			}).catch(function(err){
	//		 	console.log(JSON.stringify(err)); 
				reject(err);
			 });
 		}).catch(function(err){
 			console.log(err);;
			reject(err);
 		});
	});
}

function AIPImageDetect(image){
	return new Promise((resolve,reject) =>{
		getBaiduToken().then((res) => {
			let token = res.access_token;
			return token;
		}).then(function(token){
			let data = {"image": image,
			"image_type": "BASE64",
			"face_field":"ge,beauty,expression,face_shape,gender,glasses,landmark,race,quality,eye_status,emotion,face_type",
			"max_face_num": "10"};
			return getDetect(token,data);
		}).then(function(res){
			resolve(res);
		}).catch(function(err){
			console.log(err);;
			reject(err)
		});
	});
}

this.request = function (url, dic, success, failed) {//发送POST请求

		ajax({
		    url: url,
		    type:'POST',
		    dataType:'json',
		    data:dic,
		    success:function(response,xml){
				let res=JSON.parse(response);
				success(res);
             //请求成功后执行的代码
         },
		    error:function(status){
				let err=JSON.parse(status);
				failed(err);
			}
		});
    }

//创建ajax函数
    function ajax(options){
        options=options||{};
        options.type=(options.type||'GET').toUpperCase();
        options.dataType=options.dataType||'json';
        params=formatParams(options.data);

        //创建-第一步
        var xhr;
        //非IE6
        if(window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
        }else{
            //ie6及其以下版本浏览器
            xhr=ActiveXObject('Microsoft.XMLHTTP');
        }

        //接收-第三步
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                var status=xhr.status;
                if(status>=200&&status<300){
                    options.success&&options.success(xhr.responseText);
                }else{
                    options.error&&options.error(statusText);
                }
            }
        }

        //连接和发送-第二步
        if(options.type=='GET'){
            xhr.open('GET',options.url+'?'+params,false);
            xhr.send(null);
        }else if(options.type=='POST'){
            xhr.open('POST',options.url,false);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
    }
// 
     //格式化参数
    function formatParams(data){
        var arr=[];
        for(var name in data){
            arr.push(encodeURIComponent(name)+'='+encodeURIComponent(data[name]));
        }
        arr.push(('v='+Math.random()).replace('.',''));
        return arr.join('&');
    }
	
	function getBase64Image(img) {
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
		var dataURL = canvas.toDataURL("image/" + ext);
		var image=dataURL.replace(/data:image\/.*;base64,/,'');
		return image;
	//	console.log(dataURL);
		// return dataURL;
	}