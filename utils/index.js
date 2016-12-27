function scrap({nombreInstrumento, url}, request) {

	return (done) => {
		request.get({url}, (err, httpResponse, body) => {
			done(null, body)
		})
	}

}

export { scrap }
