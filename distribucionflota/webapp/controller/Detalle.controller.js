sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
    "sap/ui/core/routing/History"    
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet, BusyIndicator, MessageBox, History) {
		"use strict";		
        var oGlobalBusyDialog = new sap.m.BusyDialog();
		return BaseController.extend("com.tasa.distribucionflota.controller.Detalle", {
			
			onInit: async function () {
                this.router = this.getOwnerComponent().getRouter(this);
			    this.router.getRoute("RouteDetalle").attachPatternMatched(this._onPatternMatched, this);				
				
			},
            
			onAfterRendering: async function(){
               
			},
		
            callConstantes: async function(){
				oGlobalBusyDialog.open();
				var body={
					"nombreConsulta": "CONSGENCONST",
					"p_user": this.userOperation,
					"parametro1": this.parameter,
					"parametro2": "",
					"parametro3": "",
					"parametro4": "",
					"parametro5": ""
				}
				await fetch(`${this.onLocation()}General/ConsultaGeneral/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						
						console.log(data.data);
						this.HOST_HELP=this.url+data.data[0].LOW;
						console.log(this.HOST_HELP);
							oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},
            _onPatternMatched: async function (oEvt) {
                var that = this;
                var oView = this.getView();                
                this.userOperation =await this.getCurrentUser();
                this.objetoHelp =  this._getHelpSearch();
                this.parameter= this.objetoHelp[0].parameter;
                this.url= this.objetoHelp[0].url;
               	await this.callConstantes();
                var nameComponent = "com.tasa.mareaevento";
                var idComponent = "com.tasa.mareaevento";                   
                var urlComponent = this.HOST_HELP+".com-tasa-mareaevento.comtasamareaevento-0.0.1";

                var compCreateOk = function () {
                    that.oGlobalBusyDialog.close();
                };
                
                oView.byId('pageDetallex').destroyContent();

                var content = oView.byId('pageDetallex').getContent();
                if (content.length === 0) {
                    this.oGlobalBusyDialog = new sap.m.BusyDialog();
                    this.oGlobalBusyDialog.open();
                    var oContainer = new sap.ui.core.ComponentContainer({
                        id: idComponent,
                        name: nameComponent,
                        url: urlComponent,
                        settings: {},
                        componentData: {},
                        propagateModel: true,
                        componentCreated: compCreateOk,
                        height: '100%',
                        //manifest: true,
                        async: false
                    });

                    oView.byId('pageDetallex').addContent(oContainer);
                }

            },
            onPrevio: function(evt) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);               
                oRouter.navTo('RouteDistribucionFlota');
            }
            
            

		});
	});
