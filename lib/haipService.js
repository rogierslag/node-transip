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
  return this.transip.communicate(this.service, 'getHaips').then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipsResponse'][0]['return'][0] !== void 0) {
        return infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipsResponse'][0]['return'][0]['item']);
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Retrieves information for the HAIP
 * @param  {String} HAIP-name
 * @return {Promise}       argument[0] = object of HAIP info
 */
haipService.prototype.getHaip = function getHaip(haipName) {
  if(haipName === void 0 || haipName === '') {
    return Promise.reject(new Error(404));
  }

  var data = {
    'haipName': haipName
  };

  return this.transip.communicate(this.service, 'getHaip', [data.haipName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function(result) {
      if(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipResponse'][0]['return'][0] !== void 0) {
        return infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getHaipResponse'][0]['return']);
      }
      else {
        return {};
      }
    });
  });
};

/**
 * Switches traffic for one HAIP to another VPS
 * @param  {String} HAIP-name
 * @param  {String} the name of the VPS to which traffic should be routed
 * @return {Promise}       argument[0] = object of HAIP info
 */
haipService.prototype.changeHaipVps = function changeHaipVps(haipName, newVps) {
  var data = {
    'haipName': haipName,
    'vpsName': newVps
  };

  return this.transip.communicate(this.service, 'changeHaipVps', [data.haipName, data.vpsName], data).then(function(body) {
    return Promise.promisify(parseString)(body[1]).then(function() {
      return true;
    });
  });
};

infoParser = function infoParser(infos) {
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
