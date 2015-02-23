var Promise = require( 'bluebird' ),
    sinon = require('sinon'),
    parseString = require('xml2js').parseString,
    moment = require('moment');

var TransIP = require( '../transip' );

describe('I:TransIP:domainService', function() {
  'use strict';

  describe( 'batchCheckAvailability', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should check availability of domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability(['dualdev.com', 'hjabsdjhasdbjkhDBHWJBKjbwejhkjawefvghefbawfewej.nl']).then(function(domains) {
        expect(domains.length).to.eql(2);
        expect(domains[0].name).to.eql('dualdev.com');
        expect(domains[0].status).to.eql('unavailable');
        expect(domains[0].actions[0]).to.eql('internalpull');
        expect(domains[0].actions[1]).to.eql('internalpush');
        expect(domains[1].name).to.eql('hjabsdjhasdbjkhDBHWJBKjbwejhkjawefvghefbawfewej.nl'.toLowerCase());
        expect(domains[1].status).to.eql('free');
        expect(domains[1].actions[0]).to.eql('register');
      }).then(done, done);
    });

    it( 'should throw error without any domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability([]).catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error without any arguments', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchCheckAvailability().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'checkAvailability', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should check availability of a registered domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('dualdev.com').then(function(domain) {
        expect(domain.status).to.eql('unavailable');
      }).then(done, done);
    });

    it( 'should check availability of a free domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('dualdev-asdjkakffaeksufhusafhaskejfeawjksfhbeajvbwejgwfhjaew.com').then(function(domain) {
        expect(domain.status).to.eql('free');
      }).then(done, done);
    });

    it( 'should throw error when there is no domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability('').catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });

    it( 'should throw error when there are no arguments', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.checkAvailability().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getWhois', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return whois information (com)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('dualdev.com').then(function(whois) {
        expect(whois).to.contain('DUALDEV.COM');
        expect(whois).to.contain('Status: clientTransferProhibited');
      }).then(done, done);
    });

    it( 'should return whois information (net)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('sillevis.net').then(function(whois) {
        expect(whois).to.contain('SILLEVIS.NET');
        expect(whois).to.contain('Status: ok');
      }).then(done, done);
    });

    it( 'should return whois error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').then(function(whois) {
        expect(whois).to.contain('No match for "ASKJDASKDJFHAJKFHJAKLDFSAHFKJSADHFJKASDHFJKS.NET".');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getWhois().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getDomainNames', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return a list of domains', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getDomainNames().then(function(domains) {
        expect(domains.indexOf('sillevis.net')).to.be.greaterThan(0);
      }).then(done, done);
    });
  });

  describe( 'getInfo', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return information', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getInfo('sillevis.net').then(function(info) {
        expect(info.nameservers).to.be.ok();
        expect(info.contacts.length).to.eql(3);
        expect(info.dnsEntries).to.be.ok();
        expect(info.branding).to.be.ok();
        expect(info.name).to.eql('sillevis.net');
        expect(info.isLocked).to.eql('false');
        expect(moment(info.registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
      }).then(done, done);
    });

    it( 'should return error for domain not in account', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getInfo('dualdev.com').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });

  describe( 'batchGetInfo', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should throw error for multiple domains when one is wrong', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo(['sillevis.net', 'sierveld.me']).then(function(info) {
        expect(info.length).to.eql(2);
        expect(info[0].nameservers).to.be.ok();
        expect(info[1].nameservers).to.be.ok();
        expect(info[0].contacts.length).to.eql(3);
        expect(info[1].contacts.length).to.eql(3);
        expect(info[0].dnsEntries).to.be.ok();
        expect(info[1].dnsEntries).to.be.ok();
        expect(info[0].branding).to.be.ok();
        expect(info[1].branding).to.be.ok();
        expect(info[0].name).to.eql('sillevis.net');
        expect(info[1].name).to.eql('sierveld.me');
        expect(info[0].isLocked).to.eql('false');
        expect(info[1].isLocked).to.eql('false');
        expect(moment(info[0].registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
        expect(moment(info[1].registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2011-03-08');
      }).then(done, done);
    });

    it( 'should throw error for multiple domains when one is wrong', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo(['sillevis.net', 'dualdev.com']).catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should return information for one domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo('sillevis.net').then(function(info) {
        expect(info.nameservers).to.be.ok();
        expect(info.contacts.length).to.eql(3);
        expect(info.dnsEntries).to.be.ok();
        expect(info.branding).to.be.ok();
        expect(info.name).to.eql('sillevis.net');
        expect(info.isLocked).to.eql('false');
        expect(moment(info.registrationDate, 'X').format('YYYY-MM-DD')).to.eql('2010-05-16');
      }).then(done, done);
    });

    it( 'should return error for domain not in account', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.batchGetInfo('dualdev.com').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });
  });

  describe( 'getAuthCode', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });
    it( 'should return authCode', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode('sillevis.net').then(function(authCode) {
        expect(authCode).to.be.ok();
        expect(typeof authCode).to.eql('string');
      }).then(done, done);
    });

    it( 'should throw error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getAuthCode().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'getIsLocked', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });
    it( 'should return isLocked', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked('sillevis.net').then(function(isLocked) {
        expect(typeof isLocked).to.eql('boolean');
        expect(isLocked).to.eql(false);
      }).then(done, done);
    });

    it( 'should throw error on unknown domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked('askjdaskdjfhajkfhjakldfsahfkjsadhfjkasdhfjks.net').catch(function(err) {
        expect(err.message).to.eql('102: One or more domains could not be found.');
      }).then(done, done);
    });

    it( 'should throw error without domain', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.getIsLocked().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });

  describe( 'register', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should return success', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test.nl'
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return success, with different nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test2.nl',
        'nameservers': {
          'item': [{
            'hostname': 'ns01.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': 'ns02.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }, {
            'hostname': 'ns03.dualdev.com',
            'ipv4': '',
            'ipv6': ''
          }]
        }
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return success, with different contacts', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'sillevis-test2.nl',
        'contacts': {
          'item': [{
            'type': 'registrant',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'info@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'administrative',
            'firstName': 'René',
            'middleName': null,
            'lastName': 'van Sweeden',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'sales@dualdev.com',
            'country': 'NL' // Two letter code
          }, {
            'type': 'technical',
            'firstName': 'Chase',
            'middleName': null,
            'lastName': 'Sillevis',
            'companyName': 'DualDev',
            'companyKvk': '34372569',
            'companyType': 'VOF',
            'street': 'Ravelrode',
            'number': '37',
            'postalCode': '2717GD',
            'city': 'Zoetermeer',
            'phoneNumber': '+31612345678',
            'faxNumber': '',
            'email': 'tech@dualdev.com',
            'country': 'NL' // Two letter code
          }]
        }
      }).then(function(response) {
        expect(response).to.eql(true);
      }).then(done, done);
    });

    it( 'should return error, domain already registered', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'transip.nl'
      }).catch(function(err) {
        expect(err.message).to.eql('303: The domain \'transip.nl\' is not free and thus cannot be registered.');
      }).then(done, done);
    });

    it( 'should return error, domain not available', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.register({
        'name': 'transip.transip-test'
      }).catch(function(err) {
        expect(err.message).to.eql('301: This is not a valid domain name: \'transip.transip-test\'');
      }).then(done, done);
    });
  });

  describe( 'setNameservers', function() {
    var transipInstance;
    beforeEach(function() {
      transipInstance = new TransIP();
    });

    it( 'should update nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers('sillevis.net', {
        'hostname': 'dana.ns.cloudflare.com',
        'ipv4': '',
        'ipv6': ''
      }, {
        'hostname': 'tim.ns.cloudflare.com',
        'ipv4': '',
        'ipv6': ''
      }).then(function(body) {
        // The check for promise.resolve is actually enough, but let's make sure the API isn't doing any crazy stuff 
        parseString(body[1], function (err, result) {
          expect(result['SOAP-ENV:Envelope']['SOAP-ENV:Body']).to.be.ok();
        });
      }).then(done, done);
    });

    it( 'should throw error without nameservers', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers('sillevis.net').catch(function(err) {
        expect(err.message).to.eql('403');
      }).then(done, done);
    });

    it( 'should throw error without domain (or any arguments for that matter)', function(done) {
      this.timeout(30000);
      return transipInstance.domainService.setNameservers().catch(function(err) {
        expect(err.message).to.eql('404');
      }).then(done, done);
    });
  });
});
