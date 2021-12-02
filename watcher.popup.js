const toggleCard = (name, quality, target) => chrome.runtime.sendMessage({
	message: 'toggleCard',
	name,
	quality,
	target
}, ({ message, watchlist }) => renderWatchlist(watchlist));

const renderWatchlist = (watchlist) => {
	const watchlistElement = document.getElementById('watchlist');
	watchlistElement.innerHTML = '';

	try {
		for(let card of watchlist)
		{
			const watchlistEntryElement = document.createElement('tr');
			watchlistEntryElement.innerHTML = `
				<td>
					<img src="${card.image_url}" height="100" />
				</td>

				<td>
					${card.name}
				</td>

				<td>
					${card.quality}
				</td>

				<td>
					${card.initalPrice}
				</td>

				<td>
					${(card.initalPrice * (1 - card.target / 100)).toFixed(8)} (-${card.target}%)
				</td>

				<td>
					<button class="removeCardButton" type="button" data-name="${card.name}" data-quality="${card.quality}" data-target="${card.target}">&times; Remove</button>
				</td>
			`;
			watchlistElement.append(watchlistEntryElement);
		}

		const removeCardButtonElements = document.getElementsByClassName('removeCardButton');
		for (let removeCardButtonElement of removeCardButtonElements)
		{
			removeCardButtonElement.addEventListener('click', (event) => {
				let {
					name,
					quality,
					target
				} = event.target.dataset;

				toggleCard(name, quality, target);
			});
		}
	} catch(ex) {

	}
}

chrome.storage.local.get({ watchlist: [] }, ({ watchlist }) => renderWatchlist(watchlist));