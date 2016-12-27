import _ from 'lodash';
import Immutable from 'immutable';
import async from 'async';
import requestModule from 'request'

import { scrap } from './utils/';

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

				async.parallel(	config.instrumentos.map((c) => scrap(c, request)),
											(err, results) => {
												console.log(results)
				})
	}
)


