//api接口地址
//base url for China

const FACE_HOST_CN = "https://api-cn.faceplusplus.com/";
const FACE_HOST_US = "https://api-us.faceplusplus.com/";

const FACE_FACEPP = "facepp/v3/";
const FACE_DETECT = FACE_FACEPP + "detect";
const FACE_COMPARE = FACE_FACEPP + "compare";
const FACE_SEARCH = FACE_FACEPP + "search";

// facetoken
const FACETOEKN = FACE_FACEPP + "face/";
const FACETOEKN_ANALYZE = FACETOEKN + "analyze";
const FACETOEKN_SET_USERID = FACETOEKN + "setuserid";
const FACETOEKN_GET_DETAIL = FACETOEKN + "getdetail";

//faceSet
const FACESET = FACE_FACEPP + "faceset/";
const FACESET_CREATE = FACESET + "create";
const FACESET_ADDFACE = FACESET + "addface";
const FACESET_REMOVE_FACE = FACESET + "removeface";
const FACESET_ADDFACE_ASYNC = FACESET + "async/addface";
const FACESET_REMOVE_FACE_ASYNC = FACESET + "async/removeface";
const FACEAET_TASK_QUERY = FACESET + "async/task_status";
const FACESET_UPDATE = FACESET + "update";
const FACESET_GET_DETAIL = FACESET + "getdetail";
const FACESET_GET_FACESETS = FACESET + "getfacesets";
const FACESET_DELETE = FACESET + "delete";


//人体检测和人体抠图
const HUMANBODY_DETECT = "humanbodypp/v1/detect";
const HUMANBODY_SEGMENT = "humanbodypp/v2/segment";
const HUMANBODY_SKELETON = "humanbodypp/v1/skeleton";
const HUMANBODY_GESTURE = "humanbodypp/beta/gesture";

//人脸融合
const IMAGE_MERGEFACE = "imagepp/v1/mergeface";

//OCR 识别身份证/驾驶证/行驶证/银行卡,Only for china

// 美颜api
const FACE_BEAUTY ="facepp/beta/beautify";

//证件识别
const OCR_CN = "cardpp/";
const OCR_IDCARD = OCR_CN + "v1/ocridcard";
const OCR_DRIVER_LICENSE = OCR_CN + "v2/ocrdriverlicense";
const OCR_VEHICLE_LICENSE = OCR_CN + "v1/ocrvehiclelicense";
const OCR_BNAKCARD = OCR_CN + "v1/ocrbankcard";

//车牌识别/文字识别/场景识别/文字识别
const IMAGE_CN = "imagepp/";
const IMAGE_Plate  = IMAGE_CN + "v1/licenseplate";
const IMAGE_Object = IMAGE_CN + "beta/detectsceneandobject";
const IMAGE_Text = IMAGE_CN + "v1/recognizetext";
// 
 //相册聚类
const ALBUM_PATH='/imagepp/v1/facealbum/';
const CREATALBUM_PATH=ALBUM_PATH+'createalbum';
const DELETEALBUM_PATH=ALBUM_PATH+'deletealbum';
const FINDCANDIDATE_PATH=ALBUM_PATH+'findcandidate';
const SEARCHIMAGE_PATH=ALBUM_PATH+'searchimage';
const SEARCHIMAGETASKQUERY_PATH=ALBUM_PATH+'searchimagetaskquery';
const UPDATEFACE_PATH=ALBUM_PATH+'updateface';
const GETFACEDETAIL_PATH=ALBUM_PATH+'getfacedetail';
const GETIMAGEDETAIL_PATH=ALBUM_PATH+'getimagedetail';
const GETALBUMDETAIL_PATH=ALBUM_PATH+'getalbumdetail';
const ADDIMAGE_PATH=ALBUM_PATH+'addimage';
const DELETEFACE_PATH=ALBUM_PATH+'deleteface';
const GROUPFACE_PATH=ALBUM_PATH+'groupface';
const GROUPFACETASKQUERY_PATH=ALBUM_PATH+'groupfacetaskquery';


/* FACEPP对象
 *  apikey : 填写apikey
 *  apisecret : 填写 apisecret
 *  isChina : 是否是国内用户
 */

