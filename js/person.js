//创建相册
function CreateAlbum() {
	if (localStorage.getItem("facealbum_token") == null) {
		let param = {};
		facepp.createAlbum(param, function success(e) {
			let facealbum_token = e.facealbum_token;
			localStorage.setItem("facealbum_token", facealbum_token);
		}, function failed(err) {
			console.log(err);
		});
	}
}

//更新照片分组
function UpdateGroup() {
	var facealbum_token = localStorage.getItem("facealbum_token");
	// console.log(facealbum_token);
	let params = {
		"facealbum_token": facealbum_token
	};
	var promise = new Promise(function(resolve, reject) {
		facepp.getAlbumDetail(params, function success(e) {
			// console.log(JSON.stringify(e));
			let length = e.faces.length;
			for (let i = 0; i < length; i++) {
				let face_token = e.faces[i].face_token;
				let group_id = e.faces[i].group_id;
				if (group_id == '0' || group_id == '-1')
					group_id = face_token;
				UpdateToFace(face_token, group_id);
			}
			resolve();
		}, function failed(err) {
			console.log(err);
			reject(err);
		})
	});
	promise.then(function() {
		getPersonFace();
	}).then(function() {
		getPersonGroup();
	}).then(function() {
		updateGroupFace();
	}).then(function() {
		verifyFace();
	}).catch(function(err) {
		console.log(err);
	})

}

//获取每个组的人脸,并存入数据库
function getPersonGroup() {
	getGroup().then(function(group_res) {
		let num = group_res.rows.length;
		for (let i = 0; i < num; i++) {
			let image_path = group_res.rows.item(i).image_path;
			let group_id = group_res.rows.item(i).group_id;
			let width = group_res.rows.item(i).width;
			let top = group_res.rows.item(i).top;
			let left = group_res.rows.item(i).left;
			let height = group_res.rows.item(i).height;
			let image_num = group_res.rows.item(i).image_num;
			//let face_src = group_res.rows.item(i).face_src;
			// console.log(face_src);
			// console.log(group_id);
			getGroupFaceById(group_id).then(function(res) {
				// console.log(res.rows.length);
				if (res.rows.length == 0) {
					let face_src = getFaceData(image_path, width, top, left, height);
					InsertToGroupFace(group_id, face_src, image_num);
				}
				UpdateImageNum(group_id, image_num);
			}).catch(function(err) {
				console.log(err);
			})
		}
	}).catch(function(err) {
		console.log(err);
	});
}

//获取人脸区域的路径
function getFaceData(image_path, width, top, left, height) {
	//	var rects = face_rect.split('-');
	var faceW = width;
	var faceY = top;
	var faceX = left;
	var faceH = height;
	let image = document.getElementById('img');
	image.src = image_path;
	let c = document.getElementById('can');
	var ctx = c.getContext('2d');
	ctx.drawImage(image, faceX, faceY, faceW, faceH, 0, 0, 300, 150);
	var face_url = c.toDataURL('image/png');
	return face_url;
}

//上传新照片后更新人物的分组
function updateGroupFace() {
	getGroupFace().then(function(e) {
		for (let i = 0; i < e.rows.length; i++) {
			let group_id = e.rows.item(i).group_id;
			getFaceByGroup(group_id).then(function(res) {
				let length = res.rows.length;
				if (length == 0) {
					DeleteGroup(group_id);
					DeleteRelation(group_id);
				}
			}).catch(function(error) {
				console.log(error);
			})
		}
	}).catch(function(error) {
		console.log(error);
	})
};

//查询人物照片获取人脸路径添加到person表中
function getPersonFace() {
	getOnePerson().then(function(e){
		for (let i = 0; i < e.rows.length; i++) {
			let path = e.rows.item(i).image_path;
			let face_token = e.rows.item(i).face_token;
			let src = e.rows.item(i).face_src;
			if (src == null || src == '') {
				let face_rec = e.rows.item(i).face_rec.split('-');
				let width = face_rec[0];
				let top = face_rec[1];
				let left = face_rec[2];
				let height = face_rec[3];
				let face_src = getFaceData(path, width, top, left, height);
				UpdateToPerson( face_token, face_src);
			}
		}
	}).catch(function(e) {
		console.log(e);
	})	
}

