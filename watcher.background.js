const QUALITY = {
	4: 'Meteorite',
	3: 'Shadow',
	2: 'Gold',
	1: 'Diamond'
};

const createNotificationForCard = (card) => {
	chrome.notifications.create(card.proto, {
		type: 'basic',
		title: card.name,
		message: `Reached your desired price of ${card.price} (-${card.discount.toFixed(2)}%)!`,
		iconUrl: card.image_url
	}, () => setInterval(() => chrome.notifications.clear(card.market), 10000));
}

const fetchCard = async (cardName, quality) => {
	try {
		const url = new URL('https://api.x.immutable.com/v1/orders');
		url.searchParams.append('direction', 'asc');
		url.searchParams.append('include_fees', 'true');
		url.searchParams.append('order_by', 'buy_quantity');
		url.searchParams.append('page_size', '1');
		url.searchParams.append('sell_metadata', '{"quality":["' + quality + '"]}');
		url.searchParams.append('sell_token_address', '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c');
		url.searchParams.append('sell_token_name', cardName);
		url.searchParams.append('sell_token_type', 'ERC721');
		url.searchParams.append('status', 'active');

		const response = await fetch(url).then(response => response.json());

		let offer = response.result[0];

		const {
			name,
			image_url
		} = offer.sell.data.properties;

		const {
			decimals,
			quantity
		} = offer.buy.data;

		const parameters = new URLSearchParams(image_url.split('?')[1]);

		const proto = [parameters.get('id'), parameters.get('q')].join('-');

		return {
			name,
			image_url,
			quality,
			proto,
			price: (quantity / Math.pow(10, decimals)).toFixed(8),
			market: `https://tokentrove.com/account/collection/GodsUnchainedCards/${proto}`
		};
	}
	catch(ex) {
		console.log(ex);
		return null;
	}
}

chrome.notifications.onClicked.addListener((proto) => {
	chrome.tabs.create({ 
		url: `https://tokentrove.com/account/collection/GodsUnchainedCards/${proto}`
	});

	chrome.notifications.clear(proto);
});

chrome.alarms.create('watcher', {
	delayInMinutes: 0,
	periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener(() => {
	chrome.storage.local.get({watchlist: []}, async ({ watchlist }) => {
		for (let { name, quality, target, initalPrice } of watchlist)
		{
			const card = await fetchCard(name, quality);
			if (!card)
				continue;

			let targetPrice = initalPrice * (1 - target / 100)

			if (card.price <= targetPrice)
				createNotificationForCard({
					...card,
					discount: (1 - card.price/initalPrice) * 100
				});
		}
	});
});

const handleMessages = (request, sender, sendResponse) => {
	if (request.message === 'toggleCard')
	{
		let name = request.name;
		let quality = isNaN(request.quality) ? request.quality : QUALITY[request.quality];
		let target = parseInt(request.target);

		chrome.storage.local.get({watchlist: []}, async (result) => {
			let watchlist = result.watchlist;
			let index = watchlist.findIndex(x => x.name === name && x.quality === quality && x.target === target);
			console.log(index);

			if (index === -1)
			{
				const card = await fetchCard(name, quality);
				if (!card)
					return sendResponse({
						watchlist,
						message: 'Failed to fetch card! Please add it again!'
					});

				watchlist = [
					...watchlist,
					{
						...card,
						initalPrice: card.price,
						target
					}
				];
			}
			else
			{
				watchlist = [
					...watchlist.slice(0, index),
					...watchlist.slice(index + 1)
				];
			}
	
			chrome.storage.local.set({ watchlist }, () => sendResponse({
				watchlist,
				message: index === -1
							? `Added "${name}" to Watchlist!`
							: `Removed "${name}" from Watchlist!`
			}));
		});
	}

	return true;
}

chrome.runtime.onMessage.addListener(handleMessages);
chrome.runtime.onMessageExternal.addListener(handleMessages);