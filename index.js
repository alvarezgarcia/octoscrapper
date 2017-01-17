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


        //function getPage({nombreInstrumento, url}, request) {
        //
        //
        //

        function getPage(t, tt) {
          return new Promise ( (resolve, reject) => {
            resolve(t)
          }).then(salida => salida)
        }

        function delay(e) {
          return new Promise( (resolve, reject) => {
            const r = Math.floor(Math.random() * 10) + 1  
            console.log('Soy ' + e + ' Muero en ' +r )
            setTimeout(() => resolve(e), r * 1000)
          }).then(e => e)
        }

        function doSomething(s) {
          return new Promise ( (resolve, reject) => {
            console.log('Ya estoy en doSomething y soy ' + s)
            resolve(s + ' sxe')
          }).then(salida => salida)

        }

        function comp(t) {
            getPage(t)
            .then(delay)
            .then(doSomething)
            .then(console.log)
        }

        const arr = ['hc', 'bc', 'dc']

        const tasks = arr.map((a) => {
          return (done) => {
            comp(a)
          }
        })

        async.parallel(tasks, (al) => console.log(a))

        /*
				const instrumentosPagesTasks = config.instrumentos.map((c) => getPages(c, request));

				async.parallel(instrumentosPagesTasks, (err, downloadData) => {
					const downloadHtmlTasks = downloadData.map((dd) => downloadHtml(dd, request));

					async.parallel(downloadHtmlTasks, (err, htmlData) => {
						console.log(htmlData)
					})

				})
        */
})


