import _ from 'lodash';
import Immutable from 'immutable';
import async from 'async';
import requestModule from 'request'

import { scrap, getPages, downloadHtml } from './utils/';

const config = require('./config/config.json');

let request = requestModule.defaults({jar: true})
request.post({
	url							: config.login.url,
	form: {
		name					: config.login.user, 
		pass					: config.login.password, 
		form_build_id	: config.login.formBuildId,
		form_id				: config.login.formId,
		op						: config.login.op
	}}, (err, httpResponse, body) => {
				if(err) throw err;
				console.log('Conectado...');

				const instrumentosPagesTasks = config.instrumentos.map((c) => getPages(c, request));

				async.parallel(instrumentosPagesTasks, (err, downloadData) => {
					const downloadHtmlTasks = downloadData.map((dd) => downloadHtml(dd, request));

					async.parallel(downloadHtmlTasks, (err, htmlData) => {
						console.log(htmlData)
					})

				})
})


