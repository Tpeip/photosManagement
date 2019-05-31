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

function insertType(){
	getAllType().then(function(e){
		if(e.rows.length == 0){
			InsertAllType();
		}
	}).catch(function(err){
		console.log(err)
	})
}

//更新照片分组
function UpdatePersonInFace() {
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
				let person_id = e.faces[i].group_id;
				if (person_id == '0' || person_id == '-1')
					person_id = face_token;
				getOnePerson(person_id).then(function(res){
						getExitFace(face_token).then(function(faceRes){
							if(faceRes.rows.length != 0){
								if(res.rows.length == 0){
									InsertToPerson(person_id);
								}
								UpdatePersonId(face_token, person_id);
							}
						})
				})
			}
			resolve();
		}, function failed(err) {
			console.log(JSON.stringify(err));
			reject(err);
		})
	});
	promise.then(function() {
		// getPersonFace();
	}).then(function() {
		// getPersonGroup();
	}).then(function() {
		updatePerson();
	}).then(function() {
		// verifyFace();
	}).catch(function(err) {
		console.log(err);
	})

}

function updateInfo(){
	getAllPerson().then(function(personRes){
		for(let i = 0; i<personRes.rows.length; i++){
			let person_id = personRes.rows.item(i).person_id;
			getFaceByPerson(person_id).then(function(faceRes){
				let age_sum = 0;
				let person_gender = '';
				let beauty_sum = 0;
				let person_ethnic = '';
				let num = faceRes.rows.length;
				for(let j = 0;j<num; j++){
					let age = faceRes.rows.item(j).age;
					let gender = faceRes.rows.item(j).gender;
					let beauty = faceRes.rows.item(j).beauty;
					let ethnic = faceRes.rows.item(j).ethnicity;
					age_sum = age_sum + Number(age);
					beauty_sum = beauty_sum + Number(beauty);
					if(person_gender == ''){
						person_gender = gender;
					}
					if(person_ethnic == ''){
						person_ethnic = ethnic;
					}
				}
				let person_age = Number(age_sum/num);
				let person_beauty = beauty_sum/num;
				UpdatePersonAllInfo(person_id, person_age, person_gender, person_beauty, person_ethnic);
			})
		}
	}).catch(function(Err){
		console.log(Err);
	})
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
function updatePerson() {
	getAllPerson().then(function(e) {
		for (let i = 0; i < e.rows.length; i++) {
			let person_id = e.rows.item(i).person_id;
			getFaceByPerson(person_id).then(function(res) {
				let length = res.rows.length;
				if (length == 0) {
					DeleteRelation(person_id).then(function(e){
						DeletePerson(person_id);
					});
				}
			}).catch(function(error) {
				console.log(error);
			})
		}
	}).catch(function(error) {
		console.log(error);
	})
};



function getAllRelation() {
	getAllPerson().then(function(res) {
		for (let i = 0; i < res.rows.length; i++) {
			let person_id = res.rows.item(i).person_id;
			getPersonIntimacy(person_id);
		}
	}).catch(function(err) {
		console.log(err);
	})
}

//通过照片数量的比例获取亲密度
function getPersonIntimacy(person_id) {
	var promiseArr = [];
	let persons_intimacy = {};
	let persons_intimacy_num = {};
	getFaceByPerson(person_id).then(function(e) {
		var image_num = e.rows.length;
		for (let i = 0; i < e.rows.length; i++) {
			let image_path = e.rows.item(i).image_path;
			promiseArr.push(
				getImageFace(image_path).then(function(res) {
					for (let j = 0; j < res.rows.length; j++) {
						let id = res.rows.item(j).person_id;
						if (id != person_id) {
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
			handleCorePerson(persons_intimacy, person_id, persons_intimacy_num);
		})
	}).catch(function(err) {
		console.log(err);
	})
}

//处理核心人物所有照片中的人脉关系
function handleCorePerson(persons_intimacy, person_id, persons_intimacy_num) {
	getFaceByPerson(person_id).then(function(e) {
		var image_num = e.rows.length;
		for (let i = 0; i < e.rows.length; i++) {
			let image_path = e.rows.item(i).image_path;
			handleOneImage(persons_intimacy, image_path, person_id, persons_intimacy_num);
		}
	}).catch(function(err) {
		console.log(err);
	})
}

//分析场景是否为同事特有的场景
function analyColleague(keyword) {
	var i = 0;
	for (let i = 0; i < keyword.length; i++) {
		if (colleague.indexOf(keyword[i]) >= 0) {
			return i;
		}
	}
	return -1;
}

//分析场景是否为同学特有的场景
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
function handleOneImage(persons_intimacy, image_path, person_id, persons_intimacy_num) {
	getImageFace(image_path).then(function(res) {
		let personA_id;
		let persons_main = [];
		for (let j = 0; j < res.rows.length; j++) {
			let personA_id_id = res.rows.item(j).person_id;
			if (personA_id_id == person_id) {
				personA_id = {
					'person_id': personA_id_id,
					'age': res.rows.item(j).age,
					'gender': res.rows.item(j).gender
				};
				if (personA_id.age > 23) {
					getImageByPath(image_path).then(function(e) {
						let keyword = e.rows.item(0).image_keyword.split("-");
						let i = analyColleague(keyword);
						personA_id.key = i;
					});
				} else {
					getImageByPath(image_path).then(function(e) {
						let keyword = e.rows.item(0).image_keyword.split("-");
						let i = analyClassmate(keyword);
						personA_id.key = i;
					});
				}
			} else {
				personB_id = {
					'age': res.rows.item(j).age,
					'gender': res.rows.item(j).gender,
					'person_id': personA_id_id,
					'face_src': res.rows.item(j).face_src
				}
				persons_main.push(personB_id);
			}
		}
		for (let i = 0; i < persons_main.length; i++) {
			let persons_num = persons_main.length;
			let id = persons_main[i].person_id;
			getOneRelation(personA_id.person_id, id).then(function(e) {
				if (e.rows.length == 0) {
					// if(persons_num == 1){
					if (persons_main[i].gender != personA_id.gender) {
						if (personA_id.age > 23) {
							if (personA_id.key >= 0) {
								InsertToRelation(personA_id.person_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								InsertToRelation(id, personA_id.person_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
							} else {
								if (Math.abs(persons_main[i].age - personA_id.age) <= 10) {
									if (persons_intimacy[id] >= 60) {
										InsertToRelation(personA_id.person_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[id]);
									} 
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} 
								else if (Math.abs(persons_main[i].age - personA_id.age) > 10 && Math.abs(persons_main[i].age -
										personA_id.age) <= 25) {
									if (persons_intimacy[id] >= 50) {
										InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
									} 
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} 
								else {
									if (persons_intimacy[id] >= 60) {
										if (personA_id.age > persons_main[i].age) {
											InsertToRelation(personA_id.person_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[id]);
										} 
										else {
											InsertToRelation(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
										}
									} 
									else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
										InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
									}
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								}
							}

						} else {  //personA_id.age < 23
							if (Math.abs(persons_main[i].age - personA_id.age) <= 5) {
								if (personA_id.key >= 0 && persons_main[i].age <= 23) {
									InsertToRelation(personA_id.person_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
									InsertToRelation(id, personA_id.person_id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else if (Math.abs(persons_main[i].age - personA_id.age) >= 23) {
								if (persons_intimacy[id] >= 60) {
									InsertToRelation(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
								}
								else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
									InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} 
								else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								if (persons_intimacy[id] >= 50) {
									InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						}
					}
					 else {  //性别相同
						if (personA_id.age > 23) {
							if (personA_id.key >= 0) {
								InsertToRelation(personA_id.person_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								InsertToRelation(id, personA_id.person_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
							} else {
								if (Math.abs(persons_main[i].age - personA_id.age) <= 10) {
									if (persons_intimacy[id] >= 40) {
										if (personA_id.gender == '男') {
											InsertToRelation(personA_id.person_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[id]);
										} 
										else {
											InsertToRelation(personA_id.person_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[id]);
										}
									} 
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} 
								else if (Math.abs(persons_main[i].age - personA_id.age) > 10 && Math.abs(persons_main[i].age -
										personA_id.age) < 25) {
									if (persons_intimacy[id] >= 50) {
										InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
									} 
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} else {
									if (persons_intimacy[id] >= 60) {
										if (personA_id.age > persons_main[i].age) {
											InsertToRelation(personA_id.person_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[id]);
										} 
										else {
											InsertToRelation(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
										}
									} 
									else if(persons_intimacy[id] >=50 && persons_intimacy[id] < 60){
										InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
									}
									else {
										InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
									}
								}
							}
						} 
						else {
							if (Math.abs(persons_main[i].age - personA_id.age) <= 5) {
								if (personA_id.key >= 0) {
									InsertToRelation(personA_id.person_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
									InsertToRelation(id, personA_id.person_id, relations[1], persons_intimacy[id], persons_intimacy_num[id]);
								} 
								else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} 
							else if (Math.abs(persons_main[i].age - personA_id.age) >= 23) {
								if (persons_intimacy[id] >= 60) {
									InsertToRelation(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[id]);
								} 
								else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
									InsertToRelation(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
								} 
								else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							} else {
								if (persons_intimacy[id] >= 40) {
									if (personA_id.gender == '男') {
										InsertToRelation(personA_id.person_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[id]);
									} 
									else {
										InsertToRelation(personA_id.person_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[id]);
									}
								} 
								else {
									InsertToRelation(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[id]);
								}
							}
						}
					}
					// }
				} else {
					if (e.rows.item(0).modify_flag == 0) {
						if (persons_main[i].gender != personA_id.gender) {
							if (personA_id.age > 23) {
								if (personA_id.key >= 0) {
									UpdatePersonIntimacy(personA_id.person_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
									UpdatePersonIntimacy(id, personA_id.person_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									if (Math.abs(persons_main[i].age - personA_id.age) <= 10) {
										if (persons_intimacy[id] >= 60) {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[8], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else if (Math.abs(persons_main[i].age - personA_id.age) > 10 && Math.abs(persons_main[i].age -
											personA_id.age) <= 25) {
										if (persons_intimacy[id] >= 50) {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else {
										if (persons_intimacy[id] >= 60) {
											if (personA_id.age > persons_main[i].age) {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[
													id]);
											} else {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
													id]);
											}
										} 
										else if(persons_intimacy[id] >=50 && persons_intimacy[id] < 60){
											UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
										}
										else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									}
								}

							} else {
								if (Math.abs(persons_main[i].age - personA_id.age) <= 5) {
									if (personA_id.key >= 0) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
										UpdatePersonIntimacy(id, personA_id.person_id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - personA_id.age) >= 23) {
									if (persons_intimacy[id] >= 60) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									if (persons_intimacy[id] >= 50) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								}
							}
						} else {
							if (personA_id.age > 23) {
								if (personA_id.key >= 0) {
									UpdatePersonIntimacy(personA_id.person_id, id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
									UpdatePersonIntimacy(id, personA_id.person_id, relations[2], persons_intimacy[id], persons_intimacy_num[id]);
								} else {
									if (Math.abs(persons_main[i].age - personA_id.age) <= 10) {
										if (persons_intimacy[id] >= 40) {
											if (personA_id.gender == '男') {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[
													id]);
											} else {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[
													id]);
											}
										} else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else if (Math.abs(persons_main[i].age - personA_id.age) > 10 && Math.abs(persons_main[i].age -
											personA_id.age) < 22) {
										if (persons_intimacy[id] >= 50) {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else {
										if (persons_intimacy[id] >= 60) {
											if (personA_id.age > persons_main[i].age) {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[7], persons_intimacy[id], persons_intimacy_num[
													id]);
											} else {
												UpdatePersonIntimacy(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
													id]);
											}
										}
										 else if(persons_intimacy[id] >=50 && persons_intimacy[id] < 60){
										 	UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[id]);
										 }
										 else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									}
								}
							} else {
								if (Math.abs(persons_main[i].age - personA_id.age) <= 5) {
									if (personA_id.key >= 0) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
										UpdatePersonIntimacy(id, personA_id.person_id, relations[1], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else if (Math.abs(persons_main[i].age - personA_id.age) >= 23) {
									if (persons_intimacy[id] >= 60) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[6], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else if (persons_intimacy[id] >= 50 && persons_intimacy[id] < 60) {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[5], persons_intimacy[id], persons_intimacy_num[
											id]);
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
											id]);
									}
								} else {
									if (persons_intimacy[id] >= 40) {
										if (personA_id.gender == '男') {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[3], persons_intimacy[id], persons_intimacy_num[
												id]);
										} else {
											UpdatePersonIntimacy(personA_id.person_id, id, relations[4], persons_intimacy[id], persons_intimacy_num[
												id]);
										}
									} else {
										UpdatePersonIntimacy(personA_id.person_id, id, relations[0], persons_intimacy[id], persons_intimacy_num[
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
	return getAllPerson().then(function(e) {
		for (let i = 0; i < e.rows.length; i++) {
			let person_id = e.rows.item(i).person_id;
			let person_name = e.rows.item(i).person_name;
			promiseArr.push(
			getFaceByPerson(person_id).then(function(resu){
				let face_src = resu.rows.item(0).face_src;
				let onePerson = {
					'person_id': person_id,
					'person_name': person_name,
					'persons': [],
					'face_src': face_src
				};
				allPerson.push(onePerson);
				let pro = new Promise(function(resolve,reject){
					getRelatedPerson(person_id).then(function(res) {
						var promArr = [];
						for (let j = 0; j < res.rows.length; j++) {
							let id = res.rows.item(j).personB_id;
							let relation = res.rows.item(j).person_relation;
							let intimacy = res.rows.item(j).person_intimacy;
							let relatedPerson = {
								'id': id,
								'relation': relation,
								'intimacy': intimacy
							};
							onePerson.persons.push(relatedPerson);
						}
						resolve();
					}).catch(function(err){
						console.log(err);
						reject(err);
					});
				});
				return pro;
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
