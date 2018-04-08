const _ = require('lodash');
const Q = require('q');
let history = [];
const h = require('../helpers/productInfo');
const missingProducts = [];

module.exports = {
	addEvent: addEvent,
	getHistory: getHistory,
	getEvents: getEvents
};

function addEvent (req, res, next) {
	let events = req.swagger.params.eventList.value;
	let merchants = getMerchants(events);
	return Q.fcall(() => {
		return getMerchantProducts(merchants);
	}).then(data =>{
		let argumentedData = argumentData(events, data);
		if (_.isEmpty(missingProducts)) {
			history = _.concat(history, argumentedData);
			res.json({"message":"ok"});
		} else {
			return Q.reject({code: "badProduct", ids: missingProducts, message: "One or more products not found."})
		}
	}).catch(err => {
		console.log(err);
		if (err.code === 404) {
			res.status(404).send({"message": "One or more Merchants not found."});
		} else if (err.code === "badProduct") {
			missingProducts.length = 0;
			res.status(404).send({"message": "One or more products could not be found: " + err.ids});
		} else {
			res.status(500).send({"message":"System Error"})
		}		
	});
}

function getEvents(req, res, next) {
	res.json(getHistory());
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
		}).catch(err =>{
			return Q.reject(err);
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
			let sku = _.get(event, "data.product.sku_code", null);
			if (_.isEmpty( merchantProducts[merchant][sku])) {
				missingProducts.push([merchant,sku]);
			}
			event.data.product = _.merge(event.data.product, merchantProducts[merchant][sku]);
		} else if (event.type === "transaction") {
			let lineItems = event.data.transaction.line_items;
			event.data.transaction.line_items = _.map(lineItems, item => {
				let sku = _.get(item, "product.sku_code", null);
				if (_.isEmpty( merchantProducts[merchant][sku])) {
					missingProducts.push([merchant,sku]);
				}
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