var Promise = require('bluebird'),
  parseString = require('xml2js').parseString,
  moment = require('moment');

/**
 * DomainService instance constructor
 * @prototype
 * @class domainService
 */
function vpsService(instance) {
  this.transip = instance || {};
  this.service = 'VpsService';
}

vpsService.prototype.getVpses = function getVpses() {
  var _this = this;
  return this.transip.communicate(this.service, 'getVpses').then(function (body) {
      return Promise.promisify(parseString)(body[1]).then(function (result) {
        if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsesResponse'][0]['return'][0] !== void 0) {
          return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsesResponse'][0]['return'][0]['item']);
        }
        else {
          return {};
        }
      });
  });
};

vpsService.prototype.getVps = function getVps(vpsName) {
  var _this = this;

  if (vpsName === void 0 || vpsName === '') {
    return Promise.reject(new Error(404));
  }

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'getVps', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsResponse'][0]['return'][0] !== void 0) {
        return _this.infoParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsResponse'][0]['return']);
      }
      else {
        return {};
      }
    });
  });
};

vpsService.prototype.stopVps = function stopVps(vpsName) {
  var _this = this;

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'stop', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      return true;
    });
  });
};

vpsService.prototype.startVps = function startVps(vpsName) {
  var _this = this;

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'start', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      return true;
    });
  });
};

vpsService.prototype.resetVps = function resetVps(vpsName) {
  var _this = this;

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'reset', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      return true;
    });
  });
};

vpsService.prototype.getVpsBackupsByVps = function getVpsBackupsByVps(vpsName) {
  var _this = this;

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'getVpsBackupsByVps', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsBackupsByVpsResponse'][0]['return'] !== void 0) {
        return _this.backupParser(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getVpsBackupsByVpsResponse'][0]['return'][0]['item']);
      }
      else {
        return {};
      }
    });
  });
};

vpsService.prototype.getTrafficInformationForVps = function getTrafficInformationForVps(vpsName) {
  var _this = this;

  var data = {
    'vpsName' : vpsName
  };

  return this.transip.communicate(this.service, 'getTrafficInformationForVps', [data.vpsName], data).then(function (body) {
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      if (result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getTrafficInformationForVpsResponse'][0]['return'] !== void 0) {
        var res = {};
        Promise.resolve(result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getTrafficInformationForVpsResponse'][0]['return'][0]['item']).each(function(o) {
          res[o.key[0]['_']] = o.value[0]['_']
        });
        return res;
        // return result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getTrafficInformationForVpsResponse'][0]['return'][0]['item'];
      }
      else {
        return {};
      }
    });
  });
};


vpsService.prototype.installOperatingSystemUnattended = function installOperatingSystemUnattended(vpsName, operatingSystemName, base64InstallerText) {
  var _this = this;

  var data = {
    'vpsName' : vpsName,
    'operatingSystemName' : operatingSystemName,
    'base64InstallerText' : base64InstallerText
  };

  return this.transip.communicate(this.service, 'installOperatingSystemUnattended', [data.vpsName, data.operatingSystemName, data.base64InstallerText], data).then(function (body) {
    console.log(body);
    return Promise.promisify(parseString)(body[1]).then(function (result) {
      // TODO do some mapping here
      return true;
    });
  });
};

/**
 * This helper function is used for parsing getInfo requests
 * @param  {Array} infos
 * @return {Promise}
 */
vpsService.prototype.infoParser = function infoParser(infos) {
  var _this = this,
    total = [];
  return Promise.resolve(infos).each(function (info) {
    total.push({
      name : info.name[0]['_'],
      description : info.description[0]['_'],
      operatingSystem : info.operatingSystem[0]['_'],
      diskSize : info.diskSize[0]['_'],
      memorySize : info.memorySize[0]['_'],
      cpus : info.cpus[0]['_'],
      status : info.status[0]['_'],
      ipAddress : info.ipAddress[0]['_'],
      macAddress : info.macAddress[0]['_'],
      isBlocked : info.isBlocked[0]['_'],
      isCustomerLocked : info.isCustomerLocked[0]['_']
    });
  }).then(function () {
    if (total.length === 1) {
      return total[0];
    }
    return total;
  });
};

vpsService.prototype.backupParser = function infoParser(infos) {
  var _this = this,
    total = [];
  return Promise.resolve(infos).each(function (info) {
    total.push({
      id : info.id[0]['_'],
      dateTimeCreate : info.dateTimeCreate[0]['_'],
      diskSize : info.diskSize[0]['_'],
      operatingSystem : info.operatingSystem[0]['_']
    });
  }).then(function () {
    if (total.length === 1) {
      return total[0];
    }
    return total;
  });
};

module.exports = vpsService;
