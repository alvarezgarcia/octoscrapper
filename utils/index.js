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
