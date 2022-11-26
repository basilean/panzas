class LibRetro extends DB {
	constructor(
		repo = "libretro/libretro-database",
		path = "rdb",
		rev = "master"
	) {
		super(repo, path, rev);
	}

	a2s(arr) {
		return new TextDecoder("utf-8").decode(arr)
	}

	a2h(arr) {
		var val = "";
		for (let i = 0; i < arr.length; i++) {
			val += arr[i].toString(16);
		}
		return val;
	}

	a2ui(arr) {
		var val = 0;
		for (let i = 0; i < arr.length; i++) {
			val = (val * 256) + arr[i];
		}
		return val;
	}

	list_parse(content, start, end) {
		let count = 0;
		var db = [];
		let key = null;
		let last = null;
		let i = start;
		while (i < end) {
			let byte = content[i];
			if(byte == 192) i++;
			else if(byte > 127 && byte < 160) {
				if(last && last.name) db.unshift(last);
	      last = {};
	      count++;
	      i++;
			}
			else if(byte > 159 && byte < 192) {
				let size = byte - 160;
				let value = this.a2s(content.slice(i+1, i+1+size));
				if (!key) {
					key = value;
				}
				else {
					last[key] = value;
					key = null;
				}
				i += 1 + size;
			}
			else if(byte == 196) {
				let size = content[i+1];
				last[key] = this.a2h(content.slice(i+2, i+2+size));
				key = null
				i += 2 + size;
	    }
			else if(byte == 204) {
				last[key] = content[i+1];
				key = null;
				i += 2;
			}
			else if(byte == 205) {
				last[key] = this.a2ui(content.slice(i+1, i+3));
				key = null;
				i += 3;
			}
			else if(byte == 206) {
				last[key] = this.a2ui(content.slice(i+1, i+5));
				key = null;
				i += 5;
			}
			else if(byte == 217) {
				let size = content[i+1];
				last[key] = this.a2s(content.slice(i+2, i+2+size));
				key = null
				i += 2 + size;
	    }
			else i++;
		}
		if(last && last.name) db.unshift(last);
		db.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
		return db;
	}

	list_tweak(name, content, start, end) {
		let list = this.list_parse(content, start, end);
		for (let i in list) {
			if (list[i].genre) {
				list[i].genre = list[i].genre.split(",");
			}
			list[i].images = {
				"boxarts": "http://thumbnails.libretro.com/" + name + "/Named_Boxarts/" + list[i].name + ".png",
				"titles": "http://thumbnails.libretro.com/" + name + "/Named_Titles/" + list[i].name + ".png",
				"snaps": "http://thumbnails.libretro.com/" + name + "/Named_Snaps/" + list[i].name + ".png"
			}
		}
		return list;
	}

	parser(response) {
		return response.arrayBuffer()
			.then(buffer => {
				if (!buffer) return;
				let barr = new Uint8Array(buffer);
				let offset = this.a2ui(barr.slice(8, 16));
				return {'info': {}, 'game': this.list_tweak(response.url.split("/").at(-1).split(".")[0], barr, 16, offset)};
			});
	}
}
