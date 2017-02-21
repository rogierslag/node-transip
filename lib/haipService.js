var Promise = require('bluebird'),
    parseString = require('xml2js').parseString,
    moment = require('moment');

/**
 * HaipService instance constructor
 * @prototype
 * @class haipService
 */
function haipService(instance) {
  this.transip = instance || {};
  this.service = 'HaipService';
}

/**
 * Retrieve list of High Availability IPs on your transip account
 * @return {Promise} argument[0] = array of haips
 */
haipService.prototype.getHaips = function getHaips() {
  var _this = this;

  return this.transip.communicate(this.service, 'getHaips').then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipsResponse'][0]['return'][0] !== void 0) {
        return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipsResponse'][0]['return'][0]['item']);
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Retrieves information for the given domain
 * @param  {String} domain 
 * @return {Promise}       argument[0] = object of domain info
 */
haipService.prototype.getHaip = function getHaip(haipName) {
  var _this = this;

  if(haipName === void 0 || haipName === '') {
    return Promise.reject(new Error(404));
  }

  var data = {
    'haipName': haipName
  };

  return this.transip.communicate(this.service, 'getHaip', [data.haipName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipResponse'][0]['return'][0] !== void 0) {
        return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipResponse'][0]['return']);
      }
      else {
        return {};
      }
    });
  });
};

haipService.prototype.changeHaipVps = function changeHaipVps(haipName, newVps) {
  var _this = this;

  var data = {
    'haipName': haipName,
    'vpsName': newVps
  };

  return this.transip.communicate(this.service, 'changeHaipVps', [data.haipName, data.vpsName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      return true;
    });
  });
};

/**
 * This helper function is used for parsing getInfo requests
 * @param  {Array} infos
 * @return {Promise}
 */
haipService.prototype.infoParser = function infoParser(infos) {
  var _this = this,
    total = [];
  return Promise.resolve(infos).each(function(info) {
    total.push({
      name: info.name[0]['_'],
      status: info.status[0]['_'],
      isBlocked: info.isBlocked[0]['_'],
      ipv4Address: info.ipv4Address[0]['_'],
      ipv6Address: info.ipv6Address[0]['_'],
      vpsName: info.vpsName[0]['_'],
      vpsIpv4Address: info.vpsIpv4Address[0]['_'],
      vpsIpv6Address: info.vpsIpv6Address[0]['_']
    });
  }).then(function() {
    if(total.length === 1) {
      return total[0];
    }
    return total;
  });
};

module.exports = haipService;
