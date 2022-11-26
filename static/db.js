class DB {
	_repo = null;
	_path = null;
	_rev = null;
	_file = {};
	_table = {};

	constructor(repo, path, rev) {
		this._repo = repo;
		this._path = path;
		this._rev = rev;
	}

	_get_db() {
		if(Object.keys(this._file).length) {
			return true;
		}
		const url = "https://api.github.com/repos/"
			+ this._repo
			+ "/contents/"
			+ this._path;
		return fetch(url)
			.then(response => response.json())
			.then(json => {
				for(let i in json) {
					this._file[json[i]['name']] = json[i];
					this._table[json[i]['name']] = null;
				}
			})
			.catch(error => console.log(error));
	}

	_get_table(name) {
		if(this._table[name]) {
			return true;
		}
		const url = "https://raw.githubusercontent.com/"
			+ this._repo
			+ "/"
			+ this._rev
			+ "/"
			+ this._path
			+ "/"
			+ name;
		return fetch(url)
			.then(response => this.parser(response))
			.then(content => this._table[name] = content)
			.catch(error => console.log(error));
	}

	parser(response) {
		return response.json()
			.then(json => json)
	}

	async file(name=null) {
		await this._get_db();
		if(name) return this._file[name];
		return Object.keys(this._file);
	}

	async table(name) {
		if(!this._table[name]) {
			await this._get_table(name);
		}
		return this._table[name];
	}
}
