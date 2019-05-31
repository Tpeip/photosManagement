/**
 *数据库操作辅助类,定义对象、数据操作方法都在这里定义
 */
var dbname = 'photomanagement'; /*数据库名*/
var version = '1.0'; /*数据库版本*/
var dbdesc = '相册管理'; /*数据库描述*/
var dbsize = 10 * 1024 * 1024; /*数据库大小*/
var dataBase = null; /*暂存数据库对象*/

/**
 * 打开数据库
 * @returns  dataBase:打开成功   null:打开失败
 */
function websqlOpenDB() {
	/*数据库有就打开 没有就创建*/
	dataBase = window.openDatabase(dbname, version, dbdesc, dbsize);
	if (dataBase) {
		// console.log("数据库创建/打开成功!");
	} else {
		console.log("数据库创建/打开失败！");
	}
	return dataBase;
}
/**
 * 新建数据库里面的表单
 * @param tableName:表单名
 * @param params:属性值
 */
function websqlCreatTable(tableName, params) {
	websqlOpenDB();
	var creatTableSQL = 'CREATE TABLE IF  NOT EXISTS ' + tableName + ' (' + params + ')';
	dataBase.transaction(function(ctx, result) {
		ctx.executeSql(creatTableSQL, [], function(ctx, result) {
			// console.log("表创建成功 " + tableName);
		}, function(tx, error) {
			console.log('创建表失败:' + tableName + error.message);
		});
	});
}

/**
 * 创建image表单
 */
function createImage() {
	var tableName = 'image';
	var params =
		"image_path text PRIMARY KEY NOT NULL, image_keyword text NOT NULL,image_date text NOT NULL,person_num INTEGER NOT NULL";
	websqlCreatTable(tableName, params);
}

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}

function InsertToImage(num, imageArr) {
	websqlOpenDB();
	var insertImageSQL =
		'INSERT INTO image(image_path, image_keyword, image_date, person_num) VALUES (?,?,?,?)';
	for (var i = 0; i < num - 1; i++) {
		insertImageSQL += ',(?,?,?,?)';
	}
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertImageSQL, imageArr, function(ctx, result) {
					// console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getAllImage() {
	websqlOpenDB();
	var selectALLSQL = 'SELECT * FROM image ORDER BY image_date DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectALLSQL, [], function(ctx, result) {
					//      console.log("查询" +   + "成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('查询失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getAllDate() {
	websqlOpenDB();
	var selectALLSQL = 'SELECT distinct(image_date) FROM image ORDER BY image_date DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectALLSQL, [], function(ctx, result) {
					//      console.log("查询" +   + "成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('查询失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getImageByDate(date) {
	websqlOpenDB();
	var selectALLSQL = 'SELECT * FROM image WHERE image_date = ? ORDER BY rowid DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectALLSQL, [date], function(ctx, result) {
					//      console.log("查询" +   + "成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('查询失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getImageByPath(path) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM image where image_path=?';
	// console.log(path);
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [path], function(ctx, result) {
					// console.log(JSON.stringify(result.rows));
					// console.log("查询成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('查询失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function deleteOneImage(image_path) {
	var deleteSQL = 'DELETE FROM image where image_path=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx, result) {
			ctx.executeSql(deleteSQL, [image_path], function(ctx, result) {
				// console.log("删除表数据成功 ");
				resolve(result);
			}, function(tx, error) {
				console.log('删除表数据失败:' + error.message);
				reject(error);
			});
		});
	});
	return pm;
}

function createType() {
	var tableName = 'type';
	var params ="type_id INTEGER PRIMARY KEY AUTOINCREMENT, type_name text NOT NULL" ;
	websqlCreatTable(tableName, params);
}

