setInterval(() => {
	chrome.runtime.sendMessage({ 'keepAlive': true, });
}, (1 * 1000));


