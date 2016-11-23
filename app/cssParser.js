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
			// var property = '';
			// var value = '';
			// for (var i = 0; i < declaration.length; i++) {
			// 	property = declaration[i].property;
			// 	value = declaration[i].value;
			// 	var style = {
			// 		selector: selector,
			// 		property: property,
			// 		value: value
			// 	}
			// 	var style = {

			// 	};
			// 	output.push(style);
			// }
			var style = {
				selector: selector,
				declaration: declaration
			};
			output.push(style);
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