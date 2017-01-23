import fs from 'fs'

import cheerio from 'cheerio'
import async from 'async'

import instrumentFields from '../config/instrumentos/'


const _genRangeInclusive = n => Array.from({length: n + 1}, (value, key) => key)

function __download(url, index, request) {

	return new Promise ( (resolve, reject) => {

		request(url, (err, httpResponse, body) => {
			resolve({index: index, code: httpResponse.statusCode, body: body})
		})

	}).then(r => r)

}

function _download(url, index, request) {

	return (done) => {
		request(url, (err, httpResponse, body) => {
			done(null, {index: index, code: httpResponse.statusCode, body: body})
		})
	}

}


function _save(file, content) {

	return new Promise ( (resolve, reject) => {

		fs.writeFile(file, content, (err) => {
			resolve({file: file, status: 'ok'})
		})

	}).then(r => r)
}


export function getPages(state) {

	return new Promise( (resolve, reject) => {
		const request = state.request.get
		const url = state.instrumentInfo.url

		request(url, (err, httpResponse, body) => {
			let $ = cheerio.load(body)

			const pages = $('.pager-last').children()
			const lastPage = pages.attr('href').split('&page=')[1]

			resolve(parseInt(lastPage))
		})

	}).then(lastPage => Object.assign({}, state, { lastPage }))
}

export function downloadHtml(state) {

	return new Promise( (resolve, reject) => {
		const request = state.request.get
		const url = state.instrumentInfo.url
		const name = state.instrumentInfo.nombreInstrumento
		const lastPage = state.lastPage


		const indexPages = _genRangeInclusive(lastPage)

		const requestsTasks = indexPages.map( (n) => {
			const u = `${url}&page=${n}`
			//_download(u, n, request)

			return (done) => {
				setTimeout(() => {
					console.log(`Descargando ${name} ${n}/${lastPage}`)
					request(u, (err, httpResponse, body) => {
						done(null, {index: n, code: httpResponse.statusCode, body: body})
					})
				}, 2000)
			}

		})

		async.series(requestsTasks, (err, results) => {
			resolve(results)
		})

	}).then(html => Object.assign({}, state, { html: html }))

}

export function saveHtml(state) {

	return new Promise ( (resolve, reject) => {
		const saveDir = state.saveDir
		const htmlList = state.html
		const instrumentName = state.instrumentInfo.nombreInstrumento

		Promise.all(htmlList.map( (h) => {
			const {index, code, body} = h
			const dir 	= `${saveDir}/${instrumentName}`
			const file 	= `${dir}/${index}.html`

			if(!fs.existsSync(dir))
				fs.mkdirSync(dir)

			return 	_save(file, body)
							.then(r => Object.assign({}, r, { httpCode: code }))

		})).then(r => {
			resolve(r)
		})

	}).then(statuses => Object.assign({}, state, { results: statuses }))
}

export function processHtml(state) {

	const name = state.instrumentInfo.nombreInstrumento
	return new Promise ( (resolve, reject) => {

		const lastPage = state.lastPage
		const indexPages = _genRangeInclusive(lastPage)
		const fields = instrumentFields[name]

		const processTasks = indexPages.map( (i) => {

			const saveDir = state.saveDir
			const instrumentName = state.instrumentInfo.nombreInstrumento

			const fileToOpen = `${saveDir}/${instrumentName}/${i}.html`

			return (done) => {

				fs.readFile(fileToOpen, 'utf8', (err, data) => {

						let $ = cheerio.load(data)

						let qa = fields.map((f) => {
							return $('.'+f).text()
						});

						let ff = qa.map((r) => {
							const p = r.split('\n')
							const question = p.slice(1, 2)[0].trim()
							const answers = p.slice(2, p.length)

							const o = { pregunta: question, respuestas: answers.map( (a) => a.trim()) }

							return o
						}, {});

						done(null, ff)
					})
				}

			})

			async.series(processTasks, (err, results) => {
				const questions = results[0].map(q => q.pregunta)

				const merged = questions.map( (q, i) => {

					const answers = results.reduce( (acc, l) => {
						return acc.concat(l[i].respuestas)
					}, [])

					return { pregunta: q, respuestas: answers }
				})

				resolve(merged)
			})


	}).then(finalList => Object.assign({}, state, {  name: name, finalList: finalList } ))

}

