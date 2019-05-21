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
			console.log(JSON.stringify(err));
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
			let face_rec = group_res.rows.item(i).face_rec.split("-");
			let face_src = getFaceSrc(face_rec, image_path);
			// console.log(face_src);
			let image_num = group_res.rows.item(i).image_num;
			// console.log(111111);
			getGroupFaceById(group_id).then(function(res) {
				if (res.rows.length == 0) {
					InsertToGroupFace(group_id, face_src, image_num);
				}
				// console.log(image_num);
				UpdateImageNum(group_id, image_num);
			}).catch(function(err) {
				console.log(err);
			});
		}
	}).catch(function(err) {
		console.log(err);
	});
}

function getFaceSrc(face_rec, path) {
	let width = Number(face_rec[0]);
	let top = Number(face_rec[1]);
	let left = Number(face_rec[2]);
	let height = Number(face_rec[3]);
	if (width != height) {
		height = width;
	}
	let image = new Image();
	image.src = path;
	let imgWidth = image.width;
	let imgHeight = image.height;
	let newWidth = width * 2;
	let newHeight = height * 2;
	let newLeft = left - width / 2;
	let newTop = top - height / 2;
	let k = 2;
	while (newTop < 0 || newLeft < 0 || (newLeft + newWidth) > imgWidth || (newTop + newHeight) > imgHeight) {
		k++;
		newWidth = width * (k + 2) / k;
		newHeight = height * (k + 2) / k;
		if (newLeft < 0) {
			if (left == 0) {
				newLeft = 0;
			} else {
				newLeft = left - width / k;
			}
		}
		if (newTop < 0) {
			if (top == 0) {
				newTop = 0;
			} else {
				newTop = top - height / k;
			}
		}
		if ((newLeft + newWidth) > imgWidth) {
			newLeft = imgWidth - newWidth;
		}
		if ((newTop + newHeight) > imgHeight) {
			newTop = imgHeight - newHeight;
		}
	}
	let face_src = getFaceData(path, newWidth, newTop, newLeft, newHeight);
	return face_src;
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
	getOnePerson().then(function(e) {
		for (let i = 0; i < e.rows.length; i++) {
			let path = e.rows.item(i).image_path;
			let face_token = e.rows.item(i).face_token;
			let src = e.rows.item(i).face_src;
			if (src == null || src == '') {
				let face_rec = e.rows.item(i).face_rec.split('-');
				let face_src = getFaceSrc(face_rec, path);
				UpdateToPerson(face_token, face_src);
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

function analyColleague(keyword) {
	var i = 0;
	for (let i = 0; i < keyword.length; i++) {
		if (colleague.indexOf(keyword[i]) >= 0) {
			return i;
		}
	}
	return -1;
}

function analyClassmate(keyword) {
	var i = 0;
	for (let i = 0; i < keyword.length; i++) {
		if (classmate.indexOf(keyword[i]) >= 0) {
			return i;
		}
	}
	return -1;
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
				};
				if (person_core.age > 23) {
					getImageByPath(image_path).then(function(e) {
						let keyword = e.rows.item(0).image_keyword.split("-");
						let i = analyColleague(keyword);
						person_core.key = i;
					});
				} else {
					getImageByPath(image_path).then(function(e) {
						let keyword = e.rows.item(0).image_keyword.split("-");
						let i = analyClassmate(keyword);
						person_core.key = i;
					});
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
						if (person_core.age > 23) {
							if (person_core.key >= 0) {
								InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								InsertToRelation(id, person_core.group_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
									if (persons_intimacy[id] >= 60) {
										InsertToRelation(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[id]);
									} else {
										InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
										person_core.age) <= 25) {
									if (persons_intimacy[id] >= 50) {
										InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
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
									} else {
										InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								}
							}

						} else {
							if (Math.abs(persons_main[i].age - person_core.age) <= 5) {
								if (person_core.key >= 0) {
									InsertToRelation(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
									InsertToRelation(id, person_core.group_id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
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
								if (persons_intimacy[id] >= 50) {
									InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						}
					} else {
						if (person_core.age > 23) {
							if (person_core.key >= 0) {
								InsertToRelation(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								InsertToRelation(id, person_core.group_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
									if (persons_intimacy[id] >= 40) {
										if (person_core.gender == '男') {
											InsertToRelation(person_core.group_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[id]);
										} else {
											InsertToRelation(person_core.group_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[id]);
										}
									} else {
										InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
										person_core.age) < 22) {
									if (persons_intimacy[id] >= 50) {
										InsertToRelation(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
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
									} else {
										InsertToRelation(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								}
							}
						} else {
							if (Math.abs(persons_main[i].age - person_core.age) <= 5) {
								if (person_core.key >= 0) {
									InsertToRelation(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
									InsertToRelation(id, person_core.group_id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
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
							if (person_core.age > 23) {
								if (person_core.key >= 0) {
									UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
									UpdatePersonIntimacy(id, person_core.group_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
										if (persons_intimacy[id] >= 60) {
											UpdatePersonIntimacy(person_core.group_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[
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
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									}
								}

							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 5) {
									if (person_core.key >= 0) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
										UpdatePersonIntimacy(id, person_core.group_id, relations[1], persons_intimacy[id], persons_intimacy_num[
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
									if (persons_intimacy[id] >= 50) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								}
							}
						} else {
							if (person_core.age > 23) {
								if (person_core.key >= 0) {
									UpdatePersonIntimacy(person_core.group_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
									UpdatePersonIntimacy(id, person_core.group_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									if (Math.abs(persons_main[i].age - person_core.age) <= 10) {
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
									} else if (Math.abs(persons_main[i].age - person_core.age) > 10 && Math.abs(persons_main[i].age -
											person_core.age) < 22) {
										if (persons_intimacy[id] >= 50) {
											UpdatePersonIntimacy(person_core.group_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
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
										} else {
											UpdatePersonIntimacy(person_core.group_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									}
								}
							} else {
								if (Math.abs(persons_main[i].age - person_core.age) <= 5) {
									if (person_core.key >= 0) {
										UpdatePersonIntimacy(person_core.group_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
										UpdatePersonIntimacy(id, person_core.group_id, relations[1], persons_intimacy[id], persons_intimacy_num[
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
						let intimacy = res.rows.item(j).person_intimacy;
						let relatedPerson = {
							'id': id,
							'relation': relation,
							'intimacy': intimacy
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
