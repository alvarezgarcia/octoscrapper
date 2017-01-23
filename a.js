import async from 'async'

const tasks = [5, 4, 3, 2, 1, 0].map( (p) => {
	return (done) => {
	console.log('Empieza ', p)
		setTimeout(() => {
			console.log('Termina ', p)
			done(null, `task ${p}`);
		}, p * 1000)
	}
});

console.log('Start')
console.log(tasks)
async.series(tasks, (err, data) => {
	console.log('Data ', data)

})
