const toggleCard = (name, quality, target) => chrome.runtime.sendMessage({
	message: 'toggleCard',
	name,
	quality,
	target
}, ({ message, watchlist }) => renderWatchlist(watchlist));

const sortByHighestPercentageDrop = (a, b) => {
	let percentageA = parseInt((1 - a.price/a.initalPrice) * 100);
	let percentageB = parseInt((1 - b.price/b.initalPrice) * 100);

	return percentageB - percentageA;
}

const renderWatchlist = (watchlist) => {
	const watchlistElement = document.getElementById('watchlist');
	watchlistElement.innerHTML = '';

	try {
		for(let card of watchlist.sort(sortByHighestPercentageDrop))
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
					-${card.target}%
				</td>

				<td>
					${card.price} (${parseInt((1 - card.price/card.initalPrice) * 100) * - 1}%)
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