export function upload(state) {

	return new Promise ( (resolve, reject) => {
		const collectionName = state.name
		const db = state.db
		const toSave = state.finalList

		db.collection(collectionName).drop()
		db.collection(collectionName).insert(toSave, (err, records) => {
			resolve(records)
		})

	}).then(records => Object.assign({}, state, {records: records.insertedCount}))
}

	/*
	return (done) => {
		const {nombreInstrumento, url, lastPage} = d;

		const instrumentPagesTasks =  Array(lastPage + 1).join(".").split(".").map( (p, i) => {
			return (done) => {
				const pageUrl = `${url}&page=${i}`;
				const fieldsList = fields[nombreInstrumento];

				_download(request, pageUrl, (err, html) => {
					_saveHtml(html, `/tmp/${nombreInstrumento}-${i}.html`, (err, fileName) => {
						done(null, fileName);
					});
				});
			}
		});

		async.parallel(instrumentPagesTasks, (err, data) => {
			const o = {
				nombreInstrumento: nombreInstrumento,
				archivosInstrumento: data
			}

			console.log(nombreInstrumento, ' descargado');
			done(null, o);
		})

	}
	*/


/*
import fs from 'fs'

import cheerio from 'cheerio'
import async from 'async'

const fields = require('../config/fields.json')

function downloadHtml(d, request) {

	return (done) => {
		const {nombreInstrumento, url, lastPage} = d;

		const instrumentPagesTasks =  Array(lastPage + 1).join(".").split(".").map( (p, i) => {
			return (done) => {
				const pageUrl = `${url}&page=${i}`;
				const fieldsList = fields[nombreInstrumento];

				_download(request, pageUrl, (err, html) => {
					_saveHtml(html, `/tmp/${nombreInstrumento}-${i}.html`, (err, fileName) => {
						done(null, fileName);
					});
				});
			}
		});

		async.parallel(instrumentPagesTasks, (err, data) => {
			const o = {
				nombreInstrumento: nombreInstrumento,
				archivosInstrumento: data
			}

			console.log(nombreInstrumento, ' descargado');
			done(null, o);
		})

	}

}


function getPages({nombreInstrumento, url}, request) {
	return (done) => {

		request.get(url, (err, httpResponse, body) => {
			let $ = cheerio.load(body);

			const pages = $('.pager-last').children();
			const lastPage = pages.attr('href').split('&page=')[1]

			done(null, {nombreInstrumento, url, lastPage: parseInt(lastPage)});
		});

	}
}

function _download(request, url, callback) {

	request.get(url, (err, httpResponse, body) => {
		callback(undefined, body);
	});

}

function _saveHtml(htmlCode, destFile, callback) {

	fs.writeFile(destFile, htmlCode, (err) => {
		callback(undefined, destFile);
	});

}

function __download(request, fieldsList, url, callback) {
	request.get(url, (err, httpResponse, body) => {
		let $ = cheerio.load(body);


		let qa = fieldsList.map((f) => {
			return $('.'+f).text();
		});

		let ff = qa.reduce((acc, r) => {
			const p = r.split('\n');
			const question = p.slice(1, 2);
			const answers = p.slice(2, p.length);

			acc[question] = [];
			acc[question] = answers;

			return acc;
		}, {});

		callback(undefined, ff);

	});

}


function scrap({nombreInstrumento, url}, request) {

	return (done) => {
		request.get({url}, (err, httpResponse, body) => {
			let $ = cheerio.load(body);

			const fieldsList = fields[nombreInstrumento];


			let qa = fieldsList.map((f) => {
				return $('.'+f).text();
			});

			let ff = qa.reduce((acc, r) => {
				const p = r.split('\n');
				const question = p.slice(1, 2);
				const answers = p.slice(2, p.length);

				acc[question] = [];
				acc[question] = answers;

				return acc;
			}, {});


			console.log(ff);

			done(null, body);
		})
	}

}

export { scrap, getPages, downloadHtml }
*/
