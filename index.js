import fs from 'fs'

import _ from 'lodash';
import Immutable from 'immutable';
import async from 'async';
import requestModule from 'request'

import { pipe } from './lib/'

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
				if(err) throw err
				console.log('Conectado...')

				if(!fs.existsSync(config.saveDir))
					fs.mkdirSync(config.saveDir)

				const enabledInstruments = config.instrumentos.filter( (i) => i.enabled )

				Promise.all(enabledInstruments.map( (i) => {

					console.log(`Scrappeando ${i.nombreInstrumento}...`)

					const state = {
						request				: request,
						instrumentInfo: i,
						saveDir				: config.saveDir
					}

					return pipe(state)
				})).then(finalStates  => {

					finalStates.forEach( (fs) => {

						console.log(`\nResultados para ${fs.instrumentInfo.nombreInstrumento}:`)
						const results = fs.results

						results.forEach( (r) => {
							console.log(r)
						})

					})

				})
})
