/***********************************************************************/
/**
 * @class GR
 * Johnny Hausman <johnny@appdevdesigns.net>
 *
 *  Dependencies:
 *    - async
 *    - ad-utils
 */

var GR = function (opts, testAD) {
    var defaults = {
        grBase: 'http://global.registry.com/',
        accessToken: 'noTokenProvided'
    };
    this.opts = AD.sal.extend({}, defaults, opts);


    // if this is in a testing environment:
    if (testAD) {
        AD = testAD;
        if (testAD.klass) {
            testAD.klass.add('EntityType', EntityType);
        }
    }


    // make sure grBase ends in '/'
    var parts = this.opts.grBase.split('//');
    var i = parts.length-1;
    parts[i] = parts[i] + '/';
    parts[i] = parts[i].replace('//', '/');
    this.opts.grBase = parts.join('//');


    if (this.opts.accessToken == defaults.accessToken) {
        AD.log.error('<bold>Global Registry API:</bold> no access token provided.  This isn\'t going to work.');    
    }


    // on node, we need to track our own cookie jar:
    if (typeof module != 'undefined' && module.exports) {
        this.jar = require('request').jar();
    }


    // Now attach our Entity object and instantiate our GR
    this.Entity = Entity;
    this.Entity.GR = this;
};


if (typeof module != 'undefined' && module.exports) {
    module.exports = GR;
    var async = require('async');
    var AD = require('ad-utils');
}



//****************************************************************************
/**
 * @function request
 *
 * This is our http() request function for communicating with 
 * the Global Registry API.
 *
 * @return Deferred
 */
GR.prototype.request = function (opts) {

        // data: (typeof opts.data != 'undefined') ?
        //         JSON.stringify(opts.data) : opts.data,

    var reqParams = {
        url: this.opts.grBase + opts.path,
        type: opts.method,
        data: opts.data,
        dataType: opts.dataType || 'json',
        contentType: 'application/json',
        cache: false,
        headers: { 
            'Authorization': 'Bearer '+this.opts.accessToken,
            'Accept' : 'application/json',
            'Content-type' : 'application/json' 
        }
    };

    if (this.opts.forwardedFor) {
        reqParams.headers['X-Forwarded-For'] = this.opts.forwardedFor;
    }

    // pass in our local cookie jar if it exists
    if (this.jar) {
        reqParams.jar = this.jar;
    }

    return AD.sal.http(reqParams);
};



//****************************************************************************
/**
 * @function makeFilter
 *
 * Take an object defining a filter, and translate that into the GR API filter
 * format.
 *
 * example filter description:
 *      { 
 *          first_name:'Neo',
 *          status:{
 *              theOne:'true',
 *              isCool:'true'
 *          }
 *      }
 *
 * returned GR API Filter:
 * filters[first_name]=Neo&filters[status][theOne]=true&filters[status][isCool]=true
 *
 * @param {object} opt
 * @return {string}
 */
GR.prototype.makeFilter = function(opt) {
    var filter = [];


    var parseEntry = function(key, obj) {
        // returns an array of [ '[key]=value' ] entries


        // for the current entry create the '[key]' 
        var entry = '['+key+']';


        // if the corresponding value is an object we recursively parse
        // all those values:
        if (typeof obj[key] == 'object') {
            
            var returnValues = [];

            for (var no in obj[key]) {
                nextEntries = parseEntry(no, obj[key]);
                nextEntries.forEach(function(nextEntry) {
                    returnValues.push(entry+nextEntry);
                });
                
            }
            return returnValues;

        } else {

            // else this is a simple key=value entry:
            return  [ entry+'='+obj[key] ];
        }
    }


    if ('undefined' != typeof opt) {

        // for each key in our given filter
        for (var o in opt) {

            // get the results for that key
            var results = parseEntry(o, opt);

            // store them in our filter array
            results.forEach(function(res){
                filter.push( 'filters'+res);
            });
        }
    }

    // convert our filters into the querystring params:
    return filter.join('&');
}



