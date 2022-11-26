class Panzas {
	U = {};
	db = {};

	constructor() {
	}

	load(name, cls) {
		this.db[name] = new cls();
	}

	_image(name, url) {
		let a = document.createElement('a');
		a.href = url;
		a.target = "_blank"
		let div = document.createElement('div');
		div.classList.add("image");
		let img = document.createElement('img');
		let p = document.createElement('p');
		div.appendChild(img);
		div.appendChild(p);
		img.loading = "lazy";
		img.src = url;
		img.alt = name;
		p.textContent = name;
		a.appendChild(div)
		return a;
	}

	_rom(info) {
		let div = document.createElement('div');
		div.classList.add("rom");
		let a = document.createElement('a');
		let span = document.createElement('span');
		div.appendChild(a);
		div.appendChild(span);
		a.href = info.url;
		a.textContent = info.name;
		span.textContent = " " + ((info.size/1024)/1024).toFixed(2) + "M";
		return div;
	}

	_tag(key, value) {
		let div = document.createElement('div');
		div.classList.add("tag");
		div.classList.add(key);
		let span = document.createElement('span');
		div.appendChild(span);
		span.textContent = value;
		return div;
	}

	_pre(text) {
		if (!text) {
			return null;
		}
		return text.replace(/\[CR\]/ig, '\n');
	}

	init() {
		this.U.header = document.createElement('header');
		this.U.title = document.createElement('h1');
		this.U.title.textContent = "PanZaS";
		this.U.header.appendChild(this.U.title);

		this.U.dbs = document.createElement('select');
		this.U.dbs.appendChild(document.createElement('option'));
		for (let name in this.db) {
			let opt = document.createElement('option');
			opt.textContent = name;
			opt.value = name;
			this.U.dbs.appendChild(opt);
		}
		this.U.header.appendChild(this.U.dbs);

		this.U.dbs.onchange = function(e) {
			this.U.games.innerHTML = '';
			this.U.tables.innerHTML = '';
			if (this.U.dbs.value.length < 1) {
				return;
			}
			this.db[e.target.value].file()
				.then(list => {
					this.U.tables.appendChild(document.createElement('option'));
					for (let i in list) {
						let opt = document.createElement('option');
						opt.textContent = list[i];
						opt.value = list[i];
						this.U.tables.appendChild(opt);					
					}
				});
		}.bind(this);

		this.U.tables = document.createElement('select');
		this.U.tables.onchange = function(e) {
			this.U.games.innerHTML = '';
			if (this.U.dbs.value.length < 1 || this.U.tables.value.length < 1) {
				return;
			}
			this.U.games.classList.add("loading");
			this.db[this.U.dbs.value].table(this.U.tables.value)
				.then(list => {
					for (let i in list.game) {
						let li = document.createElement('li');
						let details = document.createElement('details');

						let summary = document.createElement('summary');
						let title = document.createElement('span');
						title.textContent = list.game[i].name;
						title.classList.add("name");
						summary.appendChild(title);
						details.appendChild(summary);

						let tags = document.createElement('div');
						tags.classList.add("tags");
						for (let key of ["year", "studio", "nplayers", "ESRB", "region", "developer", "releaseyear", "publisher", "franchise", "esrb_rating", "origin"]) {
							if (list.game[i][key]) {
								tags.appendChild(this._tag(key, list.game[i][key]));
							}
						}
						details.appendChild(tags);

						let genres = document.createElement('div');
						genres.classList.add("genres");
						for (let ii in list.game[i].genre) {
							genres.appendChild(this._tag('genre', list.game[i].genre[ii]));
						}
						details.appendChild(genres);

						let roms = document.createElement('div');
						roms.classList.add("roms");
						for (let ii in list.game[i].roms) {
							roms.appendChild(this._rom(list.game[i].roms[ii]));
						}
						details.appendChild(roms);

						let pre = document.createElement('pre');
						pre.textContent = this._pre(list.game[i].plot) || list.game[i].description;
						details.appendChild(pre);

						let images = document.createElement('div');
						images.classList.add("images");
						for (let ii in list.game[i].images) {
							images.appendChild(this._image(ii, list.game[i].images[ii]));
						}
						details.appendChild(images);

						li.appendChild(details);
						this.U.games.appendChild(li);		
					}
					this.U.games.classList.remove("loading");
				});
		}.bind(this);
		this.U.header.appendChild(this.U.tables);

		document.body.appendChild(this.U.header);

		this.U.games = document.createElement('ul');
		document.body.appendChild(this.U.games);
	}
}
