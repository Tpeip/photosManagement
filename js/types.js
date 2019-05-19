function getOtherTypeRes() {
	var pro = getAllImage().then(function(imageRes) {
		var beauty = [];
		var baby = [];
		var handsomeboy = [];
		var youngboy = [];
		var publicman = [];
		var teen = [];
		var promiseArr = [];
		let length = imageRes.rows.length;
		for (let i = 0; i < length; i++) {
			let image_path = imageRes.rows.item(i).image_path;
			let type = imageRes.rows.item(i).image_type.split('-');
			let keyword = imageRes.rows.item(i).image_keyword;
			if (keyword.search("公众人物") != -1) {
				publicman.push(image_path);
			}
			if (keyword.search("儿童") != -1) {
				baby.push(image_path);
			}
			if (type.indexOf('人物')) {
				promiseArr.push(getPersonImage(image_path).then(function(personRes) {
					let num = personRes.rows.length;
					let genders = {
						'male': 0,
						'female': 0
					};
					for (let j = 0; j < num; j++) {
						let age = personRes.rows.item(j).age;
						let gender = personRes.rows.item(j).gender;
						let beautyscore = personRes.rows.item(j).beauty;
						if (gender == '男') {
							genders.male++;
						} else {
							genders.female++;
						}
						if (age <= 25 && age >= 14 && gender == '男' && Number(beautyscore) > 60) {
							if (youngboy.indexOf(image_path) == -1) {
								youngboy.push(image_path);
							}
						}
						if (gender == '女' && Number(beautyscore) > 65) {
							if (beauty.indexOf(image_path) == -1) {
								beauty.push(image_path);
							}
						}
						if (age <= 12) {
							if (baby.indexOf(image_path) == -1) {
								baby.push(image_path);
							}
						}
						if (age <= 18 && age >= 12) {
							if (teen.indexOf(image_path) == -1) {
								teen.push(image_path);
							}
						}

					}
					if (genders.female != 0 && youngboy.indexOf(image_path) != -1) {
						let key = youngboy.indexOf(image_path);
						youngboy.splice(key, 1);
					}
					if (genders.male != 0 && beauty.indexOf(image_path) != -1) {
						let key = beauty.indexOf(image_path);
						beauty.splice(key, 1);
					}

				}));
			}
		}
		var promise = Promise.all(promiseArr).then(function() {
			var typeJson = {
				'beauty': beauty,
				'youngboy': youngboy,
				'handsomeboy': handsomeboy,
				'publicman': publicman,
				'baby': baby,
				'teen': teen
			};

			return typeJson;
		});
		return promise;
	})
	return pro;
}


//显示人物照片类型
function setPersonHtml(src, num, i) {
	let person_num = '';
	if (i == 1) {
		person_num = '单人照';
	} else if (i == 2) {
		person_num = '双人照';
	} else {
		person_num = '合照';
	}
	var str = '';
	var name = 'person-' + person_num;
	//	var src = 'http://192.168.1.114:3000/upload/' + user + '/' + name;
	str = '<p class="image-border" onclick="turnTo(\'' + name + '\')">' +
		'<img class="images" src="' + src + '" />' +
		'<label class="label-photo-type">' + person_num + '</label>' + '<br>' +
		'<label style="padding-left: 6px;letter-spacing: 1px;">' + num + '张</label>' +
		'</p>';
	jQuery("#persons").append(str);
}

//显示所有照片类型
function setTypeHtml(type, num, src) {
	if (type == '人物') return;
	var str = '';
	var name = 'type-' + type;
	str = '<p class="image-border" onclick="turnTo(\'' + name + '\')">' +
		'<img class="images" src="' + src + '" />' +
		'<label class="label-photo-type">' + type + '</label>' + '<br>' +
		'<label style="padding-left: 6px;letter-spacing: 1px;">' + num + '张</label>' +
		'</p>';
	jQuery("#types").append(str);
}

function setPersonTypeHtml(type, num, src, allImage) {
	var str = '';
	var name = 'persontype-' + type;
	if (num != 0) {
		str = '<p class="image-border" onclick="turn(\'' + name + '\'' + ',' + '\'' + allImage + '\')">' +
			'<img class="images" src="' + src + '" />' +
			'<label class="label-photo-type">' + type + '</label>' + '<br>' +
			'<label style="padding-left: 6px;letter-spacing: 1px;">' + num + '张</label>' +
			'</p>';
		jQuery("#persons-type").append(str);
	}
}

//查看每个类型的所有照片
function turnTo(type) {
	localStorage.setItem("type", type);
	console.log(type);
	mui.openWindow({
		url: 'tab-types-photo.html',
		show: {
			autoShow: true,
			aniShow: 'slide-in-right',
			duration: 200
		}
	});
}

function turn(type, allImage) {
	localStorage.setItem("type", type);
	localStorage.setItem("allImage", allImage);
	mui.openWindow({
		url: 'tab-types-photo.html',
		show: {
			autoShow: true,
			aniShow: 'slide-in-right',
			duration: 200
		}
	});
}


