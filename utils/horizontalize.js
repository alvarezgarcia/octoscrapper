const MongoClient = require('mongodb').MongoClient
import async from 'async';


const collectionList = [ 
	'abandono-de-jovenes',
	'centros-educativos',
	'consulta-joven',
	'egreso-formadores-territorio',
	'egreso-jovenes',
	'entrevista-asoc-de-caficultores',
	'entrevista-para-instituciones',
	'entrevistas-a-empresas',
	'entrevistas-a-productores-y-familias',
	'ficha-institucion-gaag',
	'fichas-pfo',
	'linea-de-base-formadores-territorio',
	'linea-de-base-joven',
	'monitoreo-de-derivaciones',
	'rubrica-de-competencias-momento-0',
	'rubrica-de-competencias-momento-1',
	'rubrica-de-competencias-momento-2'
]


MongoClient.connect('mongodb://localhost:27017/ses', (err, db) => {
	console.log('Mongo OK')

	const tasks = collectionList.map( (c) => {
		return(done) => {

			const collection = db.collection(c)
			collection.find().toArray( (err, doc) => {

				const collectionName = 'indicadores-'+c
				db.collection(collectionName).drop()

				const fields = doc.map( d => d.pregunta)
				const values = doc.map( d => d.respuestas)

				const ff = values[0].map( (v, i) => {

					const fff = fields.reduce( (acc, f, k) => {
						const field = fields[k].replace(/\./g, '_')
						const value = values[k][i] 

						return Object.assign({}, acc, {[field]: value })
					}, {})

					db.collection(collectionName).insert(fff, (err, records) => {
						console.log(records)
					})

				})

				done(null, 123)

			})

		}
	})

	async.series(tasks, (err, results) => {
		//console.log(results)
	})

})

