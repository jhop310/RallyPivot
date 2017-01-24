Ext.define('CustomApp', {
                extend: 'Rally.app.App',
                componentCls: 'app',
                items: [
                    {
                        xtype: 'container',
                        itemId: 'newdiv',
                        Id: 'container'
                    }
                ],


                launch: function () {
                    //Launch app and create initial data store
                    
                Ext.create('Rally.data.wsapi.Store', {
                        model: 'PortfolioItem/Feature',
                        autoLoad: true,
                        limit: Infinity,
                        listeners: {
                            load:(
                                console.log('Data Loaded'),
                                this._onDataLoaded
                                ),
                                scope: this
                        },
                        fetch: ['FormattedID', 'Name', 'State', 'Project', 'Owner', "PlannedStartDate", "PlannedEndDate", 'PortfolioItemTypeName', 'Release', 'UserStories']
                    });
                },

                //called when data is loaded- takes a store and a data parameter.  creates seperate arrays for each attribute to display in the pivot table and calls the next function
                _onDataLoaded: function (store, data) {
                    //log function call and Data object
                    console.log('Data:', store, data); 
                    var that= this;
                    

                    var fIDRecords = _.map(data, function (record) {
                        return record.get('FormattedID');
                    });
                    var stateRecords = _.map(data, function (record) {
                        return record.get('State')&& record.get('State')._refObjectName;
                    });
                    var ownerRecords = _.map(data, function (record) {
                        var owner1 = record.get('Owner') && record.get('Owner')._refObjectName;
                        return owner1;
                    });
                    var projectRecords = _.map(data, function (record) {
                        return record.get('Project') && record.get('Project')._refObjectName;
                    });
                    var releaseRecords = _.map(data, function (record) {
                        return record.get('Release') && record.get('Release')._refObjectName;
                    });
                    var planStartRecords = _.map(data, function (record) {
                        return record.get('PlannedStartDate');
                    });
                    var planEndRecords = _.map(data, function (record) {
                        return record.get('PlannedEndDate');
                    });
                    
                    var usRecords = _.map(data, function(record) {
                        var x = record.get('FormattedID');
                        var filter = [];
                        var i =1;
                            filter.push( that._getFilter(x, i));
                            
                            Ext.create('Rally.data.wsapi.Store', {
                            model: 'UserStory',
                            autoload: true,
                            filter: filter,
                            fetch: ['Iteration'],
                            listeners: {
                                load:(
                                    console.log('Lets See if this works'),
                                    function(store,data){
                                    console.log('Get US', data);
                                    
                                    var iterRecords = _.map(data, function (record) {
                                        var iter = record.get('Iteration') && record.get('Iteration')._refObjectName;
                                            return iter;
                                    });
                                    console.log(iterRecords);
                                    
                                    
                                    
                                }
                                ),
                                //scope: that,
                            }
                        });
                        
                    });
                        //var usOwnerRecords = _.map(data, function (record) {
                        //    if (record.get('WorkProduct') != null) {
                        //        var i = record.get('WorkProduct') && record.get('WorkProduct').Owner && record.get('WorkProduct').Owner._refObjectName;
                        //        return i;
                        //    } else {
                        //        return null;
                        //    }
                        //});

                    this._createMatrix(fIDRecords, stateRecords, ownerRecords, projectRecords, releaseRecords, planStartRecords, planEndRecords);


                },
                
                _getIteration: function(store, data){
                    
                    
                },
                


                //called by _onDataLoad.  Takes arrays in for each array created in the function above.  Combines all of those arrays into a single array to pass to the UI. Then calls _addUI with the data for the pivot
                _createMatrix: function (fIDRecords, stateRecords, ownerRecords, projectRecords, releaseRecords, planStartRecords, planEndRecords) {
                    console.log('_CreateMatrix Called');

                    var recordData = [];
                    //create array of all records needed
                    var limit = fIDRecords.length;
                    for (var i = 0; i < limit; i++) {
                        recordData.push([
                            'FormattedID :' + fIDRecords[i],
                            'Owner :' + ownerRecords[i],
                            'State :' + stateRecords[i],
                            'Project :' + projectRecords[i],
                            'Release :' + releaseRecords[i],
                            'Planned Start Date :' + planStartRecords[i],
                            'Planned End Date :' + planEndRecords[i]
                        ]
                            );
                    }

                    //console.log('Record Data:' + recordData);

                    var input = JSON.stringify(recordData);

                    input = input.replace(/\[/g, '{');
                    input = input.replace(/\]/g, '}');
                    input = input.replace(/^{/, '[');
                    input = input.replace(/}$/, ']');
                    input = input.replace(/"Owner :/g, '"Owner" : "');
                    input = input.replace(/"FormattedID :/g, '"FormattedID" : "');
                    input = input.replace(/"State :/g, '"State" :"');
                    input = input.replace(/"Project :/g, '"Project" :"');
                    input = input.replace(/"Release :/g, '"Release" :"');
                    input = input.replace(/"Planned Start Date :/g, '"Planned Start Date" :"');
                    input = input.replace(/"Planned End Date :/g, '"Planned End Date" :"');

                    //console.log(input);
                    this._addUI(input);

                },

                //Utilizes Pivottable.js library to print pivot table onto the screen

                _addUI: function (input) {

                    var that = this;
                    //console.log(input);
                    var finalInput = JSON.parse(input);
                    $('#container-1010-innerCt').html(
                         '</div>' +
                           '<div id="output">\n' +
                           '</div>'
                               );

                    google.charts.load("current", { packages: ["corechart", "charteditor"] });
                    var derivers = $.pivotUtilities.derivers;
                    var renderers = $.extend($.pivotUtilities.renderers,
                    $.pivotUtilities.gchart_renderers);
                    $("#output").pivotUI(finalInput, {
                        rows: ["Project"],
                        cols: ["State"],
                        sorters: {
                            State: $.pivotUtilities.sortAs(["null", "Dsicovering", "Developing", "Measuring", "Done"]),
                            Release: $.pivotUtilities.sortAs(["ShootingStar (HPM PI8)", "StateFair (HPM PI7)", "SchoolsOut (HPM PI6)", "CrystalSnow (HPM PI5)", "JackFrost (HPM PI4)", "AirStream (HPM PI3)", "FallBreeze (HPM PI2)", "Stealth (HPM PI1)", "HMA Release 2.3.3", "HMA Release 2.3.4" ])
                        },
                        derivedAttributes: {
                            "Plan Start Date": derivers.dateFormat("Planned Start Date", "%y/%m/%d"),
                            "Plan End Date": derivers.dateFormat("Planned End Date", "%y/%m/%d")
                            },
                        hiddenAttributes: ["Planned Start Date", "Planned End Date"],
                        rendererOptions: {
                            table: {
                                clickCallback: function (e, value, filters, pivotData) {
                                    var clickData = [];
                                    pivotData.forEachMatchingRecord(filters,
                                        function (record) { clickData.push(record.FormattedID); });
                                    that._createDrillMatrix(clickData);
                                }
                            }
                        }
                    });

                    $(window).ready(function () {
                        $('#loading').hide();
                    });

                },

                //Creates filters for drill down

                _getFilter: function (data, i) {

                    return {
                        property: 'FormattedID',
                        operator: '=',
                        value: data[i]
                    };

                    //console.log(filter);

                    //return filter;

                },

                //Creates the filter based on formatted ID to drill down

                _createDrillMatrix: function (clickData) {
                    console.log(clickData);


                    var filter = [];


                    for (var i = 0; i < clickData.length; i++) {
                        filter.push([this._getFilter(clickData, i)]);
                    }
                    var finalFilter = JSON.stringify(filter);

                    finalFilter = finalFilter.replace(/\[/g, '{');
                    finalFilter = finalFilter.replace(/\]/g, '}');
                    finalFilter = finalFilter.replace(/^{/, '[');
                    finalFilter = finalFilter.replace(/}$/, ']');
                    finalFilter = finalFilter.replace(/{{/g, '{');
                    finalFilter = finalFilter.replace(/}}/g, '}');
                    finalFilter = JSON.parse(finalFilter);
                    finalFilter = Rally.data.wsapi.Filter.or(finalFilter);
                    //console.log(finalFilter);
                    var model= 'PortfolioItem/Feature';
                    this._createStore(finalFilter, model);
                    
                    
                },
                _createStore: function(filter, model){

                    if (this.filteredStore) {
                        console.log('Store Exists');
                        this.filteredStore.setFilter(filter);
                        this.filteredStore.load();
                    } else {
                        console.log('Create Store');
                        this.filteredStore = Ext.create('Rally.data.wsapi.Store', {
                            model: model,
                            fetch: ['FormattedID', 'Name', 'Owner', 'State', 'Release'],
                            autoload: true,
                            filters: filter,
                            listeners: {
                                load: ( function (myStore, myData, success) {
                                    console.log('Data', myStore, myData, success);
                                    if (!this.defectGrid) {
                                        console.log('create grid');
                                        this._newGrid(myStore);
                                    }
                                }
                                ),
                                  scope: this
                            },
                            
                        }
                        );
                        scope:this;
                    }
                },

                //adds grid to display drill down

                _newGrid: function (filteredStore) {

                    this.defectGrid = Ext.create('Rally.ui.grid.Grid', {
                        store: filteredStore,
                        columnCfgs: ['FormattedID', 'Name', 'Owner', 'State', 'Release'],
                        limit: Infinity,
                        enableEditing: false,
                    });
                    this.add(this.defectGrid);

                }

            });
