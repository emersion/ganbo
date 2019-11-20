function getActiveTab() {
	return browser.tabs.query({currentWindow: true, active: true})
}

function formatBool(b) {
	if (b) {
		return 'TRUE'
	} else {
		return 'FALSE'
	}
}

function formatTimestamp(date) {
	if (!date) {
		return '0'
	}
	return String(Number(date))
}

function formatCookie(cookie) {
	return [
		cookie.domain,
		formatBool(!cookie.hostOnly),
		cookie.path,
		formatBool(cookie.secure),
		formatTimestamp(cookie.expirationDate),
		cookie.name,
		cookie.value,
	]
	.join('\t')
}

function formatCookieFile(cookies) {
	return '# Netscape HTTP Cookie File\n' +
		cookies.map(formatCookie).join('\n') + '\n'
}

function formatActiveTabCookies() {
	return getActiveTab()
	.then((tabs) => {
		const tab = tabs.pop()
		return Promise.all([Promise.resolve(tab.url), getFirstPartyDomain(tab.url)])
		.then((results) => {
			return browser.cookies.getAll({
				url: results[0],
				firstPartyDomain: results[1]
			})
			.then(formatCookieFile)
		})
	})
}

function isFirstPartyIsolated() {
	return browser.privacy.websites.firstPartyIsolate.get({}).then((result) => result.value)
}

/* This function is inteded to return the actual first Party Domain if FPI is enabled and "" otherwise. 
 * Since there are some difficulties exttacting the FP-Domain form the url this method returns null if
 * FPI is enabled. When an actual fix is available either edit or replace this method.
 * 
 * See also: https://github.com/emersion/ganbo/issues/1
*/
function getFirstPartyDomain(url) {
	return isFirstPartyIsolated()
	.then((isolated) => {
		if (isolated) {
			return null
		} else {
			return ""
		}
	})
}

formatActiveTabCookies()
.then((cookiesText) => {
	document.getElementById('download-link').href = 'data:text/plain,' + encodeURIComponent(cookiesText)
	document.getElementById('cookies').innerText = cookiesText
})

/* Only enable cookies for all domains when FPI is disabled */
isFirstPartyIsolated()
.then((isolated) => {
	if (isolated) {
		document.getElementById('link-placeholder').innerText = '# Downloading cookies for all domains is not available when First Party Isolation is enabled.'
	} else {
		document.getElementById('link-placeholder').innerHTML = '# <a href="#" id="download-all"  download="cookies.txt">Click here</a> to download cookies for all domains'

		browser.cookies.getAll({})
		.then(formatCookieFile)
		.then((cookiesText) => {
			document.getElementById('download-all').href = 'data:text/plain,' + encodeURIComponent(cookiesText)
		})
	}
})
