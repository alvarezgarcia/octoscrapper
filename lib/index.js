import { getPages, downloadHtml, saveHtml, processHtml, upload } from '../utils/'

export function pipe(state) {

	return	getPages(state)
					.then(downloadHtml)
					.then(saveHtml)
					.then(processHtml)
					.then(upload)
					.then(finalState => finalState)

}