//****************************************************************************
/**
 * @function EntityTypes
 *
 * Request the Defined EntityTypes in the Global Registry.
 *
 * @param {object} opts a filter object for filtering the results
 * @return Deferred
 */
GR.prototype.EntityTypes = function (opts) {
    var dfd = AD.sal.Deferred();
    var self = this;
    var servicePath = 'entity_types';

    //// NOTE: the request() library seems to modify the filter values in a way
    ////  that doesn't work with GlobalRegistry, so we manually add it to the
    ////  uri :
    var filter = this.makeFilter(opts); 
    if (filter != '') {
        servicePath += '?'+filter;
    }

    var reqOptions = {
        path:servicePath,
        method:'get'
    }
    this.request(reqOptions)
    .fail(function(err){
        AD.log.error('<bold>GlobalRegistryAPI</bold> error requesting EntityTypes', err, reqOptions );
        dfd.reject(err);
    })
    .then(function(data){

        var listObjects = [];

        data.entity_types.forEach(function(entityDef){

            entityDef.GR = self;
            entityDef.parent_id = 0;
            var entity = new EntityType(entityDef);
            listObjects.push(entity);
        });


        dfd.resolve(listObjects);

    });

    return dfd;
};



//****************************************************************************
/**
 * @function newEntityType
 *
 * Return an instance of an EntityType object.
 *
 * @param {object} opts initial values for EntityType
 * @return {object} EntityType
 */
GR.prototype.newEntityType = function (opts) {
    var self = this;

    opts = opts || {};

    opts.GR = this;

    return new EntityType(opts);
};




///////
/////// LEFT OFF HERE:
/////// Implement EntityTypes();


// var gr = new GR({ });
// var entityTypes = gr.getEntityTypes( 'key');
// entityTypes.foreach(function(entityType) {
//  entityType.id()
//  entityType.name()
//  entityType.fields().forEach(function( entityType) {
//
//    })
//  })
// var gr.entities('key',{filter});
// 





/************************************************************************/
/**
 * @class EntityType
 *
 * This class manages the individual EntityType node.
 *
 * field: id, name, field_type, parent_id
 *
 * methods: id(), id(val), name(), name(val), 
 */
var EntityType = function(opts) {
    var self = this;

    this.GR = opts.GR;

    if (!this.GR) {
        AD.log.error('<bold>GlobalRegistryAPI:</bold> EntityType created with no GR set! ');
    }


    this._required = {
        save:{ name:'' }
    }

    this._defaults = { id: -1, name:'',  description:'', field_type:'entity', enum_values:[], parent_id:-1 };
    this._data = AD.sal.extend({}, this._defaults, opts);


    // parent_id can't be -1.  If no parent_id provided, assume a root level node:
    if ('undefined' == typeof opts.parent_id)  { this.parentId(0); }


    this._fields = [];



    ////
    //// now define our fields interface:
    ////

    // .fields()  returns the array of fields for this entity_type
    this.fields = function() {
        return this._fields;
    };

    // .fields.add( def ) creates a new field entity_type from the provided def
    this.fields.add = function( fieldDef ) {
        fieldDef.GR = self.GR;
        fieldDef.parent_id = self.id();
        var newET = new EntityType(fieldDef);
        self._fields.push(newET);
        return newET;
    }



    // Now pull in all the provided field definitions
    if (opts.fields) {
        opts.fields.forEach(function(field) {
            self.fields.add(field);
        })
    }


    // we just got through creating ourselves, so no need to update yet:
    this._inSync = true;

};




