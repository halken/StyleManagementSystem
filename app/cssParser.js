exports.cssParser = function(css) {
	'use strict';

	// 何も無ければ空で返値
	if (css === undefined) {
		return [];
	}

	var output = [];

	// ソースのコメント除去
	css = removeComments(css);

	// @importの格納
	// TODO

	// @keyframesの格納
	// TODO

	var CSSRegex = '((\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})';
	var parse = new RegExp(CSSRegex, 'ig');
	var att;
	while (true) {
		att = parse.exec(css);
		if (att === null) {
			break;
		}

		// セレクタの格納
		var selector = '';
		if (att[2] === undefined) {
			selector = att[5].split('\r\n').join('\n').trim();
		} else {
			selector = att[2].split('\r\n').join('\n').trim();
		}

		// @mediaと通常の宣言の区別
		if (selector.indexOf('@media') !== -1) {
			// @media分離処理
			// TODO
		} else {
			// 通常の宣言
			var declaration = parseDeclarations(att[6]);
			var selectors = selector.split(",");
			for (var i = 0; i < selectors.length; i++) {
				selectors[i] = selectors[i].trim();
				selectors[i] = changeComponentName(selectors[i]);
				// セレクタがかぶっているか比較
				var flag = true;
				for (var j = 0; j < output.length; j++) {
					if (output[j].selector == selectors[i]) {
						console.log("[selector duplication] -> " + selectors[i]);
						// かぶっていたらかぶっている宣言を比較
						for (var k = 0; k < declaration.length; k++) {
							console.log("[new["+ k + "]] => " + declaration[k].property);
							var flag2 = true;
							for (var l = 0; l < output[j].declaration.length; l++) {
								console.log("[declaration[" + l + "]] -> " + output[j].declaration[l].property);
								if (declaration[k].property == output[j].declaration[l].property) {
									output[j].declaration[l].value = declaration[k].value;
									flag2 = false;
									break;
								}
							}
							if (flag2) {
								output[j].declaration.push(declaration[k]);
							}
						}
						flag = false;
						break;
					}
				}
				if (flag) {
					var list = [];
					for (var j = 0; j < declaration.length; j++) {
						list.push({
							property: declaration[j].property,
							value: declaration[j].value
						});
					}
					var style = {
						selector: selectors[i],
						declaration: list
					};
					output.push(style);
				}
			}
		}
	}
	return output;
};

// コメントの取り除き
function removeComments(str) {
	var CommentsRegex = '(\\/\\*[\\s\\S]*?\\*\\/)';
	var reg = new RegExp(CommentsRegex, 'ig');
	return str.replace(reg, '');
};

// 宣言のparse
function parseDeclarations(declaration) {
	declaration = declaration.split('\r\n').join('\n');
	var list = [];

	declaration = declaration.split(';');

	for (var i = 0; i < declaration.length; i++) {
		var line = declaration[i];

		line = line.trim();
		line = line.split(':');
		var property = line[0].trim();
		var value = line.slice(1).join(':').trim();

		// !importantの削除
		if (value.indexOf('!important') !== -1) {
			value = value.replace('!important', '').trim();
		}

		if (property.length < 1 || value.length < 1) {
			continue;
		}

		list.push({
			property: property,
			value: value
		});
	}
	return list;
}

// コンポーネント名の変更
function changeComponentName(selector) {
	var newName = '';
	switch (selector) {
		case 'body':
			newName = 'style-body';
			break;
		case 'img':
			newName = 'style-img';
			break;
		case 'hr':
			newName = 'style-line';
			break;
		default:
			newName = selector;
			break;
	}
	// 先頭の'.'を削除
	if (newName.match(/^\..*/)) {
		newName = newName.slice(1);
	}
	// ' .'をローアーキャメルケースに
	newName = newName.replace(/\s{2}\./, ' .');
	while (newName.indexOf(' .') != -1) {
		var num = newName.indexOf(' .');
		newName = newName.replace(' .', '');
		newName = newName.substring(0, num) + toUpperFirstLetter(newName.substring(num));
	}
	// 間の空白を'-'でつなぐ
	if (newName.indexOf(' ')) {
		newName = newName.replace(' ', '_');
	}
	return newName;
}

// 最初の文字を'大文字'に変換する関数
function toUpperFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}