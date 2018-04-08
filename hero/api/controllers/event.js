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
	let skus = getSkus(events);
	return Q.fcall(() => {
		return getMerchantProducts(skus);
	}).then(data =>{
		let argumentedData = argumentData(events, data);
		history = _.concat(history, argumentedData);
		console.log(getHistory());
		res.json({"message":"ok"});
	}).catch(err => {
		if (err.statusCode == 404) {
			res.status(404).send({"message":"Unable to get product information"})
		}		
	});
}

function getSkus(events) {
	let sku = {};
	_.forEach(events, event => {
		let merchant = event.merchant;
		if (event.type === "product-view"){
			_.get(sku, [merchant], false) ? sku[merchant].push(event.data.product.sku_code) : _.set(sku, [merchant], [event.data.product.sku_code]);
		} else if (event.type === "transaction"){
			let skus = _.map(event.data.transaction.line_items, "product.sku_code")
			_.get(sku, [merchant], false) ? sku[merchant] = _.union(sku[merchant], skus) : _.set(sku, [merchant], skus);
		}
	});
	return sku;
}

function getMerchantProducts(skus) {
	let productData = {};
	let promises = [];
	_.forEach(_.keys(skus), merchant => {
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