function getTypeImageRes() {
	var prom = getAllImage().then(function(imageRes) {
		var proArr = [];
		var selfPhoto = [];
		var screenShot = [];
		var card = [];
		var scene = [];
		var food = [];
		var tex = [];
		var construction = [];
		var cartoon = [];
		var transport = [];
		var animal = [];
		var people = [];
		var other = [];
		var singlePerson = [];
		var doublePerson = [];
		var groupPhoto = [];
		for (let i = 0; i < imageRes.rows.length; i++) {
			let image_path = imageRes.rows.item(i).image_path;
			let image_type = imageRes.rows.item(i).image_type.split('-');
			if (image_type.indexOf('自拍') != -1) {
				selfPhoto.push(image_path);
			}
			if (image_type.indexOf('屏幕截图') != -1) {
				screenShot.push(image_path);
			}
			if (image_type.indexOf('证件照') != -1) {
				card.push(image_path);
			}
			if (image_type.indexOf('风景') != -1) {
				scene.push(image_path);
			}
			if (image_type.indexOf('美食') != -1) {
				food.push(image_path);
			}
			if (image_type.indexOf('文本') != -1) {
				tex.push(image_path);
			}
			if (image_type.indexOf('建筑') != -1) {
				construction.push(image_path);
			}
			if (image_type.indexOf('卡通') != -1) {
				cartoon.push(image_path);
			}
			if (image_type.indexOf('交通工具') != -1) {
				transport.push(image_path);
			}
			if (image_type.indexOf('动物') != -1) {
				animal.push(image_path);
			}
			if (image_type.indexOf('其他') != -1) {
				other.push(image_path);
			}
			if (image_type.indexOf('人物') != -1) {
				proArr.push(getPersonImage(image_path).then(function(personRes) {
					let num = personRes.rows.item(0).person_num;
					if (num == 1) {
						singlePerson.push(image_path);
					} else if (num == 2) {
						doublePerson.push(image_path);
					} else {
						groupPhoto.push(image_path);
					}
				}));
			}
		}
		var promise = Promise.all(proArr).then(function() {
			let pro = getOtherTypeRes().then(function(typeRes) {
				var typesJson = {
					'singlePerson': singlePerson,
					'doublePerson': doublePerson,
					'groupPhoto': groupPhoto,
					'selfPhoto': selfPhoto,
					'beauty': typeRes.beauty,
					'youngboy': typeRes.youngboy,
					'handsomeboy': typeRes.handsomeboy,
					'publicman': typeRes.publicman,
					'baby': typeRes.baby,
					'teen': typeRes.teen,
					'scene': scene,
					'food': food,
					'construction': construction,
					'cartoon': cartoon,
					'transport': transport,
					'animal': animal,
					'screenShot': screenShot,
					'card': card,
					'tex': tex,
					'other': other
				};
				return typesJson;
			});
			return pro;
		});
		return promise;
	}).catch(function(err) {
		console.log(err);
	});
	return prom;
}

function getTypeImage() {
	getTypeImageRes().then(function(typeRes) {
		console.log(JSON.stringify(typeRes));
		for (let i in typeRes) {
			let type = '';
			let num = 0;
			let allImage = [];
			switch (i) {
				case 'beauty':
					{
						type = '漂亮小姐姐';
						num = typeRes.beauty.length;
						allImage = typeRes.beauty;
						break;
					}
				case 'youngboy':
					{
						type = '帅气小鲜肉';
						num = typeRes.youngboy.length;
						allImage = typeRes.youngboy;
						break;
					}
				case 'publicman':
					{
						type = '明星';
						num = typeRes.publicman.length;
						allImage = typeRes.publicman;
						break;
					}
				case 'baby':
					{
						type = '可爱小宝贝';
						num = typeRes.baby.length;
						allImage = typeRes.baby;
						break;
					}
				case 'teen':
					{
						type = '活力青少年';
						num = typeRes.teen.length;
						allImage = typeRes.teen;
						break;
					}
				case 'singlePerson':
					{
						type = '单人照';
						num = typeRes.singlePerson.length;
						allImage = typeRes.singlePerson;
						break;
					}
				case 'doublePerson':
					{
						type = '双人照';
						num = typeRes.doublePerson.length;
						allImage = typeRes.doublePerson;
						break;
					}
				case 'groupPhoto':
					{
						type = '合照';
						num = typeRes.groupPhoto.length;
						allImage = typeRes.groupPhoto;
						break;
					}
				case 'selfPhoto':
					{
						type = '自拍';
						num = typeRes.selfPhoto.length;
						allImage = typeRes.selfPhoto;
						break;
					}
				case 'scene':
					{
						type = '风景';
						num = typeRes.scene.length;
						allImage = typeRes.scene;
						break;
					}
				case 'food':
					{
						type = '美食';
						num = typeRes.food.length;
						allImage = typeRes.food;
						break;
					}
				case 'screenShot':
					{
						type = '屏幕截图';
						num = typeRes.screenShot.length;
						allImage = typeRes.screenShot;
						break;
					}
				case 'card':
					{
						type = '证件照';
						num = typeRes.card.length;
						allImage = typeRes.card;
						break;
					}
				case 'tex':
					{
						type = '文本';
						num = typeRes.tex.length;
						allImage = typeRes.tex;
						break;
					}
				case 'construction':
					{
						type = '建筑';
						num = typeRes.construction.length;
						allImage = typeRes.construction;
						break;
					}
				case 'cartoon':
					{
						type = '卡通';
						num = typeRes.cartoon.length;
						allImage = typeRes.cartoon;
						break;
					}
				case 'transport':
					{
						type = '交通工具';
						num = typeRes.transport.length;
						allImage = typeRes.transport;
						break;
					}
				case 'animal':
					{
						type = '动物';
						num = typeRes.animal.length;
						allImage = typeRes.animal;
						break;
					}
					case 'other':
						{
							type = '其他';
							num = typeRes.other.length;
							allImage = typeRes.other;
							break;
						}
				default:
					break;
			}
			//setPersonTypeHtml(type, num, path, allImage);
		}
	});
}