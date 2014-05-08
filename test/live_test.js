var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

var AD = require('ad-utils');
var GRObj = require(path.join('..', 'globalRegistry-api.js'));

var mockAD = AD.test.mockAD;


// to Enable debugging comments in mockAD code: uncomment the following:
//mockAD.debug( AD.log );



describe('test GR.*() on live site ',function(){

    this.timeout(0);
    var GR = null;

    before(function(done){
        GR = new GRObj({ grBase: 'http://gr.stage.uscm.org', accessToken:'eLGJ0MioSMRcQJDr5W4ihw' }, AD);
        done();

    });

    after(function(done){
        
        done();
    });




    it('calling GR.EntityTypes() on live site  ',function(done){


        
        GR.EntityTypes()
        .fail(function(err){

            assert.ok(false, ' :=> should have completed successfully ');
            done();
        })
        .then(function(types) {

            assert.isArray(types, ' :=> returned an array. ');
            done();

        });

    });




    it('calling GR.EntityTypes(filter) on live site  ',function(done){


        
        GR.EntityTypes({ name:'person' })
        .fail(function(err){

            assert.ok(false, ' :=> should have completed successfully ');
            done();
        })
        .then(function(types) {

            assert.isArray(types, ' :=> returned an array. ');
            assert.lengthOf(types, 1, ' :=> returned entity types were filtered by name. ');
            assert(types[0].name() == 'person', ' :=> returned entity type was the one we asked for. ');
            done();

        });

    });



    describe(' testing ET.save() and .destroy() methods: ', function(){

        var entityName = 'ea_test_entity';
        var ET = null;
        before(function() {
            ET = GR.newEntityType({ name:entityName, description:'unit test: creating an entity type' });
        });


        it('creating a new EntityType works ',function(done){
            
            ET.save()
            .fail(function(err) {
                assert.ok(false, ' :=> should have completed successfully ');
                done();
            })
            .then(function(data) {

                assert(ET.id() != -1, ' :=> we were assigned a new ID ');
                done();

            });

        });



        it('updating our EntityType works ',function(done){
            
            var newDesc = 'updated description: unit testing action update';
            ET.description(newDesc);
            ET.save()
            .fail(function(err) {
                assert.ok(false, ' :=> should have completed successfully ');
                done();
            })
            .then(function(data) {

                assert(ET.description() == newDesc, ' :=> we updated our description ');
                done();

            })

        });



        it('deleting our EntityType works ',function(done){
            
            ET.destroy()
            .fail(function(err) {
                assert.ok(false, ' :=> should have completed successfully ');
                done();
            })
            .then(function(data) {


                GR.EntityTypes({ name:entityName })
                .fail(function(err){

                    assert.ok(false, ' :=> should have completed successfully ');
                    done();
                })
                .then(function(types) {

                    assert.lengthOf(types, 0, ' :=> should not have found our test entity ['+entityName+']. ');
                    done();

                });

            })

        });

    });  



});