//// 
//// Now implement get(), set() fns for each of these properties:
////
var methods = ['name', 'description', 'field_type', 'enum_values', 'parent_id'];
methods.forEach(function(key){

    // these functions don't match the property name exactly:
    var xLate = { 'field_type':'fieldType', 'enum_values':'enumValues', 'parent_id':'parentId'};
    var fnKey = key;
    if (xLate[key])  fnKey = xLate[key];

    EntityType.prototype[fnKey] = function( val ) {

        return ObjGetSet(this, key, val);
    }
});



/************************************************************************/
/**
 * @function destroy
 *
 * delete the current EntityType
 *
 * @return {Deferred}
 */
EntityType.prototype.destroy = function() {
    var self = this;
    var dfd = AD.sal.Deferred();


    var reqOptions = {
        path:'entity_types/'+self.id(),
        method:'delete'
    }
    self.GR.request(reqOptions)
    .fail(function(err){
        AD.log.error('<bold>GlobalRegistryAPI</bold> error saving EntityType', err, reqOptions, this );
        dfd.reject(err);
    })
    .then(function(dataBack){

//// QUESTION: <2014-05-09> Johnny :  what do I do with a deleted Obj?  reset id=-1?

        // A successful delete will actually delete all the embedded EntityTypes
        // so scan through all children and reset id(-1).
        var resetEntityType = function(current) {

            current.id(-1);
            current.fields().forEach(function(field){
                resetEntityType(field);
            });
        }

        resetEntityType(self);


//// QUESTION: <2014-05-10> Johnny : Is there a need to remove this entry from a 
//// parent's _fields[] array?

        // don't need to update myself anymore...
        self._inSync = true;

        dfd.resolve();

    });

    return dfd;
}



/************************************************************************/
/**
 * @function id
 *
 * The id() get()/set() fn requires some additional setps when setting 
 * it's value.
 *
 * @return {mixed}
 */
EntityType.prototype.id= function( val ) {

    if ('undefined' != typeof val) {
        this.fields().forEach(function(field){
            field.parentId(val);
        })
    }
    return ObjGetSet(this, 'id', val);
}



/************************************************************************/
/**
 * @function packageJSON
 *
 * Return the data values for this object packaged properly for submiting
 * to the GR API.
 *
 * @return {object}
 */
EntityType.prototype.packageJSON = function() {

    var data = {};
    for (var d in this._defaults) {
        // if field has been set || field is required then add it to data
        if ((this._data[d] != this._defaults[d]) 
            || ( typeof this._required.save[d] != 'undefined' )){
            data[d] = this._data[d];
        }
    }


    // when creating a Root Directory (parent_id:0)
    // we don't actually send that info to the API
    if ('undefined' != typeof data.parent_id) {
        if (data.parent_id == 0) {
            delete data.parent_id;
        }
    }


    // if this is not a 'enum_values' type
    // then make sure data.enum_values is not part of the
    // data package.
    if (this._data.field_type != 'enum_values') {
        delete data.enum_values;
    }


    // package in entity_types {}
    data = {
        entity_type: data
    }

    return data;
}



/************************************************************************/
/**
 * @function save
 *
 * Save the current state of this object back to the GR.  If this object
 * is newly created, this will create it on the GR.  If it has been updated
 * it will update the copy in GR.
 *
 * save() on a newly created object will also perform a save() on all it's 
 * child fields.
 *
 * @return {Deferred}
 */
