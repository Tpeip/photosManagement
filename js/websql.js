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
function createImageTable() {
	var tableName = 'image';
	var params =
		"image_id INTEGER PRIMARY KEY AUTOINCREMENT,image_path text NOT NULL,image_main_type text NOT NULL,image_type text NOT NULL,image_keyword text NOT NULL,image_date text NOT NULL";
	websqlCreatTable(tableName, params);
}

function getAllImage() {
	websqlOpenDB();
	var selectALLSQL = 'SELECT * FROM image ORDER BY image_id DESC';
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

function getAllType() {
	websqlOpenDB();
	var selectALLSQL = 'SELECT distinct(image_main_type) FROM image';
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


function getTypeOne(image_type) {
	websqlOpenDB();
	//	console.log(image_type);
	var selectSQL = 'SELECT image_path FROM image where image_main_type=? ORDER BY image_id DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [image_type], function(ctx, result) {
					//		         console.log("查询成功");
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


function InsertToImage(num, imageArr) {
	websqlOpenDB();
	var insertImageSQL =
		'INSERT INTO image (image_path,image_main_type,image_type,image_keyword,image_date) VALUES (?,?,?,?,?)';
	for (var i = 0; i < num - 1; i++) {
		insertImageSQL += ',(?,?,?,?,?)';
	}
	//	console.log(insertImageSQL);
	//	console.log(imageArr);
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

/**
 * image中删除数据
 */
function deleteAllImage() {
	var deleteSQL = 'DELETE FROM image';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx, result) {
			ctx.executeSql(deleteSQL, [], function(ctx, result) {
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

function createPersonImage() {
	var tableName = 'person';
	var params =
		"personImg_id INTEGER PRIMARY KEY AUTOINCREMENT, image_path text NOT NULL, person_num INTEGER, face_token text," +
		" width INTEGER, top INTEGER, left INTEGER, height INTEGER, age INTEGER, gender text, beauty text, ethnicity text, emotion text, face_src text, group_id text";
	websqlCreatTable(tableName, params);
}

function getGroup() {
	websqlOpenDB();
	var selectSQL = 'SELECT image_path, group_id, width, top, left, height, face_src, COUNT(*) image_num FROM person GROUP BY group_id';
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

function getPersonImage(image_path) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM person where image_path=?';
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

function getPersonNumImage(num) {
	websqlOpenDB();
	let number;
	if (num == 1) {
		number = " = 1 ";
	} else if (num == 2) {
		number = " = 2 ";
	} else {
		number = " > 2 ";
	}
	var selectALLSQL = 'SELECT DISTINCT(image_path) FROM person WHERE person_num' + number + 'ORDER BY personImg_id DESC';
	console.log(selectALLSQL);
	var pm = new Promise(function(resolve, reject) {
		// console.log(2453647568);
		dataBase.transaction(function(ctx) {
			// console.log(123445646547);
			ctx.executeSql(selectALLSQL, [], function(ctx, result) {
					     // console.log("查询" +   + "成功");
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

function getFaceByGroup(group_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM person WHERE group_id=? ORDER BY personImg_id DESC';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [group_id], function(ctx, result) {
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


function InsertToPerson(num, personArr) {
	websqlOpenDB();
	var insertImageSQL =
		'INSERT INTO person (image_path,person_num, face_token, width, top, left, height, age, gender, beauty, ethnicity, emotion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
	for (var i = 0; i < num - 1; i++) {
		insertImageSQL += ',(?,?,?,?,?,?,?,?,?,?,?,?)';
	}
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertImageSQL, personArr, function(ctx, result) {
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

function UpdateToPerson(image_path, face_token, face_src) {
	websqlOpenDB();
	var insertImageSQL = 'UPDATE person SET face_src=? WHERE face_token=? and image_path=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertImageSQL, [face_src, face_token, image_path], function(ctx, result) {
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

function UpdateToFace(face_token, group_id) {
	websqlOpenDB();
	var updateSQL = 'UPDATE person SET group_id=? WHERE face_token=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [group_id, face_token], function(ctx, result) {
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

function UpdateToFaceToken(image_path, face_token, width, top, left, height) {
	// console.log("*********");
	// console.log(width);
	// console.log(top);
	// console.log(left);
	// console.log(height);
	// console.log("*********");
	websqlOpenDB();
	var updateSQL = 'UPDATE person SET face_token=? WHERE image_path=? and width=? and top=? and left=? and height=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [face_token, image_path, width, top, left, height], function(ctx, result) {
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

function deleteOnePerson(image_path) {
	var deleteSQL = 'DELETE FROM person where image_path=?';
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


function createGroupFace() {
	var tableName = 'groupface';
	var params = " group_id text PRIMARY KEY NOT NULL, face_src text, group_info text, image_num integer";
	websqlCreatTable(tableName, params);
}

function getGroupFaceById(group_id) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM groupface WHERE group_id=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [group_id], function(ctx, result) {
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

function getGroupFace() {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM groupface ORDER BY image_num DESC';
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

function InsertToGroupFace(group_id, face_src, image_num) {
	websqlOpenDB();
	var insertFaceSQL = 'INSERT INTO groupface (group_id ,face_src, image_num) VALUES (?,?,?)';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertFaceSQL, [group_id, face_src, image_num], function(ctx, result) {
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

function UpdateToInfo(group_id, group_info) {
	websqlOpenDB();
	var insertSQL = 'UPDATE groupface SET group_info=? WHERE group_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [group_info, group_id], function(ctx, result) {
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

function UpdateGroupFaceSrc(group_id, face_src) {
	websqlOpenDB();
	var insertSQL = 'UPDATE groupface SET face_src=? WHERE group_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [face_src, group_id], function(ctx, result) {
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

function UpdateImageNum(group_id, image_num) {
	websqlOpenDB();
	var updateSQL = 'UPDATE groupface SET image_num=? WHERE group_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [image_num, group_id], function(ctx, result) {
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

function DeleteGroup(group_id) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM groupface WHERE group_id=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [group_id], function(ctx, result) {
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

function createRelation() {
	var tableName = 'relation';
	var params = " person_core text NOT NULL, person_main text NOT NULL, person_relation text, person_intimacy integer, image_num INTEGER, PRIMARY KEY(person_core, person_main)";
	websqlCreatTable(tableName, params);
}

function getRelatedPerson(person_core) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM relation where person_core=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [person_core], function(ctx, result) {
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

function getOneRelation(person_core, person_main) {
	websqlOpenDB();
	var selectSQL = 'SELECT * FROM relation where person_core=? and person_main=?';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(selectSQL, [person_core, person_main], function(ctx, result) {
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


function InsertToRelation(person_core, person_main, person_relation, person_intimacy, image_num) {
	websqlOpenDB();
	var insertSQL = 'INSERT INTO relation (person_core, person_main, person_relation, person_intimacy, image_num) VALUES (?,?,?,?,?)';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(insertSQL, [person_core, person_main, person_relation, person_intimacy, image_num], function(ctx, result) {
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


function UpdatePersonRelation(person_core, person_main, person_relation) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET person_relation=? WHERE person_core=? and person_main=? ';
	var person_relation1 = person_relation;
	if(person_relation == '父母'){
		person_relation1 = '孩子';
	}
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [person_relation, person_core, person_main], function(ctx, result) {
					console.log("更新成功");
					// resolve(result);
					//return ;
				},
				function(tx, error) {
					console.log('更新失败: ' + error.message);
					reject(error);
				});
			ctx.executeSql(updateSQL, [person_relation1, person_main, person_core], function(ctx, result) {
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

function UpdatePersonIntimacy(person_core, person_main, person_relation, person_intimacy, image_num) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET person_relation=?,person_intimacy=?,image_num=? WHERE person_core=? and person_main=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [person_relation, person_intimacy, image_num, person_core, person_main], function(ctx, result) {
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

function UpdateRelationImageNum(person_core, person_main, image_num) {
	websqlOpenDB();
	var updateSQL = 'UPDATE relation SET image_num=? WHERE person_core=? and person_main=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(updateSQL, [image_num, person_core, person_main], function(ctx, result) {
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

function DeleteRelation(group_id) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM relation WHERE person_core=? or person_main=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [group_id, group_id], function(ctx, result) {
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

function DeleteOneRelation(person_core, person_main) {
	websqlOpenDB();
	var deleteSQL = 'DELETE FROM relation WHERE person_core=? and person_main=? ';
	var pm = new Promise(function(resolve, reject) {
		dataBase.transaction(function(ctx) {
			ctx.executeSql(deleteSQL, [person_core, person_main], function(ctx, result) {
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