function FACEPP(apikey, apisecret, isChina) {

    if (apikey == null || apisecret == null){
        alert('apikey 或 apisecret 不能为空');
        console.log('apikey or apisecret can not be null');
    }

    this.apikey = apikey;
    this.apisecret = apisecret;
    this.isChina = isChina;

    if (isChina){
        this.baseurl = FACE_HOST_CN;

    } else {
        this.baseurl = FACE_HOST_US;
    }

    //人脸检测
    this.detectFace = function (param,success, failed) {

        var url = this.baseurl + FACE_DETECT;

        this.request(url, param, success, failed);
    };

    //人脸比对
    this.compareFace = function (param, success, failed) {
        var url = this.baseurl + FACE_COMPARE;
        this.request(url, param, success, failed);
    };

    //**************对faceset(人脸集合)的操作***************

    // 创建faceset
    this.faceSetCreate = function (param, success, failed) {
        var url = this.baseurl + FACESET_CREATE;
        this.request(url, param, success, failed);
    };

    // 删除faceset
    this.faceSetdelete = function (param, success, failed) {
        var url = this.baseurl + FACESET_DELETE;
        this.request(url, param, success, failed);
    };

    //faceset 更新
    this.faceSetUpdate = function (param, success, failed) {
        var url = this.baseurl + FACESET_UPDATE;
        this.request(url, param, success, failed);
    };

    // 查询指定的faceset
    this.faceSetQuery = function (param, success, failed) {
        var url = this.baseurl + FACESET_GET_DETAIL;
        this.request(url, param, success, failed);
    };

    // 获取所有的faceset
    this.faceSetGetAll = function (param, success, failed) {
        var url = this.baseurl + FACESET_GET_FACESETS;
        this.request(url, param, success, failed);
    };


    //**************管理指定faceset内的人脸***************

    //人脸搜索,根据相似度搜索人脸
    this.faceSearch = function (param, success, failed) {
        var url = this.baseurl + FACE_SEARCH;
        this.request(url, param, success, failed);
    };

    // 添加人脸到指定faceset
    this.faceAdd = function (param, success, failed) {
        var url = this.baseurl + FACESET_ADDFACE;
        this.request(url, param, success, failed);
    };

    // 删除指定faceset中的某个人脸
    this.faceDelete = function (param, success, failed) {
        var url = this.baseurl + FACESET_REMOVE_FACE;
        this.request(url, param, success, failed);
    };

    // 异步添加人脸到指定faceset
    this.faceAddAsnc = function (param, success, failed) {
        var url = this.baseurl + FACESET_ADDFACE_ASYNC;
        this.request(url, param, success, failed);
    };

    // 异步删除指定faceset中的某个人脸
    this.faceDelete = function (param, success, failed) {
        var url = this.baseurl + FACESET_REMOVE_FACE_ASYNC;
        this.request(url, param, success, failed);
    };

    // 异步任务状态查询
    this.asyncStatus = function (param, success, failed) {
        var url = this.baseurl + FACEAET_TASK_QUERY;
        this.request(url, param, success, failed);
    };

    //**************对facetoken(人脸标识)的操作***************
    // 设置userid
    this.facetokenSetUserID = function (param, success, failed) {
        var url = this.baseurl + FACETOEKN_SET_USERID;
        this.request(url, param, success, failed);
    };

    //获取facetoken的本身的详细信息
    this.facetokenGetDetail = function (param, success, failed) {
        var url = this.baseurl + FACETOEKN_GET_DETAIL;
        this.request(url, param, success, failed);
    };

    //根据facetoken获取人脸信息
    this.facetokenAnalyze = function (param, success, failed) {
        var url = this.baseurl + FACETOEKN_ANALYZE;
        this.request(url, param, success, failed);
    };

    //人脸融合
    this.mergeFace = function (param, success, failed) {
        var url = this.baseurl + IMAGE_MERGEFACE;
        this.request(url, param, success, failed);
    };

    //**************人体识别相关***************
    //人体检测
    this.bodyDetect = function (param, success, failed) {
        var url = this.baseurl + HUMANBODY_DETECT;
        this.request(url, param, success, failed);
    };

    //人体关键点检测
    this.skeletonDetect = function (param, success, failed) {
        var url = this.baseurl + HUMANBODY_SKELETON;
        this.request(url, param, success, failed);
    };

    //人体抠像
    this.bodySegent = function (param, success, failed) {
        var url = this.baseurl + HUMANBODY_SEGMENT;
        this.request(url, param, success, failed);
    };

    //手势识别
    this.gestureRecognize = function (param, success, failed) {
        var url = this.baseurl + HUMANBODY_GESTURE;
        this.request(url, param, success, failed);
    };

    //**************中文版特有,***************
    //照片美化
    this.faceBeauty = function (param, success, failed) {
        var url = this.baseurl + FACE_BEAUTY;
        this.request(url, param, success, failed);
    };

    //身份证识别
    this.OCRIdCard = function (param, success, failed) {
        var url = this.baseurl + OCR_IDCARD;
        this.request(url, param, success, failed);
    };

    //驾驶证识别
    this.OCRDriverCard = function (param, success, failed) {
        var url = this.baseurl + OCR_DRIVER_LICENSE;
        this.request(url, param, success, failed);
    };

    //行驶证识别
    this.OCRVehicleLicense= function (param, success, failed) {
        var url = this.baseurl + OCR_VEHICLE_LICENSE;
        this.request(url, param, success, failed);
    };

    //银行卡识别
    this.OCRBankCard = function (param, success, failed) {
        var url = this.baseurl + OCR_BNAKCARD;
        this.request(url, param, success, failed);
    };

    //车牌号识别
    this.OCRLicensePlate = function (param, success, failed) {
        var url = this.baseurl + IMAGE_Plate;
        this.request(url, param, success, failed);
    };

    //文字识别
    this.OCRText  =  function (param, success, failed) {
        var url = this.baseurl + IMAGE_Text;
        this.request(url, param, success, failed);
    };

    //场景识别
    this.DetectScene = function (param, success, failed) {
        var url = this.baseurl + IMAGE_Object;
        this.request(url, param, success, failed);
    };
	
	
	//创建新的相册
	this.createAlbum = function(param, success, failed) {
		var url = this.baseurl + CREATALBUM_PATH;
		this.request(url, param, success, failed);
	}
	
	//删除相册
	this.deleteAlbum = function(param, success, failed) {
		var url = this.baseurl + DELETEALBUM_PATH;
		this.request(url, param, success, failed);
	}
	
	//寻找相似分组
	this.findCandidate = function(param, success, failed) {
		var url = this.baseurl + FINDCANDIDATE_PATH;
		this.request(url, param, success, failed);
	}
	
	//搜索图片
	this.searchImage = function(param, success, failed) {
		var url = this.baseurl + SEARCHIMAGE_PATH;
		this.request(url, param, success, failed);
	}
	
	//搜索图片结果查询
	this.searchImageTaskQuery = function(param, success, failed) {
		var url = this.baseurl + SEARCHIMAGETASKQUERY_PATH;
		this.request(url, param, success, failed);
	}
	
	//更新人类
	this.updateFace = function(param, success, failed) {
		var url = this.baseurl + UPDATEFACE_PATH;
		this.request(url, param, success, failed);
	}
	
	//查看人脸的信息
	this.getFaceDetail = function(param, success, failed) {
		var url = this.baseurl + GETFACEDETAIL_PATH;
		this.request(url, param, success, failed);
	}
	
	//查看图片详情
	this.getImageDetail = function(param, success, failed) {
		var url = this.baseurl + GETIMAGEDETAIL_PATH;
		this.request(url, param, success, failed);
	}
	
	//查看相册详情
	this.getAlbumDetail = function(param, success, failed) {
		var url = this.baseurl + GETALBUMDETAIL_PATH;
		this.request(url, param, success, failed);
	}
	
	//添加图片
	this.addImage = function(param, success, failed) {
		var url = this.baseurl + ADDIMAGE_PATH;
		this.request(url, param, success, failed);
	}
	
	//移除人脸
	this.deleteFace = function(param, success, failed) {
		var url = this.baseurl + DELETEFACE_PATH;
		this.request(url, param, success, failed);
	}
	
	//聚类人脸
	this.groupFace = function(param, success, failed) {
		var url = this.baseurl + GROUPFACE_PATH;
		this.request(url, param, success, failed);
	}
	
	//聚类人脸结果查询
	this.groupFaceTaskQuery = function(param, success, failed) {
		var url = this.baseurl + GROUPFACETASKQUERY_PATH;
		this.request(url, param, success, failed);
	}
	
	
	this. getFaceBase64Image = function(img){
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
		var dataURL = canvas.toDataURL("image/" + ext);
		//var image=dataURL.replace(/data:image\/.*;base64,/,'');
	//	console.log(dataURL);
		return dataURL;
	}

    /* base64转二进制
     * 传入base64数据
     */
    this.dataURItoBlob = function(dataURI) { // 图片转成Buffer
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    }

    /* POST请求
     * url: 请求地址
     * 请求携带的参数
     */
    this.request = function (url, dic, success, failed) {//发送POST请求

        const formData = new FormData();

        formData.append('api_key',this.apikey);
        formData.append('api_secret',this.apisecret);

        for (var key in dic){//遍历拼接
            formData.append(key,dic[key]);
        }

        $.ajax({
            url: url,
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false,
            timeout: 20000,//20秒超时时间
        }).done(success).fail(failed);
    }
}