EntityType.prototype.save = function() {
    var dfd = AD.sal.Deferred();
    var self = this;

    // if id == -1 then this value should be saved
    if (this.id() == -1) {

        var data = this.packageJSON();

        var reqOptions = {
            path:'entity_types',
            method:'post',
            data:data
        }
        this.GR.request(reqOptions)
        .fail(function(err){
            AD.log.error('<bold>GlobalRegistryAPI</bold> error creating EntityType', err, reqOptions, this );
            dfd.reject(err);
        })
        .then(function(dataBack){


            loadFromData(self, 'entity_type', dataBack);


            // update each field's parent_id with current id
            // then have that item save itself
            var numSaved = 0;
            self._fields.forEach(function(field){

                field.parentId( self.id() );

                field.save()
                .fail(function(err){
                    dfd.reject(err);
                })
                .then(function(){

                    // wait until all child fields are finished saving
                    numSaved ++;
                    if (numSaved >= self._fields.length) {
                        dfd.resolve();
                    }
                });
            });


            // if we didn't have any child fields, resolve() now
            if (self._fields.length == 0) {
                dfd.resolve();
            }

        });
        

    } else {
 
        // if we are not inSync then we need to update
        if (!this._inSync) {

            var data = this.packageJSON();

            var reqOptions = {
                path:'entity_types/'+self.id(),
                method:'put',
                data:data
            }
            self.GR.request(reqOptions)
            .fail(function(err){
                AD.log.error('<bold>GlobalRegistryAPI</bold> error updating EntityType', err, reqOptions, this );
                dfd.reject(err);
            })
            .then(function(response){

                loadFromData(self, 'entity_type', response);

                dfd.resolve();

            });


        } else {

            dfd.resolve();
        }  
    }


    return dfd;
}







//****************************************************************************
// Helper Functions
//****************************************************************************









/************************************************************************/
/**
 * @function filterToQSObj
 *
 * convert a filter string into an object for use in the request qs field.
 *
 * given: 'filters[name]=Neo&filters[isTheOne]=true'
 *
 * return: {
 *  'filters[name]' : 'Neo',
 *  'filters[isTheOne]' : 'true'
 * }
 *
 * @param {string} strFilter   the generated filter string for GR.
 * @return {object}
 */
var filterToQSObj = function( strFilter ) {

    var returnObj = {};

    strFilter.split('&').forEach(function(filter){
        var parts = filter.split('=');
        if (parts.length > 1) {
            returnObj[parts[0]] = parts[1];
        }
    });

    return returnObj;
}



/************************************************************************/
/**
 * @function loadFromData
 *
 * Reload our object from the given data response from GR.
 *
 * @param {object} self  a reference to the Object instance
 * @param {string} key   a reference to which Object this is
 * @return {undefined}
 */
var loadFromData = function(self, key, dataBack) {

    // dataBack = {
    //    entity_type: {
    //        id:x,       
    //        name:'xxx',
    //        description:'yyy',
    //        ...
    //    }
    // }


    // the data is embedded in an object's key property:
    // adjust dataBack to data value
    dataBack = dataBack[key];


    if (dataBack) {

        // update our values 
        for (var db in dataBack) {
            self._data[db] = dataBack[db];
        }


        // consider ourselves in sync with server
        self._inSync = true;

    }   
}



/************************************************************************/
/**
 * @function ObjGetSet
 *
 * implements a generic get() & set() fn for an object.
 *
 * This fn expects the object to store it's data in a self._data object.
 * 
 * This fn also manages an object's self._inSync setting.
 *
 * if called with no value parameter, then this performs a get() operation.
 *
 * if called with a val parameter, then this performs a set() operation.
 *
 * @param {object} self  a reference to the Object instance
 * @param {string} key   a reference to which Object property we are accessing
 * @param {} val         [optional] value for the property.
 * @return {Deferred}
 */
var ObjGetSet = function(self, key, val) {

    if ('undefined' != typeof val) {

        self._inSync = false;

        // setter:
        return self._data[key] = val;

    } else {
        // getter
        return self._data[key];
    }
}


