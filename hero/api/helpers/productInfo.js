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
		if(_.isEmpty(response)) {
			return Q.reject({code: 404, id: merchant, message: "Response from API empty" });
		}
		return response;
	}).catch(err => {
		return Q.reject(err);
	});
	
}
