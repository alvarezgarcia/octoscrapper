import { getPages, downloadHtml, saveHtml, processHtml } from '../utils/'

export function pipe(state) {

	return	getPages(state)
					.then(downloadHtml)
					.then(saveHtml)
					.then(processHtml)
					.then(finalState => finalState)

}
