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
		return browser.cookies.getAll({url: tab.url})
		.then(formatCookieFile)
	})
}

formatActiveTabCookies()
.then((cookiesText) => {
	document.getElementById('download-link').href = 'data:text/plain,' + encodeURIComponent(cookiesText)
	document.getElementById('cookies').innerText = cookiesText
})