//处理人脸出错
function verifyFace() {
	getGroupFace().then(function(groupRes) {
		let num = groupRes.rows.length;
		for (let i = 0; i < num; i++) {
			let group_id = groupRes.rows.item(i).group_id;
			let face_src = groupRes.rows.item(i).face_src;
			getFaceByFacesrc(group_id, face_src).then(function(faceRes) {
				let length = faceRes.rows.length;
				if (length == 0) {
					getFaceByGroup(group_id).then(function(res) {
						let new_face_src = res.rows.item(0).face_src;
						UpdateGroupFaceSrc(group_id, new_face_src);
					}).catch(function(err) {
						console.log(err);
					})
				}
			}).catch(function(err) {
				console.log(err);
			})
		}
	}).catch(function(err) {
		console.log(err);
	})
}

function getAllRelation() {
	getGroupFace().then(function(res) {
		for (let i = 0; i < res.rows.length; i++) {
			let group_id = res.rows.item(i).group_id;
			getPersonIntimacy(group_id);
		}
	}).catch(function(err) {
		console.log(err);
	})
}

//通过照片数量的比例获取亲密度
function getPersonIntimacy(group_id) {
	var promiseArr = [];
	let persons_intimacy = {};
	let persons_intimacy_num = {};
	getFaceByGroup(group_id).then(function(e) {
		var image_num = e.rows.length;
		for (let i = 0; i < e.rows.length; i++) {
			let image_path = e.rows.item(i).image_path;
			promiseArr.push(
				getPersonImage(image_path).then(function(res) {
					for (let j = 0; j < res.rows.length; j++) {
						let id = res.rows.item(j).group_id;
						if (id != group_id) {
							if (persons_intimacy != null) {
								if (persons_intimacy.hasOwnProperty(id)) {
									persons_intimacy[id] = persons_intimacy[id] + 1;
								} else {
									persons_intimacy[id] = 1;
								}
							} else {
								persons_intimacy[id] = 1;
							}
						}
					}
				}).catch(function(error) {
					console.log(error);
				}))
		}
		Promise.all(promiseArr).then(function() {
			for (let id in persons_intimacy) {
				persons_intimacy_num[id] = persons_intimacy[id];
				persons_intimacy['' + id + ''] = parseInt(persons_intimacy['' + id + ''] / image_num * 100);
			}
			handleCorePerson(persons_intimacy, group_id, persons_intimacy_num);
		})
	}).catch(function(err) {
		console.log(err);
	})
}

//处理核心人物所有照片中的人脉关系
function handleCorePerson(persons_intimacy, group_id, persons_intimacy_num) {
	getFaceByGroup(group_id).then(function(e) {
		var image_num = e.rows.length;
		for (let i = 0; i < e.rows.length; i++) {
			let image_path = e.rows.item(i).image_path;
			handleOneImage(persons_intimacy, image_path, group_id, persons_intimacy_num);
		}
	}).catch(function(err) {
		console.log(err);
	})
}

