var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

var AD = require('ad-utils');
var GRObj = require(path.join('..', 'globalRegistry-api.js'));

var mockAD = AD.test.mockAD;

// to Enable debugging comments in mockAD code: uncomment the following:
//mockAD.debug( AD.log );

mockAD.fixtures(require(path.join(__dirname, 'data', 'fixtureData.js')));



describe('test GR.entityTypes()',function(){

    var GR = null;

    before(function(done){

        GR = new GRObj({ grBase: 'testBase', accessToken:'testToken' }, mockAD);
        done();

    });

    after(function(done){
        
        done();
    });




    it('calling GR.EntityTypes() returns a single EntityType ',function(done){

        mockAD.reset();

        GR.EntityTypes()
        .fail(function(err){

            assert.ok(false, ' :=> should have completed successfully ');
            done();
        })
        .then(function(types) {

            assert.isArray(types, ' :=> returned an array. ');
            assert.equal(types.length, 1, ' :=> returned our 1 defined entity type');
            done();

        });

    });


    it(' EntityType.*() getter/setter works ', function(done) {

        GR.EntityTypes()
        .fail(function(err){

            assert.ok(false, ' :=> should have completed successfully ');
            done();
        })
        .then(function(types) {

            var ET = types[0];

            // read correctly
            var name = ET.name();
            assert.isString(name, ' :=> returned name was a string');

            // write correctly
            ET.name('spanky');
            assert(ET._data.name == 'spanky', ' :=> name setter properly updated the value');

            done();
        });

    });


    it(' new EntityType() properly defaults initial values ', function() {

        mockAD.reset();

        var ET = GR.newEntityType();
        assert.isFalse(mockAD.val('logErrorCalled'), ' :=>  no error was called when creating a new EntityType');

        assert(ET.parentId() != -1, ' :=>  parent_id is properly set ');
        assert(ET.fields().length == 0, ' :=> fields are empty array ');

    });


    it(' EntityType.packageJSON() packages our data together properly for a GR call ', function() {

        var checkNotSet = function(list, data) {
            assert.property(data, 'entity_type', ' :=> data was packaged inside { entity_type:{} } ');
            list.forEach(function(key) {
                assert.notProperty(data.entity_type, key, ' :=> '+key+' should not have been set ');
            })
        }

        var checkIsSet = function(list, data) {
            assert.property(data, 'entity_type', ' :=> data was packaged inside { entity_type:{} } ');
            list.forEach(function(key){
                assert.property(data.entity_type, key, ' :=> '+key+' should have been set ');
            })
        }


        var ET = GR.newEntityType({ name:'initName', field_type:'string' });
        var data = ET.packageJSON();


        //// NOTE: name is always set

        var notSetList = ['id', 'description', 'parent_id', 'enum_values'];
        var isSetList  = ['name', 'field_type'];
        checkNotSet(notSetList, data);
        checkIsSet(isSetList, data);


        ET = GR.newEntityType({ field_type:'entity', parent_id:10 });
        data = ET.packageJSON();

        notSetList = ['id', 'description', 'enum_values', 'field_type' ];
        isSetList  = [ 'name', 'parent_id' ];
        checkNotSet(notSetList, data);
        checkIsSet(isSetList, data);


        ET = GR.newEntityType({ field_type:'enum_values', enum_values:[ 'a', 'b', 'c'] });
        data = ET.packageJSON();

        notSetList = ['id', 'description', 'parent_id' ];
        isSetList  = [ 'name', 'field_type', 'enum_values' ];
        checkNotSet(notSetList, data);
        checkIsSet(isSetList, data);

    });


    it(' EntityType.fields() & fields.add() works as expected ', function() {


        var ET = GR.newEntityType({ name:'initName', field_type:'string' });

        var fields = ET.fields();
        assert.isArray(fields, ' :=> fields() returns an array ');
        assert.lengthOf(fields, 0, ' :=> no fields() returned ');

        var newET = ET.fields.add({ name:'field1' });
        assert.isObject(newET, ' :=> new field was an object. ');
        assert.instanceOf(newET, mockAD.klass('EntityType'), ' :=> new field is an instance of EntityType ');
        assert.isArray(ET.fields(), ' :=> fields() returns an array ');
        assert.lengthOf(ET.fields(), 1, ' :=> 1 field returned ');


        ET.fields.add({ name:'field2' });
        assert.isArray(ET.fields(), ' :=> fields() returns an array ');
        assert.lengthOf(ET.fields(), 2, ' :=> 2 fields returned ');


        // setting ET.id(val) should update all sub fields.parent_id:
        ET.id(10);
        ET.fields().forEach(function( field ) {
            assert(field.parentId() == 10, ' :=> parent_id properly updated ');
        });


        ET.id(11);
        ET.fields.add({ name:'field3'});
        assert.isArray(ET.fields(), ' :=> fields() returns an array ');
        assert.lengthOf(ET.fields(), 3, ' :=> 3 fields returned ');
        assert(ET.fields()[2].parentId() == 11, ' :=> new fields get their parent_id set ');


    });
    

    it('EntityType.save() on new obj, triggers a save action ', function() {

        mockAD.reset();

        var ET = GR.newEntityType();
        assert.isFalse(mockAD.val('logErrorCalled'), ' :=>  no error was called when creating a new EntityType');

        ET.name('newName');
        ET.description('newDescription');
        ET.fieldType('newFieldType');

        ET.save()
        .fail(function(err){
            assert.ok(false, ' :=> ET.save() should not have created an error! ');
        })
        .then(function(data) {
            var id = ET.id();
            assert(id == 1, ' :=> ET.save() properly updated its id value ');

            assert(ET.name() == 'serverName', ' :=> ET.save() properly updated its name value');
            assert(ET.description() == 'serverDescription', ' :=> ET.save() properly updated its description value');
            assert(ET.fieldType() == 'serverFieldType', ' :=> ET.save() properly updated its field_type value ');

        })

    });
    

    it('EntityType.save() on existing obj, triggers an update action ', function(done) {

        mockAD.reset();

        var ET = GR.newEntityType({ id:1, name:'initName', field_type:'initFieldType', description:'initDesc'});
        assert.isFalse(mockAD.val('logErrorCalled'), ' :=>  no error was called when creating a new EntityType');

        assert(ET._inSync == true, ' :=> no update needed yet. ');

        ET.name('newName');
        ET.description('newDescription');
        ET.fieldType('newFieldType');

        assert(ET._inSync == false, ' :=> update needed now. ');

        ET.save()
        .fail(function(err){
            assert.ok(false, ' :=> ET.save() should not have created an error! ');
            done();
        })
        .then(function(data) {
            var id = ET.id();
            assert(id == 1, ' :=> ET.save() properly updated its id value ');

            assert(ET.name() == 'updateName', ' :=> ET.save() properly updated its name value');
            assert(ET.description() == 'updateDescription', ' :=> ET.save() properly updated its description value');
            assert(ET.fieldType() == 'updateFieldType', ' :=> ET.save() properly updated its field_type value ');

            assert(ET._inSync == true, ' :=> no update needed anymore. ');
            done();

        })

    });


    it(' EntityType.destroy() works as expected ', function(done) {

        mockAD.reset();

        GR.EntityTypes()
        .fail(function(err){

            assert.ok(false, ' :=> should have completed successfully ');
            done();
        })
        .then(function(types) {

            assert.isArray(types, ' :=> returned an array. ');
            assert.equal(types.length, 1, ' :=> returned our 1 defined entity type');

            var allIDsSet = function( list ) {
                list.forEach(function(entry) {
                    assert(entry.id() != -1, ' :=> id should have a valid value ');
                    allIDsSet(entry.fields());
                })
            }
            allIDsSet(types);

            // now delete them;
            // NOTE: because of the fixture, this isn't actually Asynch() anymore:
            types.forEach(function(entry){
                entry.destroy();
            });

            var allIDsNotSet = function(list){
                list.forEach(function(entry){
                    assert(entry.id() == -1, ' :=> id should have been reset to -1 ');
                    allIDsNotSet(entry.fields());
                })
            }
            allIDsNotSet(types);


            done();

        });

    });

});