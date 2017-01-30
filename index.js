import fs from 'fs'

import _ from 'lodash';
import Immutable from 'immutable';
import async from 'async';
import requestModule from 'request'

import { pipe } from './lib/'

const config = require('./config/config.json');

//TODO: Arreglar esta importacion
const MongoClient = require('mongodb').MongoClient

MongoClient.connect(config.mongoUri, (err, db) => {
	console.log('Mongo OK')

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

						const name = i.nombreInstrumento

						console.log(`Scrappeando ${name}...`)

						const state = {
							db						: db,
							request				: request,
							saveDir				: config.saveDir,
							instrumentInfo: i
						}

						return pipe(state)
					})).then(finalStates  => {

						finalStates.forEach( (fs) => {

							const name = fs.name
							const results = fs.results

							console.log(`\nResultados para ${name}:`)

							results.forEach( (r) => {
								console.log(r)
							})

						})

						db.close();
					})

	})
})