//处理每张照片中核心人物与相关人物间的关系，存入数据库relation表中
function handleOneImage(persons_intimacy, image_path, group_id, persons_intimacy_num) {
	getPersonImage(image_path).then(function(res) {
		let person_core;
		let persons_main = [];
		for (let j = 0; j < res.rows.length; j++) {
			let person_core_id = res.rows.item(j).group_id;
			if (person_core_id == group_id) {
				person_core = {
					'group_id': person_core_id,
					'age': res.rows.item(j).age,
					'gender': res.rows.item(j).gender
				}
			} else {
				person_main = {
					'age': res.rows.item(j).age,
					'gender': res.rows.item(j).gender,
					'group_id': person_core_id,
					'face_src': res.rows.item(j).face_src
				}
				persons_main.push(person_main);
			}
		}
		for (let i = 0; i < persons_main.length; i++) {
			let persons_num = persons_main.length;
			let id = persons_main[i].group_id;
			getOneRelation(person_core.group_id, id).then(function(e) {
				if (e.rows.length == 0) {
					// if(persons_num == 1){
					if (persons_main[i].gender != person_core.gender) {
						if (person_core.age > 20) {
							if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
								if (persons_intimacy[id] >= 60) {
									InsertToRelation(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[id]);
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
									person_core.age) <= 25) {
								if (persons_intimacy[id] >= 50) {
									InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 50) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id],
										persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								if (persons_intimacy[id] >= 60) {
									if (person_core.age > persons_main[i].age) {
										InsertToRelation(person_core.group_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[id]);
									} else {
										InsertToRelation(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						} else {
							if (Math.abs(persons_main[i].age - person_core.age) <= 3) {
								if (persons_intimacy[id] >= 20) {
									InsertToRelation(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else if (Math.abs(persons_main[i].age - person_core.age) >= 23) {
								if (persons_intimacy[id] >= 60) {
									InsertToRelation(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
								} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
									InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
							}
						}
					} else {
						if (person_core.age > 20) {
							if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
								if (persons_intimacy[id] >= 40) {
									if (person_core.gender == '男') {
										InsertToRelation(person_core.group_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[id]);
									} else {
										InsertToRelation(person_core.group_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 40) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
									person_core.age) < 22) {
								if (persons_intimacy[id] >= 50) {
									InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 50) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								if (persons_intimacy[id] >= 60) {
									if (person_core.age > persons_main[i].age) {
										InsertToRelation(person_core.group_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[id]);
									} else {
										InsertToRelation(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
									InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						} else {
							if (Math.abs(persons_main[i].age - person_core.age) <= 3) {
								if (persons_intimacy[id] >= 20) {
									InsertToRelation(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else if (Math.abs(persons_main[i].age - person_core.age) >= 23) {
								if (persons_intimacy[id] >= 60) {
									InsertToRelation(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
								} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
									InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								if (persons_intimacy[id] >= 40) {
									if (person_core.gender == '男') {
										InsertToRelation(person_core.group_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[id]);
									} else {
										InsertToRelation(person_core.group_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						}
					}
					// }
				} else {
					if (e.rows.item(0).modify_flag == 0) {
						if (persons_main[i].gender != person_core.gender) {
							if (person_core.age > 20) {
								if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
									if (persons_intimacy[id] >= 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
										person_core.age) <= 25) {
									if (persons_intimacy[id] >= 50) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 50) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id], persons_intimacy_num[id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									if (persons_intimacy[id] >= 60) {
										if (person_core.age > persons_main[i].age) {
											UpdatePersonIntimacy(person_core.group_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								}
							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 3) {
									if (persons_intimacy[id] >= 20) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) >= 23) {
									if (persons_intimacy[id] >= 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						} else {
							if (person_core.age > 20) {
								if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
									if (persons_intimacy[id] >= 40) {
										if (person_core.gender == '男') {
											UpdatePersonIntimacy(person_core.group_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 40) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
										person_core.age) < 22) {
									if (persons_intimacy[id] >= 50) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 50) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									if (persons_intimacy[id] >= 60) {
										if (person_core.age > persons_main[i].age) {
											UpdatePersonIntimacy(person_core.group_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else if (persons_intimacy[id] >= 20 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								}
							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 3) {
									if (persons_intimacy[id] >= 20) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) >= 23) {
									if (persons_intimacy[id] >= 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									if (persons_intimacy[id] >= 40) {
										if (person_core.gender == '男') {
											UpdatePersonIntimacy(person_core.group_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								}
							}
						}
					}
				}
			}).catch(function(err) {
				console.log(err);
			})
		}
	}).catch(function(error) {
		console.log(error);
	})
}

//allPerson获取所有人物间的关系
var allPerson = [];

function getPersonData() {
	allPerson = [];
	var promiseArr = [];
	return getGroupFace().then(function(e) {
		for (let i = 0; i < e.rows.length; i++) {
			let group_id = e.rows.item(i).group_id;
			let face_src = e.rows.item(i).face_src;
			let group_info = e.rows.item(i).group_info;
			let onePerson = {
				'group_id': group_id,
				'group_info': group_info,
				'persons': [],
				'face_src': face_src
			};
			allPerson.push(onePerson);
			promiseArr.push(
				getRelatedPerson(group_id).then(function(res) {
					var promArr = [];
					for (let j = 0; j < res.rows.length; j++) {
							let id = res.rows.item(j).person_main;
							let relation = res.rows.item(j).person_relation;
							let relatedPerson = {
								'id': id,
								'relation': relation
							};
							onePerson.persons.push(relatedPerson);
					}
				})
			)

		}
		return Promise.all(promiseArr);
	});
}

//将矩形图片转换成圆形
function getImgData(imgSrc) {
	const canvas = document.createElement('canvas');
	const contex = canvas.getContext('2d');
	const img = new Image();
	img.src = imgSrc;
	img.crossOrigin = '';
	center = {
		x: img.width / 2,
		y: img.height / 2
	}
	var diameter = img.width;
	canvas.width = diameter;
	canvas.height = diameter;
	contex.clearRect(0, 0, diameter, diameter);
	contex.save();
	contex.beginPath();
	radius = img.width / 2;
	contex.arc(radius, radius, radius, 0, 2 * Math.PI); //画出圆
	contex.clip(); //裁剪上面的圆形
	contex.drawImage(img, 0, 0, diameter, diameter); // 在刚刚裁剪的园上画图
	contex.restore(); // 还原状态
	// resolve(canvas.toDataURL('image/png', 1))
	let src = canvas.toDataURL('image/png', 1);
	return src;
}
