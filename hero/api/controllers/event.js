const _ = require('lodash');
const Q = require('q');
let history = [];
const h = require('../helpers/productInfo');

module.exports = {
	addEvent: addEvent,
	getHistory: getHistory
};

function addEvent (req, res, next) {
	let events = req.swagger.params.eventList.value;
	let merchants = getMerchants(events);
	return Q.fcall(() => {
		return getMerchantProducts(merchants);
	}).then(data =>{
		let argumentedData = argumentData(events, data);
		history = _.concat(history, argumentedData);
		console.log(JSON.stringify(history, null, 2));
		res.json({"message":"ok"});
	}).catch(err => {
		if (err.statusCode == 404) {
			res.status(404).send({"message":"Unable to get product information"})
		}		
	});
}

function getMerchants(events) {
	let merchants = _.map(events, "merchant");
	return _.uniq(merchants);
}

function getMerchantProducts(merchants) {
	let productData = {};
	let promises = [];
	_.forEach(merchants, merchant => {
		let promise = h.getProductInfo(merchant).then(data => {
			let modifiedData = _.reduce(data, (obj, item) => {
				obj[item.sku_code] = item;
				return obj;
			}, {});
			_.set(productData, [merchant], modifiedData);
		});
		promises.push(promise)
	});
	return Q.all(promises).then(() => {
		return productData;
	}).catch(err => {
		return Q.reject(err);
	});

}

function argumentData(events, merchantProducts) {
	return _.map(events, event => {
		let merchant = event.merchant;
		if (event.type === "product-view") {
			let sku = event.data.product.sku_code;
			event.data.product = _.merge(event.data.product, merchantProducts[merchant][sku]);
		} else if (event.type === "transaction") {
			let lineItems = event.data.transaction.line_items;
			event.data.transaction.line_items = _.map(lineItems, item => {
				let sku = item.product.sku_code;
				item.product = _.merge(item.product, merchantProducts[merchant][sku]);
				return item;
			});
		}
		return event;
	});
}

function getHistory() {
	return history;
}