var Entity = {

    GR:null,

    _entityTypes:null,

    instance:function(type, data) {

        var instance = new Entity(type, data);
        instance.GR = this.GR;

        return instance;
    },

    /*
     * @function create
     *
     * @param {string} type the entity_type of the data to create
     *                      (optional) if not given, then entity_type must be
     *                      a field in the data.
     * @param {json/array} data the data of the entity to create.
     * @return {deferred}
     */
    create:function(type, data) {
        var dfd = AD.sal.Deferred();

        if (typeof data == 'undefined') {
            data = type;
            type = null;
        }

        if (!type) {
            type = data.entity_type;
            delete data.entity_type;
        }

        if (!type) {
            AD.log.error('<bold>GlobalRegistryAPI</bold> error creating Entity: no entity_type provided!', type, data);
        }

        var reqData = {
            entity: {}
        }
        reqData.entity[type] = data;

        // if( Object.prototype.toString.call( data ) !== '[object Array]' ) {
        //     data = [data];
        // }

        var reqOptions = {
            path:'entities',
            method:'post',
            data:reqData
        }
        this.GR.request(reqOptions)
        .fail(function(err){
            AD.log.error('<bold>GlobalRegistryAPI</bold> error creating Entity['+type+']', err, reqOptions, this );
            dfd.reject(err);
        })
        .then(function(dataBack){
            // returned structure:
            // {
            //     entity:{
            //         [type]:{
            //             data:here
            //         }
            //     }
            // }
            var liveData = AD.sal.extend({}, data, dataBack.entity[type]);
console.log('... liveData:', liveData);
            var entityInstance = _this.GR.Entity.instance(type, liveData);
            dfd.resolve(entityInstance);
        });


        return dfd;
    }
}

/*
// Searching:
// 
GR.Entity._entityTypes = [];

GR.Entity.instance({json});

GR.Entity.find({id:abcd})
.then(function(person){
    person.set('first_name', 'Neo');
    person.save();
})

GR.Entity.findOne(id)
.then(function(person){
    person.set('first_name', 'Neo');
    person.save();
})

GR.Entity.create({json def})
GR.Entity.update(id, {json.values})
GR.Entity.destroy(id)


// an instance:
entityInstance.save()  // -> .create() or .update()
entityInstance.destroy() // .destroy()

eI.get('first_name');
eI.set('first_name', value);

eI.set({ first_name:'value' })

*/



var EntityMerge = function(data, newData) {

    for(var v in newData) {
        var value = newData[v];

        // if value is an array
            // if 1st entry is an object
                // forEach object:
                    // find my this.data[v] entry with same client_integration_id
                    // send both of those to EntityMerge( myCurrentValue, newObject)
            // else 
                // an array of non entities:
                // update this.data[v] = value;
            // end if
        // else if value is an object
        // else 
            // current this.data[v] = value;
        // end if
    }
}

var Entity = function(type, data) {
    var _this = this;

    this.GR = null;
    this.type = type;   // the specific entity key ('person')
    this.data = data;   // the data for that entity

}


Entity.prototype.get = function(key) {

    var value = this.data[key];
    // if value is an object
        // return a this.GR.Entity.instance(key, value)
    // else if value is an array
        // need to return an array of Entities:
        // var returnArray = [];
        // this.data[key].forEach(obj) {
            // returnArray.push( new Entity.instance(key, obj))
        // }
        // return returnArray;
    // else 
        // return value;
    // end if
}


Entity.prototype.set = function(key, value) {

    // if value is of type Entity
        // value = value.data;
    // end if
    // this.data[key] = value;
}


Entity.prototype.save = function() {
    var dfd = AD.sal.Deferred();
    var _this = this;

    // a .create() will actually perform an .update() if
    // the entry is already found. So we can just perform
    // a .create() on both create/update operations.
    this.GR.Entity.create(this.type, this.data)
    .fail(function(err){
        dfd.reject(err);
    })
    .then(function(returnData) {

        // returnData is an instance of Entity with the data returned:

        // make sure returned data is reflected in our data copy
        EntityMerge(_this.data, returnData.data);

        // pass the updated data on 
        dfd.resolve(returnData.data);
    })

    return dfd;
}


//// LEFT OFF
//// + test the returnData from the Entity.create()
//// + implement EntityMerge
//// + update LHRISRen.toGR() to create a new Entity and Entity.save() it
//// + implement Entity.prototype.destroy()
