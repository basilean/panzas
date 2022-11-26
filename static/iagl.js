class IAGL extends DB {
	constructor(
		repo = "zach-morris/plugin.program.iagl",
		path = "resources/data/dat_files",
		rev = "main"
	) {
		super(repo, path, rev);
	}

	parser(response) {
		return response.text()
			.then(str => new window.DOMParser().parseFromString(str, "text/xml"))
			.then(data => {
				let table = {'info': {}, 'game': {}};
				[...data.getElementsByTagName("header")[0].children].forEach(function(node) {
					table['info'][node['tagName'].slice(4)] = node['textContent'];
				});
				data.querySelectorAll('game').forEach(function(node) {
					let name = node.attributes.name.value;
					let game = {'roms':[], 'images': {}, 'name': name};
					[...node.children].forEach(function(info) {
						if (info.nodeName == "rom") {
							let file;
							try {
								file = decodeURIComponent(info.attributes.name.value).split('/').reverse()[0];
							}
							catch {
								file = info.attributes.name.value.split('/').reverse()[0];
							}
							let size = "??";
							if (info.attributes.size) {
								size = info.attributes.size.value;
							}
							game['roms'].push({
								'name': file,
								'url': table['info'].baseurl + info.attributes.name.value,
								'size': size
							});
						}
						else if (info.nodeName == "videoid") game['video'] = "https://www.youtube.com/watch?v=" + info.textContent;
						else if (info.nodeName.match(/(snapshot|boxart|fanart|clearlogo|logo|banner).*/)) {
							if (info.textContent.match(/^http/)) game.images[info.nodeName] = info.textContent;
							else game.images[info.nodeName] = 'https://i.imgur.com/' + info.textContent;
						}
						else if (info.nodeName.match(/(groups|genre)/)) game[info.nodeName] = info.textContent.split(',');
						else game[info.nodeName] = info.textContent;
					});
					table['game'][name] = game;
				});
				return table;	
			});
	}
}
