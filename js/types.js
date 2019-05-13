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
			let main = imageRes.rows.item(i).image_main_type;
			let type = imageRes.rows.item(i).image_type;
			let keyword = imageRes.rows.item(i).image_keyword;
			if (type.search("公众人物") != -1) {
				publicman.push(image_path);
			}
			if (keyword.search("儿童") != -1) {
				baby.push(image_path);
			}
			if (main == '人物') {
				promiseArr.push(getPersonImage(image_path).then(function(personRes) {
					let num = personRes.rows.length;
					let genders = {
						'male' : 0,
						'female' : 0
					};
					for (let j = 0; j < num; j++) {
						let age = personRes.rows.item(j).age;
						let gender = personRes.rows.item(j).gender;
						let beautyscore = personRes.rows.item(j).beauty;
						if(gender == '男'){
							genders.male++;
						}else{
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
						if (age <= 20 && age >= 12) {
							if (teen.indexOf(image_path) == -1) {
								teen.push(image_path);
							}
						}
						
					}
					if( genders.female != 0 && youngboy.indexOf(image_path) != -1){
						let key = youngboy.indexOf(image_path);
						youngboy.splice(key, 1);
					}
					if( genders.male != 0 && beauty.indexOf(image_path) != -1){
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

//获取所有照片的类型
		function getImageType() {
			getAllType().then(function(result) {
				for (let i = 0; i < result.rows.length; i++) {
					//console.log(JSON.stringify(result.rows.item(i)));
					let image_type = result.rows.item(i).image_main_type;
					getTypeOne(image_type).then(function(result) {
						//console.log(JSON.stringify(result.rows.item(0)));
						var image_path = result.rows.item(0).image_path;
						var length = result.rows.length;
						setTypeHtml(image_type, length, image_path);
					}).catch(function(err) {
						console.log(err);
					})
				}
			}).catch(function(err) {
				console.log(err);
			});
		}
		
		//获取人物照片类型
		function getPersonType() {
			for (let i = 1; i <= 3; i++) {
				getPersonNumImage(i).then(function(e) {
					if (e.rows.length != 0) {
						let path = e.rows.item(0).image_path;
						let length = e.rows.length;
						setPersonHtml(path, length, i);
					}
				}).catch(function(e) {
					console.log(e);
				})
			}
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
			if(type == '人物') return;
			var str = '';
			var name = 'type-' + type;
			str = '<p class="image-border" onclick="turnTo(\'' + name + '\')">' +
				'<img class="images" src="' + src + '" />' +
				'<label class="label-photo-type">' + type + '</label>' + '<br>' +
				'<label style="padding-left: 6px;letter-spacing: 1px;">' + num + '张</label>' +
				'</p>';
			jQuery("#types").append(str);
		}
		
		
		function getOtherType() {
			getOtherTypeRes().then(function(typeRes) {
				for(let i in typeRes){
					let type = '';
					let num = 0;
					let path = '';
					let allImage = [];
					switch(i){
						case 'beauty':{
							type = '漂亮小姐姐';
							num = typeRes.beauty.length;
							path = typeRes.beauty[0];
							allImage = typeRes.beauty;
							break;
						}
						case 'youngboy':{
							type = '帅气小鲜肉';
							num = typeRes.youngboy.length;
							path = typeRes.youngboy[0];
							allImage = typeRes.youngboy;
							break;
						}
						case 'publicman':{
							type = '明星';
							num = typeRes.publicman.length;
							path = typeRes.publicman[0];
							allImage = typeRes.publicman;
							break;
						}
						case 'baby':{
							type = '可爱小宝贝';
							num = typeRes.baby.length;
							path = typeRes.baby[0];
							allImage = typeRes.baby;
							break;
						}
						case 'teen':{
							type = '活力青少年';
							num = typeRes.teen.length;
							path = typeRes.teen[0];
							allImage = typeRes.teen;
							break;
						}
						default : break;
					}
					setPersonTypeHtml(type, num, path, allImage);
				}
			});
		}
		
		function setPersonTypeHtml(type, num, src, allImage) {
			var str = '';
			var name = 'persontype-' + type;
			if(num != 0){
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