function InsertToType(num, typeArr) {
	websqlOpenDB();
	var insertTypeSQL ='INSERT INTO type(type_name) VALUES (?)';
	for (var i = 0; i < num - 1; i++) {
		insertTypeSQL += ',(?)';
	}
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertTypeSQL, typeArr, function(ctx, result) {
					 console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function InsertAllType(){
	let typeArr = ['单人照','双人照','合照','自拍','漂亮小姐姐',
	'帅气小鲜肉','可爱小宝贝','活力青少年','明星','证件照','风景','美食','文本','建筑','卡通','交通工具','动物','屏幕截图','其他'];
	InsertToType(typeArr.length, typeArr);
}

function getAllType() {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM type';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getTypeId(type_name) {
	websqlOpenDB();
	var selectSQL = 'SELECT type_id FROM type where type_name = ?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [type_name], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}



function createImageType() {
	var tableName = 'image_type';
	var params ="type_id INTEGER, image_path text, PRIMARY KEY(type_id, image_path),FOREIGN KEY(type_id) REFERENCES type(type_id),FOREIGN KEY(image_path) REFERENCES image(image_path)";
	websqlCreatTable(tableName, params);
}

function InsertToImageType(type_id, image_path) {
	websqlOpenDB();
	var insertImageTypeSQL ='INSERT INTO image_type(type_id, image_path) VALUES (?,?)';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertImageTypeSQL, [type_id, image_path], function(ctx, result) {
					 console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					//console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getOneTypeImage(type_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM image_type where type_id=? ORDER BY rowid DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [type_id], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getOneImageType(image_path) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM image_type where image_path=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [image_path], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getImageType(type_id,image_path) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM image_type where type_id=? and image_path=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [type_id, image_path], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function DeleteImageType(type_id, image_path) {
	websqlOpenDB();
	var deleteImageTypeSQL ='DELETE FROM image_type WHERE type_id=? AND image_path=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteImageTypeSQL, [type_id, image_path], function(ctx, result) {
					 console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					//console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function DeleteImageInType(image_path) {
	websqlOpenDB();
	var deleteImageTypeSQL ='DELETE FROM image_type WHERE image_path=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteImageTypeSQL, [image_path], function(ctx, result) {
					 console.log("删除成功");
					resolve(result);
				},
				function(tx, error) {
					//console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}




function createPerson() {
	var tableName = 'person';
	// var params = " person_id text PRIMARY KEY NOT NULL, person_name text, image_num INTEGER, age INTEGER, gender text, beauty text,ethnicity text";
	var params = " person_id text PRIMARY KEY NOT NULL, person_name text, age INTEGER, gender text, beauty text,ethnicity text";
	websqlCreatTable(tableName, params);
}

function InsertToPerson(person_id) {
	websqlOpenDB();
	var person_name = '未命名';
	var insertFaceSQL = 'INSERT INTO person (person_id , person_name) VALUES (?,?)';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertFaceSQL, [person_id, person_name], function(ctx, result) {
					// console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}


function getOnePerson(person_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM person WHERE person_id=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [person_id], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getAllPerson() {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM person ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}


function UpdateToName(person_id, person_name) {
	websqlOpenDB();
	var insertSQL = 'UPDATE person SET person_name=? WHERE person_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [person_name, person_id], function(ctx, result) {
					// console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdatePersonInfo(person_id, age, gender, ethnicity) {
	websqlOpenDB();
	var insertSQL = 'UPDATE person SET age=?,gender=?,ethnicity=? WHERE person_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [age, gender, ethnicity, person_id], function(ctx, result) {
					console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdatePersonAllInfo(person_id, age, gender, beauty, ethnicity) {
	websqlOpenDB();
	var insertSQL = 'UPDATE person SET age=?,gender=?,beauty=?,ethnicity=? WHERE person_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [age, gender, beauty, ethnicity,person_id], function(ctx, result) {
					console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}


function DeletePerson(person_id) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM person WHERE person_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [person_id], function(ctx, result) {
					// console.log("删除成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('删除失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}


function createFace() {
	var tableName = 'face';
	var params =
		"face_token text PRIMARY KEY, image_path text NOT NULL, face_rec text, face_src text," +
		" age INTEGER, gender text, beauty text, ethnicity text, emotion text, person_id text, "+
		"FOREIGN KEY(image_path) REFERENCES image(image_path), FOREIGN KEY(person_id) REFERENCES person(person_id)";
	websqlCreatTable(tableName, params);
}


function InsertToFace(num, faceArr) {
	websqlOpenDB();
	var insertSQL =
		'INSERT INTO face ( face_token, image_path, face_rec, face_src, age, gender, beauty, ethnicity, emotion) VALUES (?,?,?,?,?,?,?,?,?)';
	for (var i = 0; i < num - 1; i++) {
		insertSQL += ',(?,?,?,?,?,?,?,?,?)';
	}
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, faceArr, function(ctx, result) {
					 console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}


function getAllFace(){
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM face';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getPerson() {
	websqlOpenDB();
	var selectSQL = 'SELECT image_path, person_id, face_rec, face_src, COUNT(*) image_num FROM face GROUP BY person_id';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getExitFace(face_token) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM face where face_token=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [face_token], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getImageFace(image_path) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM face where image_path=?';
	// console.log(path);
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [image_path], function(ctx, result) {
					//	 console.log(JSON.stringify(result.rows));
					// console.log("查询成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('查询失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}


function getFaceByPerson(person_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM face WHERE person_id=? ORDER BY rowid DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [person_id], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getFaceByFacesrc(person_id, face_src) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM face WHERE person_id=? and face_src=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [person_id, face_src], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}


function UpdatePersonId(face_token, person_id) {
	websqlOpenDB();
	var updateSQL = 'UPDATE face SET person_id=? WHERE face_token=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [person_id, face_token], function(ctx, result) {
					// console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdateToFaceToken(image_path, face_token, face_rec) {
	websqlOpenDB();
	var updateSQL = 'UPDATE face SET face_token=? WHERE image_path=? and face_rec=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [face_token, image_path, face_rec], function(ctx, result) {
					console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdateOneFaceInfo(face_token, age, gender, ethnicity) {
	websqlOpenDB();
	var updateSQL = 'UPDATE face SET age=?,gender=?,ethnicity=? WHERE face_token=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [age, gender, ethnicity, face_token], function(ctx, result) {
					// console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdateFaceInfo(person_id, age, gender, ethnicity) {
	websqlOpenDB();
	var updateSQL = 'UPDATE face SET age=?,gender=?,ethnicity=? WHERE person_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [age, gender, ethnicity, person_id], function(ctx, result) {
					// console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function deleteImageToFace(image_path) {
	var deleteSQL = 'DELETE FROM face where image_path=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx, result) {
			ctx.executeSql(deleteSQL, [image_path], function(ctx, result) {
				// console.log("删除表数据成功 ");
			}, function(tx, error) {
				console.log('删除表数据失败:' + error.message);
			});
		});
	});
	return pm;
}



function createRelation() {
	var tableName = 'relation';
	var params = " personA_id text NOT NULL, personB_id text NOT NULL, person_relation text,"+
	" person_intimacy INTEGER, image_num INTEGER, modify_flag INTEGER, PRIMARY KEY(personA_id, personB_id)"+
	"FOREIGN KEY(personA_id) References person(person_id),FOREIGN KEY(personB_id) References person(person_id)";
	websqlCreatTable(tableName, params);
}

function InsertToRelation(personA_id, personB_id, person_relation, person_intimacy, image_num) {
	websqlOpenDB();
	var insertSQL = 'INSERT INTO relation (personA_id, personB_id, person_relation, person_intimacy, image_num, modify_flag) VALUES (?,?,?,?,?,?)';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [personA_id, personB_id, person_relation, person_intimacy, image_num, 0], function(ctx, result) {
					// console.log("插入成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('插入失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function getRelatedPerson(personA_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM relation where personA_id=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [personA_id], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}

function getOneRelation(personA_id, personB_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM relation where personA_id=? and personB_id=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [personA_id, personB_id], function(ctx, result) {
				// console.log("查询成功");
				resolve(result);
			}, function(tx, err) {
				console.log("查询失败");
				reject(err);
			})
		})
	});
	return pm;
}


function UpdatePersonRelation(personA_id, personB_id, person_relation) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET person_relation=?,modify_flag=? WHERE personA_id=? and personB_id=? ';
	var pm ;
	if(person_relation == '爱人' ||person_relation == '父母' || person_relation == '孩子' || person_relation == '同学' || person_relation == '同事'){
		var person_relation1 = person_relation;
		if(person_relation == '父母'){
			person_relation1 = '孩子';
		}
		if(person_relation == '孩子'){
			person_relation1 = '父母';
		}
		pm = new Promise(function(resolve, reject) {
			dataBase.transaction(function(ctx) {
				ctx.executeSql(updateSQL, [person_relation, 1, personA_id, personB_id], function(ctx, result) {
						console.log("更新成功");
						// resolve(result);
						//return ;
					},
					function(tx, error) {
						console.log('更新失败: ' + error.message);
						reject(error);
					});
				ctx.executeSql(updateSQL, [person_relation1, 1, personB_id, personA_id], function(ctx, result) {
						console.log("更新成功");
						resolve(result);
					},
					function(tx, error) {
						console.log('更新失败: ' + error.message);
						reject(error);
					});
			});
		});
	}else{
		pm = new Promise(function(resolve, reject) {
			dataBase.transaction(function(ctx) {
				ctx.executeSql(updateSQL, [person_relation, 1, personA_id, personB_id], function(ctx, result) {
						console.log("更新成功");
						 resolve(result);
						//return ;
					},
					function(tx, error) {
						console.log('更新失败: ' + error.message);
						reject(error);
					});
			});
		});
	}
	
	return pm;
}

function UpdatePersonIntimacy(personA_id, personB_id, person_relation, person_intimacy, image_num) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET person_relation=?,person_intimacy=?,image_num=? WHERE personA_id=? and personB_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [person_relation, person_intimacy, image_num, personA_id, personB_id], function(ctx, result) {
					// console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function UpdateRelationImageNum(personA_id, personB_id, image_num) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET image_num=? WHERE personA_id=? and personB_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [image_num, personA_id, personB_id], function(ctx, result) {
					console.log("更新成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function DeleteRelation(person_id) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM relation WHERE personA_id=? or personB_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [person_id, person_id], function(ctx, result) {
					// console.log("删除成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('删除失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}

function DeleteOneRelation(personA_id, personB_id) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM relation WHERE personA_id=? and personB_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [personA_id, personB_id], function(ctx, result) {
					// console.log("删除成功");
					resolve(result);
				},
				function(tx, error) {
					console.log('删除失败: ' + error.message);
					reject(error);
				});
		});
	});
	return pm;
}














