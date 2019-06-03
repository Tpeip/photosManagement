var typeArr = ['','单人照','双人照','合照','自拍','漂亮小姐姐','帅气小鲜肉','可爱小宝贝','活力青少年','明星','证件照','风景','美食','文本','建筑','卡通','交通工具','动物','屏幕截图','其他'];

function getOtherTypeRes() {
	var pro = getAllImage().then(function(imageRes) {
		var beauty = [];
		var baby = [];
		var youngboy = [];
		var publicman = [];
		var teen = [];
		var promiseArr = [];
		let length = imageRes.rows.length;
		for(let i = 5; i <10; i++){
			promiseArr.push(DeleteTypeInImage(i));
		}
		for (let i = 0; i < length; i++) {
			let image_path = imageRes.rows.item(i).image_path;
			let person_num = imageRes.rows.item(i).person_num;
			let keyword = imageRes.rows.item(i).image_keyword;
			if (keyword.search("公众人物") != -1) {
				publicman.push(image_path);
			}
			if (person_num >= 1) {
				promiseArr.push(getImageFace(image_path).then(function(personRes) {
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
						if (age <= 18 && age > 12) {
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
				'publicman': publicman,
				'baby': baby,
				'teen': teen
			};
			let proArr = [];
			for(let i = 0; i< beauty.length; i++){
				let type_id = typeArr.indexOf('漂亮小姐姐');
				let image_path = beauty[i];
				proArr.push(
						InsertToImageType(type_id, image_path)
				);
			}
			for(let i = 0; i< youngboy.length; i++){
				let type_id = typeArr.indexOf('帅气小鲜肉');
				let image_path = youngboy[i];
				proArr.push(
					 InsertToImageType(type_id, image_path)
				);
			}
			for(let i = 0; i< baby.length; i++){
				let type_id = typeArr.indexOf('可爱小宝贝');
				let image_path = baby[i];
				proArr.push(
						InsertToImageType(type_id, image_path)
				);
			}
			for(let i = 0; i< teen.length; i++){
				let type_id = typeArr.indexOf('活力青少年');
				let image_path = teen[i];
				proArr.push(
						InsertToImageType(type_id, image_path)
				);
			}
			for(let i = 0; i< publicman.length; i++){
				let type_id = typeArr.indexOf('明星');
				let image_path = publicman[i];
				proArr.push(
						InsertToImageType(type_id, image_path)
				);
			}
			return Promise.all(proArr);
		});
		return promise;
	})
	return pro;
}


function setTypeHtml(type, num, allImage) {
	if (type == '漂亮小姐姐' || type == '帅气小鲜肉' || type == '可爱小宝贝' || type == '活力青少年' || type == '明星') {
		let html = '';
		if (num > 0) {
			html = '<div class="image-border" onclick="turnTo(\'' + type + '\'' + ',' + '\'' + allImage + '\')">' +
				'<img class="images" src="' + allImage[0] + '" />' +
				'<p class="label-photo" style="text-align:left">' + type + '</p><br></div>';
			jQuery("#photos").append(html);
		}
	} else {
		let html = '';
		if (num > 0) {
			html = '<div class="img-border" onclick="turnTo(\'' + type + '\'' + ',' + '\'' + allImage + '\')">' +
				'<img class="images" src="' + allImage[0] + '" />' +
				'<p class="label-type">' + type + '</p>' +
				'<p style="padding-left: 6px;word-spacing: 1px;">' + num + '张</p><br></div>';
			jQuery("#types").append(html);
		}
	}
}

function turnTo(type, allImage) {
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


function getTypeImage() {
	getOtherTypeRes().then(function(){
		getAllType().then(function(typeRes){
			for(let i = 0; i <typeRes.rows.length; i++){
				let type_id = typeRes.rows.item(i).type_id;
				let type_name = typeRes.rows.item(i).type_name;
				getOneTypeImage(type_id).then(function(imageRes){
					let allImage = [];
					let num = imageRes.rows.length;
					for(let j = 0; j <num; j++){
						let image_path = imageRes.rows.item(j).image_path;
						allImage.push(image_path);
					}
					// console.log(allImage);
					setTypeHtml(type_name, num, allImage);
				})
			}
		}).catch(function(err){
			console.log(err);
		});	
	}).catch(function(err){
		console.log(err.message);
	});
	
}
