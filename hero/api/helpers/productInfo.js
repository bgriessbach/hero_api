const _ = require('lodash');
const Q = require('q');
const rp = require('request-promise');

module.exports = {
	getProductInfo: getProductInfo

};

function getProductInfo (merchant) {

	let options = {
		uri: "https://dev.backend.usehero.com/products",
		headers: {
			"x-hero-merchant-id": merchant
		},
		json: true
	};
	return rp(options)
	.then(response => {
		return response;
	}).catch(err => {
		return Q.reject(err);
	});
	
}
