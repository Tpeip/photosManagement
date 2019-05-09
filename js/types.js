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
			// if(keyword.search("美女") != -1){
			// 	beauty.push(image_path);
			// }
			if (keyword.search("儿童") != -1) {
				baby.push(image_path);
			}
			if (main == '人物') {
				promiseArr.push(getPersonImage(image_path).then(function(personRes) {
					let num = personRes.rows.length;
					for (let j = 0; j < num; j++) {
						let age = personRes.rows.item(j).age;
						let gender = personRes.rows.item(j).gender;
						if (age <= 25 && age >= 14 && gender == '男' && Number(beauty) > 60) {
							if (youngboy.indexOf(image_path) == -1) {
								youngboy.push(image_path);
							}
						}
						if (gender == '女' && Number(beauty) > 65) {
							if (beauty.indexOf(image_path) == -1) {
								beauty.push(image_path);
							}
						}
						if (gender == '男' && Number(beauty) > 65) {
							if (handsomeboy.indexOf(image_path) == -1) {
								handsomeboy.push(image_path);
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

function getOtherType() {
	getOtherTypeRes().then(function(typeRes) {
		for(let i in typeRes){
			let type = '';
			let num = 0;
			let path = '';
			let allImage = [];
			switch(i){
				case 'beauty':{
					type = '小姐姐';
					num = typeRes.beauty.length;
					path = typeRes.beauty[0];
					allImage = typeRes.beauty;
					break;
				}
				case 'handsomeboy':{
					type = '帅哥';
					num = typeRes.handsomeboy.length;
					path = typeRes.handsomeboy[0];
					allImage = typeRes.handsomeboy;
					break;
				}
				case 'youngboy':{
					type = '小鲜肉';
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
					type = '儿童';
					num = typeRes.baby.length;
					path = typeRes.baby[0];
					allImage = typeRes.baby;
					break;
				}
				case 'teen':{
					type = '青少年';
					num = typeRes.teen.length;
					path = typeRes.teen[0];
					allImage = typeRes.teen;
					break;
				},
				default : break;
			}
		}
	});
}
