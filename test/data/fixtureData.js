module.exports={

    'get testBase/entity_types' : {
            success:true,
            response:'success',
            data:{
                "entity_types": [
                    {
                        "id": 1,
                        "name": "person",
                        "description": "Entity object to hold information about a person",
                        "fields": [
                            {
                                "id": 300,
                                "name": "client_integration_id",
                                "field_type": "string"
                            },
                            {
                                "id": 319,
                                "name": "funding_source",
                                "field_type": "enum"
                            },
                            {
                                "id": 301,
                                "name": "key_username",
                                "description": "Username in Relay",
                                "field_type": "string"
                            },
                            {
                                "id": 303,
                                "name": "first_name",
                                "description": "Your official given name.",
                                "field_type": "string"
                            },
                            {
                                "id": 333,
                                "name": "date_left_staff",
                                "description": "This is the date a person officially left Campus Crusade. (Administrative use only; filled in by HR professional)",
                                "field_type": "date"
                            },
                            {
                                "id": 323,
                                "name": "staff_status",
                                "description": "This identifies your working relationship with Campus Crusade, if any.",
                                "field_type": "enum"
                            },
                            {
                                "id": 305,
                                "name": "middle_name",
                                "description": "One or more middle names",
                                "field_type": "string"
                            },
                            {
                                "id": 307,
                                "name": "last_name",
                                "description": "Your official family name.",
                                "field_type": "string"
                            },
                            {
                                "id": 309,
                                "name": "preferred_name",
                                "description": "This is the name by which you are commonly known or how you prefer people address you.",
                                "field_type": "string"
                            },
                            {
                                "id": 327,
                                "name": "role",
                                "description": "This is your role or position within Campus Crusade.",
                                "field_type": "enum"
                            },
                            {
                                "id": 311,
                                "name": "language",
                                "description": "One or more languages this person speaks (in order of priority)",
                                "field_type": "string"
                            },
                            {
                                "id": 343,
                                "name": "marital_status",
                                "description": "Marital status",
                                "field_type": "enum"
                            },
                            {
                                "id": 315,
                                "name": "mcc",
                                "description": "Mission Critical Component",
                                "field_type": "enum"
                            },
                            {
                                "id": 337,
                                "name": "gender",
                                "description": "'Male' or 'Female'",
                                "field_type": "enum"
                            },
                            {
                                "id": 339,
                                "name": "birth_date",
                                "description": "Format: yyyy-mm-dd",
                                "field_type": "date"
                            },
                            {
                                "id": 331,
                                "name": "date_joined_staff",
                                "description": "This is the date you officially joined Campus Crusade.",
                                "field_type": "date"
                            },
                            {
                                "id": 345,
                                "name": "authentication",
                                "description": "Entity object to hold unique identifiers to 3rd party authentication systems",
                                "fields": [
                                    {
                                        "id": 351,
                                        "name": "facebook_uid",
                                        "description": "Facebook user id",
                                        "field_type": "integer"
                                    },
                                    {
                                        "id": 346,
                                        "name": "client_integration_id",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 347,
                                        "name": "key_guid",
                                        "description": "Globally Unique ID from The Key",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 349,
                                        "name": "relay_guid",
                                        "description": "Globally Unique ID from Relay",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 524,
                                        "name": "fb_uid",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 525,
                                        "name": "google_apps_uid",
                                        "field_type": "string"
                                    }
                                ]
                            },
                            {
                                "id": 353,
                                "name": "email_address",
                                "description": "Entity object to hold information related to an email address",
                                "fields": [
                                    {
                                        "id": 356,
                                        "name": "primary",
                                        "description": "True if this is the person's primary email address",
                                        "field_type": "boolean"
                                    },
                                    {
                                        "id": 357,
                                        "name": "location",
                                        "description": "Location of email address (work, home, etc)",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 354,
                                        "name": "client_integration_id",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 355,
                                        "name": "email",
                                        "description": "Actual email address",
                                        "field_type": "email"
                                    }
                                ]
                            },
                            {
                                "id": 368,
                                "name": "address",
                                "description": "Entity object to hold information related to an address",
                                "fields": [
                                    {
                                        "id": 372,
                                        "name": "line2",
                                        "description": "Second line of your street address",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 380,
                                        "name": "postal_code",
                                        "description": "Zip code, postal code, mail code, etc",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 374,
                                        "name": "dorm",
                                        "description": "Dorm room number",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 382,
                                        "name": "country",
                                        "description": "State/Province/Region",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 369,
                                        "name": "client_integration_id",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 376,
                                        "name": "city",
                                        "description": "City/Town",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 370,
                                        "name": "line1",
                                        "description": "First line of your street address",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 378,
                                        "name": "state",
                                        "description": "State/Province/Region",
                                        "field_type": "string"
                                    }
                                ]
                            },
                            {
                                "id": 358,
                                "name": "phone_number",
                                "description": "Entity object to hold information related to a phone number",
                                "fields": [
                                    {
                                        "id": 360,
                                        "name": "number",
                                        "description": "Actual phone number",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 359,
                                        "name": "client_integration_id",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 362,
                                        "name": "extension",
                                        "description": "Extention",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 364,
                                        "name": "location",
                                        "description": "Location of phone number (work, home, mobile, etc)",
                                        "field_type": "string"
                                    },
                                    {
                                        "id": 366,
                                        "name": "primary",
                                        "description": "True if this is the person's primary email address",
                                        "field_type": "boolean"
                                    }
                                ]
                            },
                            {
                                "id": 491,
                                "name": "campus",
                                "field_type": "string"
                            },
                            {
                                "id": 492,
                                "name": "university_state",
                                "field_type": "string"
                            },
                            {
                                "id": 493,
                                "name": "year_in_school",
                                "field_type": "string"
                            },
                            {
                                "id": 494,
                                "name": "major",
                                "field_type": "string"
                            },
                            {
                                "id": 495,
                                "name": "greek_affiliation",
                                "field_type": "string"
                            },
                            {
                                "id": 496,
                                "name": "date_became_christian",
                                "field_type": "date"
                            },
                            {
                                "id": 497,
                                "name": "graduation_date",
                                "field_type": "date"
                            },
                            {
                                "id": 499,
                                "name": "ministry",
                                "field_type": "string"
                            },
                            {
                                "id": 500,
                                "name": "strategy",
                                "field_type": "string"
                            },
                            {
                                "id": 501,
                                "name": "siebel_contact_id",
                                "field_type": "string"
                            },
                            {
                                "id": 502,
                                "name": "account_number",
                                "field_type": "string"
                            },
                            {
                                "id": 503,
                                "name": "username",
                                "field_type": "string"
                            },
                            {
                                "id": 498,
                                "name": "is_secure",
                                "field_type": "boolean"
                            },
                            {
                                "id": 512,
                                "name": "birth_year",
                                "field_type": "integer"
                            },
                            {
                                "id": 514,
                                "name": "birth_month",
                                "field_type": "integer"
                            },
                            {
                                "id": 515,
                                "name": "birth_day",
                                "field_type": "integer"
                            },
                            {
                                "id": 329,
                                "name": "employment_country",
                                "description": "This is the country from which you receive your salary or other compensation.",
                                "field_type": "string"
                            },
                            {
                                "id": 485,
                                "name": "region",
                                "field_type": "string"
                            },
                            {
                                "id": 486,
                                "name": "work_in_us",
                                "field_type": "boolean"
                            },
                            {
                                "id": 487,
                                "name": "us_citizen",
                                "field_type": "boolean"
                            },
                            {
                                "id": 488,
                                "name": "citizenship",
                                "field_type": "string"
                            },
                            {
                                "id": 489,
                                "name": "is_staff",
                                "field_type": "boolean"
                            },
                            {
                                "id": 490,
                                "name": "title",
                                "field_type": "string"
                            }
                        ],
                        "relationships": [
                            {
                                "relationship_type": {
                                    "id": 4,
                                    "relationship1": "person",
                                    "relationship2": "ministry",
                                    "related_entity_type": "ministry",
                                    "enum_entity_type_id": 325
                                }
                            },
                            {
                                "relationship_type": {
                                    "id": 5,
                                    "relationship1": "husband",
                                    "relationship2": "wife",
                                    "related_entity_type": "person"
                                }
                            },
                            {
                                "relationship_type": {
                                    "id": 8,
                                    "relationship1": "person",
                                    "relationship2": "team",
                                    "related_entity_type": "team"
                                }
                            }
                        ]
                    }
                ],
                "meta": {
                    "total": 1,
                    "from": 1,
                    "to": 1,
                    "page": 1,
                    "total_pages": 1
                }
            }
        },


    'post testBase/entity_types' : {
        success:true,
        response:'success',
        data:{
            entity_type: {
                id:1,
                name:'serverName',
                description:'serverDescription',
                field_type:'serverFieldType'
            }

        }

    },


    'put testBase/entity_types/1' : {
        success:true,
        response:'success',
        data:{
            entity_type: {
                id:1,
                name:'updateName',
                description:'updateDescription',
                field_type:'updateFieldType'
            }

        }

    },


    'delete testBase/entity_types/1' : {
        success:true,
        response:'success',
        data:{
            entity_type: {
                id:1,
                name:'destr0yName',
                description:'destroyDescription',
                field_type:'destroyFieldType'
            }

        }

    }
    
}
