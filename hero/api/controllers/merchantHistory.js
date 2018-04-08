const _ = require('lodash');
const event = require('./event');

module.exports = {
	getMerchantHistory: getMerchantHistory
};

function getMerchantHistory (req, res, next) {
	let merchant = req.swagger.params.merchant.value;
	let history = _.filter(event.getHistory(), ["merchant", merchant]);
	let response = {
		total_events: history.length,
		number_of_customers: 0,
		events_summary: [{
			"type": "product-view",
			"total_events": 0,
			"number_of_customers": 0
		},
		{
			"type": "transaction",
			"total_events": 0,
			"number_of_customers": 0,
			"total_value": 0
		}
		]
	};
	let custNumber = _.filter(history, "user");
	response.number_of_customers = _.uniq(custNumber).length;
	let product = _.filter(history, ["type", "product-view"]);
	let transaction = _.filter(history, ["type", "transaction"]);
	let productCust = _.filter(product, "user");
	let transactionCust = _.filter(transaction, "user");
	_.set(response, "events_summary[0].total_events", product.length);
	_.set(response, "events_summary[0].number_of_customers", _.uniq(productCust).length);
	_.set(response, "events_summary[1].total_events", transaction.length);
	_.set(response, "events_summary[1].number_of_customers", _.uniq(transactionCust).length);
	let totalValue = _.reduce(_.map(transaction, "data.transaction.total"), (sum, n) => {
		return sum + n;
	}, 0);
	_.set(response, "events_summary[1].total_value", totalValue);
	res.json(response);
}