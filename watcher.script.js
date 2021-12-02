((extensionId) => {
	let cardNameTimer = null;
	
	const updateWatchList = (name, quality, target) => chrome.runtime.sendMessage(extensionId, {
		message: 'toggleCard',
		name,
		quality,
		target
	}, ({ message, watchlist }) => alert(message));

	const createButton = () => {
		let linkAreaElement = document.getElementsByClassName('link-area')[0];
		let cardName 		= document.getElementsByClassName('order-details-name')[0].innerText;
		let quality			= document.querySelector('.order-modal-body .gu-card').getAttribute('quality');

		let linkElement = document.createElement('div');
		linkElement.className = 'listing-link';
		linkElement.id = 'ttw-watch-button';
		linkElement.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><g fill="#e6e6e6"><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/></g></svg>
			<span>Watch</span>
		`;
		linkElement.onclick = () => updateWatchList(cardName, quality, prompt('Target percentage drop? (eg.: "25" for minus 25%)'));

		linkAreaElement.append(linkElement);
	};

	window.addEventListener('DOMContentLoaded', (event) => {
		if (cardNameTimer) clearInterval(cardNameTimer);

		cardNameTimer = setInterval(() => {
			if (!document.querySelector('.order-modal-body .gu-card'))
				return;

			if (!document.getElementsByClassName('order-details-name').length)
				return;

			if (!document.getElementsByClassName('link-area').length)
				return;

			if (!document.getElementById('ttw-watch-button'))
				createButton();
		}, 500);
	});
})(document.currentScript.getAttribute("extension-id"));