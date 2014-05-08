var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

var AD = require('ad-utils');
var GR = require(path.join('..', 'globalRegistry-api.js'));

var mockAD = AD.test.mockAD;


//mockAD.debug( AD.log );


describe('test GR()',function(){

    var testPath = '';

    before(function(done){

        done();

    });

    after(function(done){
        
        done();
    });




    it('GR base url needs to end in a "/"  ',function(){

        mockAD.reset();


        var endsProperly = function( str ) {
            var isCorrect = true;

            if ( str[str.length-1] != '/') isCorrect = false;
            if ( str[str.length-2] == '/') isCorrect = false;

            return isCorrect;
        }

        var gr = new GR({}, mockAD);
        assert(endsProperly(gr.opts.grBase), ' :=>  default url ends proprly');

        gr = new GR({grBase:'https://single.url.no.slash'}, mockAD);
        assert(endsProperly(gr.opts.grBase), ' :=>  url no slash is correctly modified');

        gr = new GR({grBase:'https://single.url.with.slash/'}, mockAD);
        assert(endsProperly(gr.opts.grBase), ' :=>  url with slash is correctly modified');


        gr = new GR({grBase:'base.no.double.slash'}, mockAD);
        assert(endsProperly(gr.opts.grBase), ' :=>  url with no slash base is correctly modified');

    });    


    it('creating GR without an AccessToken results in an error log',function(){

        mockAD.reset();

        var gr = new GR({}, mockAD);

        assert.isTrue(mockAD.val('logErrorCalled'), ' :=>  error was called.');
    });


    it('creating GR under nodejs should have a jar ',function(){

        mockAD.reset();

        var gr = new GR({}, mockAD);

        assert.isDefined(gr.jar, ' :=>  cookie jar was created.');
    });



    it('provided GR.grBase should overwrite the default  ', function() {

        var gr = new GR({ grBase:'newBase' });
        assert(gr.opts.grBase == 'newBase/', ' :=> grBase has been updated correctly. ');
    })



    it('calling GR.request should have GlobalRegistry base info set  ',function(){

        var givenURL = '';
        var accessTokenSet = false;

        mockAD.reset();
        mockAD.onHttp(function( params ) {

            givenURL = params.url;
            if (params.headers) {
                if (params.headers.Authorization) {
                    accessTokenSet = params.headers.Authorization;
                }
            }

        });
        var gr = new GR({}, mockAD);
        gr.request({
            path:'path',
            method:'get',
            data:{}
        });

        assert( givenURL.indexOf(gr.opts.grBase) != -1 , ' :=>  global registry base was added to url.');
        assert.ok(accessTokenSet, ' :=> access token header was set.');
        if (accessTokenSet) {
            assert( accessTokenSet.indexOf('Bearer '+gr.opts.accessToken) != -1, ' :=> access token was set to proper value.');
        }
    });



    it('calling GR.makeFilter should  process embedded filter options properly ',function(){

        var givenURL = '';
        var accessTokenSet = false;

        mockAD.reset();

        // make sure given ary  contains each of the values in keys[]
        var containsEach = function( ary, keys ) {
            var isCorrect = true;

            keys.forEach(function(key){
                if (ary.indexOf(key) == -1) isCorrect = false;
            })

            return isCorrect;
        }

        var gr = new GR({}, mockAD);

        // calling makeFilter with no data should return : ''
        assert( gr.makeFilter() == '', ' :=> returns empty string with no input ');


        // single filter,  1 level deep
        var expectedFilters = [ 'filters[lastName]=Neo' ];
        var filter = gr.makeFilter({ lastName:'Neo'});
        assert.ok( containsEach([filter], expectedFilters), ' :=> contains single field');


        // 2 filters,  2 levels deep
        expectedFilters.push('filters[destination][name]=zion');
        var filter = gr.makeFilter({ lastName:'Neo', destination:{ name:'zion' }})
        var filters = filter.split('&');
        assert.ok( containsEach(filters, expectedFilters), ' :=> contains 2 filters ');


        // 3 filters,  3 levels deep,  2 on shared tree
        expectedFilters.push('filters[destination][subLoc][name]=z2');
        var filter = gr.makeFilter({ lastName:'Neo', destination:{ name:'zion', subLoc:{ name:'z2' } }})
        var filters = filter.split('&');
        assert.ok( containsEach(filters, expectedFilters), ' :=> contains 3 filters with 3 levels ');

    });

});