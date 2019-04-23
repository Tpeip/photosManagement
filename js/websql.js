

/**
*数据库操作辅助类,定义对象、数据操作方法都在这里定义
*/
var dbname='photomanagement';/*数据库名*/
var version = '1.0'; /*数据库版本*/
var dbdesc = '相册管理'; /*数据库描述*/
var dbsize = 2*1024*1024; /*数据库大小*/
var dataBase = null; /*暂存数据库对象*/

/**
 * 打开数据库
 * @returns  dataBase:打开成功   null:打开失败
 */
function websqlOpenDB(){
    /*数据库有就打开 没有就创建*/
    dataBase = window.openDatabase(dbname, version, dbdesc, dbsize,function() {});
    if (dataBase) {
        console.log("数据库创建/打开成功!");
    } else{
        console.log("数据库创建/打开失败！");
    }
    return dataBase;
}
/**
 * 新建数据库里面的表单
 * @param tableName:表单名
 * @param params:属性值
 */
function websqlCreatTable(tableName,params){
	websqlOpenDB();
    var creatTableSQL = 'CREATE TABLE IF  NOT EXISTS '+ tableName + ' ('+params+')';
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(creatTableSQL,[],function(ctx,result){
            console.log("表创建成功 " + tableName);
        },function(tx, error){ 
            console.log('创建表失败:' + tableName + error.message);
        });
    });
}

/**
 * 创建image表单
 */
function createImageTable(){
	var tableName='image';
	var params="image_id INTEGER PRIMARY KEY AUTOINCREMENT,image_path text NOT NULL,image_main_type text NOT NULL,image_type text NOT NULL,image_keyword text NOT NULL";
	websqlCreatTable(tableName,params);
}

/**
 * image中删除数据
 */
function deleteAllImage(){
    var deleteTableSQL = 'DELETE FROM image';
    localStorage.removeItem('image');
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(deleteTableSQL,[],function(ctx,result){
            console.log("删除表数据成功 " );
        },function(tx, error){ 
            console.log('删除表数据失败:'  + error.message);
        });
    });
}
function getAllImage(){
	websqlOpenDB();
	 var selectALLSQL = 'SELECT * FROM image ORDER BY image_id DESC';
	 var pm=new Promise(function(resolve,reject){
		 dataBase.transaction(function (ctx) {
		     ctx.executeSql(selectALLSQL,[],function (ctx,result){
		   //      console.log("查询" +   + "成功");
		 		resolve(result);
		     },
		     function (tx, error) {
		         console.log('查询失败: ' + error.message);
		 		reject(error);
		     });
		 });
	 });
	 return pm;
}

function getAllType(){
	websqlOpenDB();
	 var selectALLSQL = 'SELECT distinct(image_main_type) FROM image';
	 var pm=new Promise(function(resolve,reject){
		 dataBase.transaction(function (ctx) {
		     ctx.executeSql(selectALLSQL,[],function (ctx,result){
		   //      console.log("查询" +   + "成功");
		 		resolve(result);
		     },
		     function (tx, error) {
		         console.log('查询失败: ' + error.message);
		 		reject(error);
		     });
		 });
	 });
	 return pm;
}

function getTypeOne(image_type){
	websqlOpenDB();
	console.log("123");
	console.log(image_type);
	 var selectSQL = 'SELECT image_path FROM image where image_main_type=? ORDER BY image_id DESC';
	 var pm=new Promise(function(resolve,reject){
		 dataBase.transaction(function (ctx) {
		     ctx.executeSql(selectSQL,[image_type],function (ctx,result){
		         console.log("查询成功");
		 		resolve(result);
		     },
		     function (tx, error) {
		         console.log('查询失败: ' + error.message);
		 		reject(error);
		     });
		 });
	 });
	 return pm;
}


function InsertToImage(num,imageArr){
	websqlOpenDB();
	var insertImageSQL = 'INSERT INTO image (image_path,image_main_type,image_type,image_keyword) VALUES (?,?,?,?)';
	for(var i=0;i<num-1;i++){
		insertImageSQL+=',(?,?,?,?)';
	}
	console.log(insertImageSQL);
	console.log(imageArr);
	var pm=new Promise(function(resolve,reject){
		dataBase.transaction(function (ctx) {
		    ctx.executeSql(insertImageSQL,imageArr,function (ctx,result){
		        console.log("插入成功");
				resolve(result);
		    },
		    function (tx, error) {
		        console.log('插入失败: ' + error.message);
				reject(error);
		    });
		});
	});
	return pm;
}