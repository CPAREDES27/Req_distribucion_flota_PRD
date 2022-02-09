sap.ui.define([
    "./BaseController",
    "sap/ui/table/RowSettings",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/CustomData",
    "com/tasa/distribucionflota/util/formatter",
    "sap/ui/core/BusyIndicator",
    "com/tasa/distribucionflota/util/sessionService",
    "sap/ui/core/Fragment",
    'sap/ui/Device',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    "./Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, RowSettings, MessageBox, MessageToast, JSONModel, CustomData, formatter, BusyIndicator, sessionService, Fragment, Device, Filter, FilterOperator, Sorter, Utils) {
        "use strict";
        var oGlobalBusyDialog = new sap.m.BusyDialog();

        var usuario = "";
        return BaseController.extend("com.tasa.distribucionflota.controller.DistribucionFlota", {

            formatter: formatter,
            onInit: function () {
                var self = this;
                self.router = this.getOwnerComponent().getRouter(self);
                self.router.getRoute("RouteDetalle").attachPatternMatched(self._onPatternMatched, self);

                self._mViewSettingsDialogs = [];
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ListDistFlota", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/MoverEmbarcacion", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listPropios", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listTerceros", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listTotal", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listDescargas", {});
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ListPlantaCbo", {});
                
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/SearchCabecera", {});
                this.objMTable = [];
                this.arrHBox = [];
                this.mTable = {};
                this.moverInit = false;
                this.totDeclTodosAux;               
               
                this.ObtenerZonaArea();
                this.ObtenerTipoEmba();
                this.CargaMovEmba();
                this.CargarIndPropiedad();
                this.CargaTipoMarea();
                
                var obj = {};
                obj.indProp = "0";
                obj.motMarea = "2";
                obj.zonaArea = "0";
                obj.tipoEmba = "001";
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/Search", obj);
                self.tablesDistribucion(false);
               
            },
            _onPatternMatched: async function (oEvt) {
                var that = this;
                var oView = this.getView();
                // this.userOperation =await this.getCurrentUser();
                // this.objetoHelp =  this._getHelpSearch();
                // this.parameter= this.objetoHelp[0].parameter;
                // this.url= this.objetoHelp[0].url;
                // await this.callConstantes();
                // var nameComponent = "com.tasa.mareaevento";
                // var idComponent = "com.tasa.mareaevento1";                   
                // var urlComponent = this.HOST_HELP+".com-tasa-mareaevento.comtasamareaevento-0.0.1";

                // var compCreateOk = function () {
                //     that.oGlobalBusyDialog.close();
                // };

                // oView.byId('pageDetallex').destroyContent();

                // var content = oView.byId('pageDetallex').getContent();
                // if (content.length === 0) {
                //     this.oGlobalBusyDialog = new sap.m.BusyDialog();
                //     this.oGlobalBusyDialog.open();
                //     var oContainer = new sap.ui.core.ComponentContainer({
                //         id: idComponent,
                //         name: nameComponent,
                //         url: urlComponent,
                //         settings: {},
                //         componentData: {},
                //         propagateModel: true,
                //         componentCreated: compCreateOk,
                //         height: '100%',
                //         //manifest: true,
                //         async: false
                //     });

                //     oView.byId('pageDetallex').addContent(oContainer);
                // }

            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var self = this;
                var pDialog = self._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: self.getView().getId(),
                        name: sDialogFragmentName,
                        controller: self
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    self._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },

            onAfterRendering: function () {
                var self = this;
                for (var i = 0; i < this.objMTable.length; i++) {
                    let oTable = this.objMTable[i].table;
                    let oHBox = this.objMTable[i].hbox;

                    var aItems = oTable.getItems();

                    if (aItems.length > 0) {
                        const COLORS = {
                            BADVALUE_MEDIUM: "BADVALUE_MEDIUM",
                            CRITICALVALUE_LIGHT: "CRITICALVALUE_LIGHT",
                            KEY_MEDIUM: "KEY_MEDIUM",
                            POSITIVE: "POSITIVE",
                        }

                        const COLOR_DEFAULT = "SinColor";
                        let sColor, Path;
                        aItems.forEach(oItem => {
                            Path = self.getOwnerComponent().getModel("modelDistFlota").getProperty(oItem.getBindingContextPath());
                            sColor = Path.color;
                            oItem.addStyleClass(COLORS[sColor] || COLOR_DEFAULT);
                            oItem.addStyleClass("sapMTextEMB");
                        })
                        oHBox.setVisible(true);
                    } else {
                        oHBox.setVisible(false);
                    }

                }
                this._getCurrentUser();

            },


            _getCurrentUser: async function () {
                let oUshell = sap.ushell,
                    oUser = {};
                if (oUshell) {
                    let oUserInfo = await sap.ushell.Container.getServiceAsync("UserInfo");
                    let sEmail = oUserInfo.getEmail().toUpperCase(),
                        sName = sEmail.split("@")[0],
                        sDominio = sEmail.split("@")[1];
                    if (sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
                    oUser = {
                        name: sName
                    }
                } else {
                    oUser = {
                        name: "FGARCIA"
                    }
                }

                this.usuario = oUser.name;
                console.log(this.usuario);
            },

            ObtenerZonaArea: function () {
                var table = "ZFLZAR";
                var fields = '"ZCDZAR", "ZDSZAR"';
                var property = "/ListZonaArea";
                var options = [];
                options.push({
                    cantidad: "40",
                    control: "COMBOBOX",
                    key: "ZESZAR",
                    valueHigh: "",
                    valueLow: "S"
                });
                this.EjecutarReadTable(table, fields, options, property);
            },

            ObtenerTipoEmba: function () {
                var table = "ZFLTEM";
                var fields = '"CDTEM", "DESCR"';
                var property = "/ListTipoEmba";
                var options = [];
                options.push({
                    cantidad: "40",
                    control: "COMBOBOX",
                    key: "ESREG",
                    valueHigh: "",
                    valueLow: "S"
                });
                this.EjecutarReadTable(table, fields, options, property);
            },

            CargaMovEmba: function () {

                var table = "ZFLPTA";
                var fields = '"CDPTA", "DESCR"';
                var property = "/ListMovEmba";
                var options = [];
                options.push({
                    cantidad: "40",
                    control: "COMBOBOX",
                    key: "ESREG",
                    valueHigh: "",
                    valueLow: "S"
                },
                    {
                        cantidad: "40",
                        control: "COMBOBOX",
                        key: "WERKS",
                        valueHigh: "",
                        valueLow: " "
                    });
                this.EjecutarReadTable(table, fields, options, property);

            },

            EjecutarReadTable: function (table, fields, options, property) {

                var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;


                var objectRT = {
                    "delimitador": "|",
                    "fields": [],
                    "no_data": "",
                    "option": [],
                    "options": options,
                    "order": "",
                    "p_user": this.usuario, //sessionService.getCurrentUser(),
                    "rowcount": 50,
                    "rowskips": 0,
                    "tabla": table
                };

                var urlPost = this.onLocation() + "General/Read_Table/";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        var datos = data.data;

                        if (property === "/ListZonaArea") datos.push({ MANDT: "600", ZCDZAR: "0", ZDSZAR: "TODOS", ZESZAR: "S" });
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty(property, datos);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        MessageBox.error(xhr.statusText);
                    }
                });
            },

            CargarIndPropiedad: function () {
                var domname = "ZINPRP";
                var property = "/ListIndPropiedad";
                this.EjecutarDominios(domname, property);
            },

            CargaTipoMarea: function () {

                var domname = "ZDO_TIPOMAREA";
                var property = "/ListTipoMarea";
                this.EjecutarDominios(domname, property);
            },

            EjecutarDominios: function (domname, property) {

                var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;


                var objectRT = {
                    "dominios": [
                        {
                            "domname": domname,
                            "status": "A"
                        }
                    ]
                };


                var urlPost = this.onLocation() + "dominios/Listar";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        var datos = data.data[0].data;
                        datos.push({ "id": "0", "descripcion": "Todos" });
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty(property, datos);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            MoverEmbarcacion: function () {
                BusyIndicator.show(0);
                var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var dataEmba = [];

                var embarcacionesSelectas = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                var cdpta = sap.ui.getCore().byId("cbo_planta_aux").getSelectedKey();
                if (!cdpta) {
                    MessageBox.error("Debe seleccionar la embarcación");
                } else {

                    var descr = sap.ui.getCore().byId("cbo_planta_aux").getValue();

                    for (var j = 0; j < embarcacionesSelectas.length; j++) {

                        var itemSelected = embarcacionesSelectas[j];

                        var nrmar = itemSelected.numMarea;
                        var cdemb = itemSelected.codEmba;
                        var nmemb = itemSelected.descEmba;
                        var cppms = itemSelected.cbodEmba;
                        var inprp = itemSelected.indicador;
                        var cnpdc = itemSelected.pescDecl;
                        dataEmba.push({
                            NRMAR: nrmar,
                            CDEMB: cdemb,
                            NMEMB: nmemb,
                            CPPMS: cppms,
                            INPRP: inprp,
                            CDPTA: cdpta,
                            DESCR: descr,
                            CNPDC: cnpdc
                        });
                    }

                    var objectRT = {
                        "data": dataEmba,
                        "p_cdtpa": cdpta,
                        "p_user": this.usuario //sessionService.getCurrentUser(),
                    };

                    var urlPost = this.onLocation() + "embarcacion/MoverEmbarcacion/";

                    $.ajax({
                        url: urlPost,
                        type: 'POST',
                        cache: false,
                        async: false,
                        dataType: 'json',
                        data: JSON.stringify(objectRT),
                        success: function (data, textStatus, jqXHR) {
                            BusyIndicator.hide();
                            self.getOwnerComponent().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", []);
                            self.tablesDistribucion(true);
                            //MessageBox.success(data.dsmin);
                            console.log(data);
                            self._getDialogMovEmbarcacion().close();
                        },
                        error: function (xhr, readyState) {
                            console.log(xhr);
                            BusyIndicator.hide();
                        }
                    });

                }

            },

            Distribucion: function () {

                var zflrps = [];
                var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var modelDistFlota = self.getOwnerComponent().getModel("modelDistFlota").getData();
                var oSelectedItem = self.getOwnerComponent().byId("__table0-sapUiTableGridCnt").getSelectedItems();

                for (var i = 0; i < oSelectedItem.length; i++) {

                    var planta = oSelectedItem[i].getCells()[0].getText();

                    for (var j = 0; j < modelDistFlota.ListReqPesca.length; j++) {

                        var itemSelected = modelDistFlota.ListReqPesca[j];

                        if (planta === itemSelected.zdszar) {

                            var nrreq = itemSelected.nrreq;
                            var cdpta = itemSelected.cdpta;
                            var zdszar = itemSelected.zdszar;
                            var fhreq = itemSelected.fhreq;
                            var hrreq = itemSelected.hrreq;
                            var cnprq = itemSelected.cnprq;
                            var cnpcm = itemSelected.cnpcm;
                            var aufnr = itemSelected.aufnr;
                            zflrps.push({
                                NRREQ: nrreq,
                                CDPTA: cdpta,
                                ZADSZAR: zdszar,
                                FHREQ: fhreq,
                                HRREQ: hrreq,
                                CNPRQ: cnprq,
                                CNPRCM: cnpcm,
                                AUFNR: aufnr
                            });
                        }
                    }
                }
            },

            tablesDistribucion: function (update) {
                BusyIndicator.show(0);
                var urlNodeJS = sessionService.getHostService(); //"https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                var oView = self.getView();
                var cdtem = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").tipoEmba;
                var inprp = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").indProp;
                var inubc = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").motMarea;
                var numfl = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").numfilas;
                var cdplt = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").cdplta;
                //var zonaArea = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").zonaArea;

                if (!cdtem || cdtem === "0") cdtem = "";
                if (!inprp || inprp === "0") inprp = "";
                if (!inubc || inubc === "0") inubc = "";
                if (!numfl || numfl === "0") numfl = "";
                if (!cdplt || cdplt === "0") cdplt = "";
                //if (!zonaArea || zonaArea === "0") zonaArea = "";

                var objectRT = {
                    "p_cdtem": cdtem,
                    "p_codPlanta": cdplt,
                    "p_inprp": inprp,
                    "p_inubc": inubc,
                    "p_numFilas": numfl,
                    //"p_zonaArea": zonaArea,
                    "p_user": "" //sessionService.getCurrentUser(),
                }

                //var url=this.onLocation();
                var urlPost = self.onLocation() + "distribucionflota/listar";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {

                        var model = self.getOwnerComponent().getModel("modelDistFlota");
                        model.setProperty("/ListDistFlota", data.listaZonas);


                        // var NumZonasDistribucion = model.getProperty("/ListDistFlota").length;
                        // var zonaIndex = 0;
                        // var plantaIndex = 0;
                        // for (var i = 2; i < NumZonasDistribucion + 2; i++) {

                        //     zonaIndex = i - 2;
                        //     var NumPlantasDistribucion = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;

                        //     for (var j = 2; j < NumPlantasDistribucion + 2; j++) {

                        //         plantaIndex = j - 2;
                        //         var cab = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex);
                        //         cab.tot_bodFormat = Utils.formaterNumMiles(cab.tot_bod);
                        //         cab.tot_declFormat = Utils.formaterNumMiles(cab.tot_decl);
                        //         var lista = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones");

                        //         for (var k = 0; k < lista.length; k++) {
                        //             var value = lista[k];
                        //             value.cbodEmbaFormat = Utils.formaterNumMiles(value.cbodEmba);
                        //             value.pescDeclFormat = Utils.formaterNumMiles(value.pescDecl);
                        //         }
                        //     }

                        // }



                        for (var i = 2; i < data.listaZonas.length + 2; i++) {

                            var zonaIndex = i - 2;

                            var ZonaDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/zonaName");
                            var NumPlantasDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;
                            var NumZonasDistri = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/zonaName").length;

                            for (var j = 2; j < NumPlantasDistribucion + 2; j++) {

                                var plantaIndex = j - 2;
                                var ListPlantas = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" +
                                    zonaIndex + "/listaPlantas/" + plantaIndex);
                                var ListEmbarcaciones = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" +
                                    zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones");
                                ListPlantas.tot_PescaReq = parseInt(ListPlantas.tot_PescaReq);
                                ListPlantas.tot_bodFormat = Utils.formaterNumMiles(ListPlantas.tot_bod);
                                ListPlantas.tot_declFormat = Utils.formaterNumMiles(ListPlantas.tot_decl);


                                for (var k = 0; k < ListEmbarcaciones.length; k++) {
                                    ListEmbarcaciones[k].cbodEmbaFormat = Utils.formaterNumMiles(ListEmbarcaciones[k].cbodEmba);
                                    ListEmbarcaciones[k].pescDeclFormat = Utils.formaterNumMiles(ListEmbarcaciones[k].pescDecl);
                                    ListEmbarcaciones[k].horaArribo = ListEmbarcaciones[k].horaArribo.substring(0, 5);
                                    ListEmbarcaciones[k].pescDecl = parseInt(ListEmbarcaciones[k].pescDecl);
                                }


                            }
                        }

                        for (let index = 0; index < data.listaDescargas.length; index++) {
                            const element = data.listaDescargas[index];
                            element.cbodPropF = Utils.formaterNumMiles(element.cbodProp);
                            element.embaPescPropF = Utils.formaterNumMiles(element.embaPescProp);
                        }
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listDescargas", data.listaDescargas);
                        for (let index = 0; index < data.listaPropios.length; index++) {
                            const element = data.listaPropios[index];
                            element.cbodPropF = Utils.formaterNumMiles(element.cbodProp);
                            element.pescDeclPropF = Utils.formaterNumMiles(element.pescDeclProp);
                            element.embaPescPropF = Utils.formaterNumMiles(element.embaPescProp);
                        }
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listPropios", data.listaPropios);

                        for (let index = 0; index < data.listaTerceros.length; index++) {
                            const element = data.listaTerceros[index];
                            element.cbodPropF = Utils.formaterNumMiles(element.cbodProp);
                            element.pescDeclPropF = Utils.formaterNumMiles(element.pescDeclProp);
                            element.embaPescPropF = Utils.formaterNumMiles(element.embaPescProp);
                        }
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listTerceros", data.listaTerceros);
                        for (let index = 0; index < data.listaTotal.length; index++) {
                            const element = data.listaTotal[index];
                            element.cbodPropF = Utils.formaterNumMiles(element.cbodProp);
                            element.pescDeclPropF = Utils.formaterNumMiles(element.pescDeclProp);
                            element.embaPescPropF = Utils.formaterNumMiles(element.embaPescProp);
                        }
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/listTotal", data.listaTotal);

                        var totCbodTodos = 0;
                        var totDeclTodos = 0;
                        var totEPTodos = 0;
                        var totPorcTodos = 0;
                        var totDifTodos = 0;

                        var totCbodProp = 0;
                        var totDeclProp = 0;
                        var totEPProp = 0;
                        var totPorcProp = 0;
                        var totDifProp = 0;

                        var totCbodTerc = 0;
                        var totDeclTerc = 0;
                        var totEPTerc = 0;
                        var totPorcTerc = 0;
                        var totDifTerc = 0;

                        var totCbodDesc = 0;
                        var totDeclDesc = 0;
                        var totEPDesc = 0;
                        var totPorcDesc = 0;
                        var totDifDesc = 0;

                        var PorcTodos = 0;
                        var totDeclTodosAux = 0;

                        for (var i = 0; i < data.listaTotal.length; i++) {
                            totDeclTodosAux = totDeclTodosAux + parseInt(data.listaTotal[i].pescDeclProp);
                        }

                        for (var i = 0; i < data.listaTotal.length; i++) {
                            totCbodTodos = totCbodTodos + parseInt(data.listaTotal[i].cbodProp);
                            totDeclTodos = totDeclTodos + parseInt(data.listaTotal[i].pescDeclProp);
                            totEPTodos = totEPTodos + parseInt(data.listaTotal[i].embaPescProp);
                            data.listaTotal[i].porcTodos = Math.round(parseFloat((parseFloat(data.listaTotal[i].pescDeclProp) / parseFloat(totDeclTodosAux)) * 100));
                            totPorcTodos = totPorcTodos + parseFloat(data.listaTotal[i].porcTodos);
                            totDifTodos = "0";
                        }

                        var totDeclPropiosAux = 0;

                        for (var i = 0; i < data.listaPropios.length; i++) {
                            totDeclPropiosAux = totDeclPropiosAux + parseInt(data.listaPropios[i].pescDeclProp);
                        }

                        for (var i = 0; i < data.listaPropios.length; i++) {
                            totCbodProp = totCbodProp + parseInt(data.listaPropios[i].cbodProp);
                            totDeclProp = totDeclProp + parseInt(data.listaPropios[i].pescDeclProp);
                            totEPProp = totEPProp + parseInt(data.listaPropios[i].embaPescProp);
                            data.listaPropios[i].porcPropios = Math.round(parseFloat((parseFloat(data.listaPropios[i].pescDeclProp) / parseFloat(totDeclPropiosAux)) * 100));
                            totPorcProp = totPorcProp + parseFloat(data.listaPropios[i].porcPropios);
                            totDifProp = "0";
                        }

                        var totDeclTercerosAux = 0;

                        for (var i = 0; i < data.listaTerceros.length; i++) {
                            totDeclTercerosAux = totDeclTercerosAux + parseInt(data.listaTerceros[i].pescDeclProp);
                        }

                        for (var i = 0; i < data.listaTerceros.length; i++) {
                            totCbodTerc = totCbodTerc + parseInt(data.listaTerceros[i].cbodProp);
                            totDeclTerc = totDeclTerc + parseInt(data.listaTerceros[i].pescDeclProp);
                            totEPTerc = totEPTerc + parseInt(data.listaTerceros[i].embaPescProp);
                            data.listaTerceros[i].porcTerceros = Math.round(parseFloat((parseFloat(data.listaTerceros[i].pescDeclProp) / parseFloat(totDeclTercerosAux)) * 100));
                            totPorcTerc = totPorcTerc + parseFloat(data.listaTerceros[i].porcTerceros);
                            totDifTerc = "0";
                        }

                        for (var i = 0; i < data.listaDescargas.length; i++) {
                            totCbodDesc = totCbodDesc + parseInt(data.listaTerceros[i].cbodProp);
                            totDeclDesc = totDeclDesc + parseInt(data.listaTerceros[i].pescDeclProp);
                            totEPDesc = totEPDesc + parseInt(data.listaTerceros[i].embaPescProp);
                            totPorcDesc = "0";
                            totDifDesc = "0";
                        }

                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totCbodTodos", Utils.formaterNumMiles(totCbodTodos));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDeclTodos", Utils.formaterNumMiles(totDeclTodos));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totEPTodos", Utils.formaterNumMiles(totEPTodos));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totPorcTodos", totPorcTodos);
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDifTodos", totDifTodos);

                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totCbodProp", Utils.formaterNumMiles(totCbodProp));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDeclProp", Utils.formaterNumMiles(totDeclProp));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totEPProp", Utils.formaterNumMiles(totEPProp));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totPorcProp", totPorcProp);
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDifProp", totDifProp);

                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totCbodTerc", Utils.formaterNumMiles(totCbodTerc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDeclTerc", Utils.formaterNumMiles(totDeclTerc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totEPTerc", Utils.formaterNumMiles(totEPTerc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totPorcTerc", totPorcTerc);
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDifTerc", totDifTerc);

                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totCbodDesc", Utils.formaterNumMiles(totCbodDesc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDeclDesc", Utils.formaterNumMiles(totDeclDesc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totEPDesc", Utils.formaterNumMiles(totEPDesc));
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totPorcDesc", totPorcDesc);
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/totDifDesc", totDifDesc);

                        self.generarPlantasDinamicas(self);
                        self.onAfterRendering();

                        console.log(data);
                        BusyIndicator.hide();
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                        BusyIndicator.hide();
                    }
                });

            },

            BuscarTable: function () {
                var table = this.mTable["mitabla"];
                var table2 = this.getView().byId("idRandomDataTableTableDsF3");
                console.log(table);
            },

            BuscarEmbarcacion: function (oEvent) {

                console.log(oEvent);
                if (oEvent.getParameters().clearButtonPressed) return;
                var self = this;
                var model = self.getOwnerComponent().getModel("modelDistFlota");
                var NumZonasDistribucion = model.getProperty("/ListDistFlota").length;
                var Search = model.getProperty("/Search/Embarcacion").trim().toUpperCase();
                var ZonaDistribucion = "";
                var NumPlantasDistribucion = "";
                var PlantaDistribucion = "";
                var zonaIndex = 0;
                var plantaIndex = 0;
                var existe = false;

                for (var i = 2; i < NumZonasDistribucion + 2; i++) {

                    zonaIndex = i - 2;
                    NumPlantasDistribucion = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;

                    for (var j = 2; j < NumPlantasDistribucion + 2; j++) {

                        plantaIndex = j - 2;
                        var NumEmbarcacionDistribucion = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones").length;
                        // var Search = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search/Embarcacion").trim().toUpperCase();
                        var NumEmbarcacion = 0;

                        for (var m = 0; m < NumEmbarcacionDistribucion; m++) {

                            ZonaDistribucion = model.getProperty("/ListDistFlota/" + zonaIndex + "/zonaName");
                            PlantaDistribucion = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaName");
                            NumEmbarcacion = m;
                            var Embarcacion = model.getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones/" + NumEmbarcacion + "/descEmba");

                            if (Embarcacion === Search) {

                                existe = true;
                                MessageBox.success("La embarcación se encuentra en la zona " + ZonaDistribucion + " y la planta " + PlantaDistribucion);
                                return;

                            }
                        }
                    }
                }

                if (!existe) {

                    MessageBox.error("No se encontro la embarcación");

                }
            },

            handleSelectionChange: function (oEvent) {
                var self = this;
                var changedItems = oEvent.getParameter("changedItems") || [oEvent.getParameter("changedItem")];
                var isSelected = oEvent.getParameter("selected");
                var isSelectAllTriggered = oEvent.getParameter("selectAll");
                var state = isSelected ? "Selected" : "Deselected";
                var Id = oEvent.getParameters().changedItem.mProperties.key

                if (Id === "T") {

                    self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowTdc", isSelected);

                } else if (Id === "ZP") {

                    self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowZonP", isSelected);

                } else {

                    self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowEstSisFrio", isSelected);

                }
            },

            onSelectionFilter: function () {
                var self = this;
                self.tablesDistribucion(true);
                MessageBox.success("La actualización se realizo satisfactoriamente");

            },

            rowcount: function () {

                var numfilas = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").Numfilas;
                var codPlanta = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/Search").CodPlanta;
                var table;

                for (var i = 0; i < this.objMTable.length; i++) {

                    table = this.objMTable[i].sId
                    var includes = table.includes(codPlanta);

                    if (includes) {

                        this.objMTable[i].setGrowing(true);
                        this.objMTable[i].setGrowingThreshold(1);
                        break;

                    }

                }



            },

            onRowCountFilter: function () {

                this.rowcount();

            },

            formatDate: function (date) {
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let second = date.getSeconds();
                let dateFormatted = '';

                if (day < 10) day = '0' + day;
                if (month < 10) month = '0' + month;
                if (hour < 10) hour = '0' + hour;
                if (minute < 10) minute = '0' + minute;
                if (second < 10) second = '0' + second;

                dateFormatted = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;

                return dateFormatted;
            },

            generarPlantasDinamicas: function (self, numfilas, codPlanta) {
                var self = this;
                var oView = self.getView();
                var NumZonasDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota").length;
                var zonaIndex = 0;
                var plantaIndex = 0;
                var listPlantas = [];
                sap.ui.getCore().byId("__bar1").destroyContent();
                var now = self.formatDate(new Date());
                now = now.substring(0, 16);
                var me = this;

                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/Now", now);
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowTdc", false);
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowEstSisFrio", false);
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowZonP", false);
                var model = self.getOwnerComponent().getModel("modelDistFlota");                
                var selectedTdcZpSf = oView.byId("idTdcZpSf").getSelectedKeys();
                selectedTdcZpSf.forEach(function(element){
                
                    var isSelected = false;                    
                    if (element === "T") {
                        isSelected =  true;
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowTdc", isSelected);

                    } else if (element === "ZP") {   
                        isSelected =  true;         
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowZonP", isSelected);

                    } else if (element === "SF") {    
                        isSelected =  true;        
                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ShowEstSisFrio", isSelected);

                    }
                });            

                for (var i = 2; i < NumZonasDistribucion + 2; i++) {

                    zonaIndex = i - 2;

                    var ZonaDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/zonaName");
                    var NumPlantasDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas").length;
                    var NumZonasDistri = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/zonaName").length;


                    if (zonaIndex % 2 === 0) {
                        var oHBoxDistribucion = new sap.m.HBox({
                            width: "100%",
                            //Id: this.getView.byId("container-distribucionflota---DistribucionFlota--hBoxContent1")
                        });
                    }

                    var TabBarZonaPlanta = new sap.m.IconTabBar({
                        expanded: true
                    });

                    var oHBoxDistribucionPlanta = new sap.m.HBox({
                        renderType: "Bare",
                        class: "sapUiNoMargin",
                        width: "58%"
                    });

                    var oPanelDistribucionPlanta = new sap.m.Panel({
                        expandable: true,
                        headerText: ZonaDistribucion,
                        width: "auto",
                        class: "sapUiNoMargin",
                        expanded: true
                    });

                    for (var j = 2; j < NumPlantasDistribucion + 2; j++) {

                        plantaIndex = j - 2;

                        var idTableAux = "Table_DF1";
                        var PlantaDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaName");
                        var idPlantaDistribucion = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/codPlanta");
                        listPlantas.push({ "codPlanta": idPlantaDistribucion, "descPlanta": PlantaDistribucion });

                        var rowstable = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones");
                        var rowstableDistribucion = "modelDistFlota>/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones";
                        if (rowstable.length > 0) {

                            // for (let index = 0; index < rowstableDistribucion.length; index++) {
                            //     const element = rowstableDistribucion[index];
                            //     element.cbodEmbaFormat = Utils.formaterNumMiles(element.cbodEmba);
                            // }

                            self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/plantaTableId", idTableAux + plantaIndex);
                            var NumvisibleRowCount = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones").length;
                            var totalesTable = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex)

                            var tot_Est = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_Est");
                            var tot_PescaReq = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_PescaReq");
                            var tot_bod = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_bodFormat");
                            var tot_decl = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_declFormat");
                            var tot_emb = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/tot_emb");
                            4
                            var IdTable = "Tbl" + PlantaDistribucion + zonaIndex + plantaIndex;
                            var Row = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ListDistFlota/" + zonaIndex + "/listaPlantas/" + plantaIndex + "/listaEmbarcaciones/0/cbodEmba");


                            var oHBoxPlantaBase = new sap.m.HBox({
                                width: "100%",
                                class: "sapUiNoMargin"
                            });

                            var oHBoxPlanta = new sap.m.HBox({
                                renderType: "Bare",
                                class: "sapUiNoMargin",
                                width: "100%"
                            });

                            var oPanelPlanta = new sap.m.Panel({
                                expandable: true,
                                class: "sapUiNoMargin",
                                headerText: "Req. Pesca Declarada " + tot_PescaReq + " Tn",
                                width: "auto",
                                expanded: true
                            });

                            var iconTabFilterPlanta = new sap.m.IconTabFilter({
                                expanded: true,
                                class: "sapUiNoMargin",
                                text: PlantaDistribucion,
                                icon: "sap-icon://sys-enter",
                                iconColor: "Positive"
                            });

                            var oTable = new sap.m.Table("idRandomDataTable" + IdTable, {
                                width: "auto",
                                class: "sapUiNoMargin",
                                mode: "MultiSelect",
                                selectionChange: function (oEvent) {
                                    var sPath = oEvent.getParameters().listItem.oBindingContexts.modelDistFlota.sPath;
                                    var rowSelected = this.getView().getModel('modelDistFlota').getProperty(sPath);
                                    if (oEvent.getParameters().selected) {
                                        var depositoTemporal = [];
                                        if (this.moverInit) depositoTemporal = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                                        depositoTemporal.push(rowSelected);
                                        self.getOwnerComponent().getModel("modelDistFlota").setProperty("/EmbarcacionesSelectas", depositoTemporal);
                                        this.moverInit = true;
                                    } else {
                                        var embarcacionesSelectas = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas");
                                        for (var i = 0; i < embarcacionesSelectas.length; i++) {
                                            if (embarcacionesSelectas[i].codEmba === rowSelected.codEmba)
                                                self.getOwnerComponent().getModel("modelDistFlota").getProperty("/EmbarcacionesSelectas").splice(i);
                                        }
                                    }
                                }.bind(this),
                                headerToolbar: new sap.m.Toolbar({
                                    content: [
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.Button("idGroupButton" + IdTable, {
                                            icon: "sap-icon://sort",
                                            tooltip: "Sort",
                                            type: "Emphasized",
                                            press: function (oEvent) {
                                                var table = oEvent.getSource().getParent().getParent();

                                                var columns = oEvent.getSource().getParent().getParent().getColumns();
                                                var list = [];
                                                for (let index = 0; index < columns.length; index++) {
                                                    const element = columns[index];
                                                    var obj = {};
                                                    var cabecera = element.getAggregation("header").getProperty("text");
                                                    var flag = false;
                                                    if (index === 1) {
                                                        obj.flag = true;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].descEmba;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 2) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].cbodEmba;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 3) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].pescDecl;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 4) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].estado;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 5) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].horaArribo;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    }
                                                    // else if(index === 6){
                                                    //     flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowTdc");
                                                    //     obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].tdc;
                                                    //     obj.fieldName = cabecera;     
                                                    //     if(flag){
                                                    //         list.push(obj);  
                                                    //     }                                                    
                                                    // } 
                                                    else if (index === 7) {
                                                        obj.flag = false;
                                                        flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowZonP");
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].tdc;
                                                        obj.fieldName = cabecera;
                                                        if (flag) {
                                                            list.push(obj);
                                                        }
                                                    } else if (index === 8) {
                                                        obj.flag = false;
                                                        flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowEstSisFrio");
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].descZonaCala;
                                                        obj.fieldName = cabecera;
                                                        if (flag) {
                                                            list.push(obj);
                                                        }
                                                    }


                                                }
                                                var model = this.getOwnerComponent().getModel("modelDistFlota");
                                                model.setProperty("/listField", list);
                                                model.setProperty("/currentTable", table);
                                                //open dialog
                                                var oDialog = self.byId("DialogSort");
                                                if (!oDialog) {
                                                    // load asynchronous XML fragment
                                                    oDialog = sap.ui.xmlfragment(oView.getId(), "com.tasa.distribucionflota.fragment.SortDialog", self);
                                                    oView.addDependent(oDialog);

                                                    oDialog.open();
                                                } else {

                                                    oDialog.open();
                                                }

                                                // this.getViewSettingsDialog("com.tasa.distribucionflota.fragment.SortDialog")
                                                // .then(function (oViewSettingsDialog) {
                                                //     oViewSettingsDialog.open();
                                                // });
                                            }.bind(this)
                                        }),
                                        new sap.m.Button("idFilterButton" + IdTable, {
                                            icon: "sap-icon://filter",
                                            tooltip: "Filter",
                                            type: "Emphasized",
                                            press: function (oEvent) {

                                                var table = oEvent.getSource().getParent().getParent();

                                                var columns = oEvent.getSource().getParent().getParent().getColumns();
                                                var list = [];
                                                for (let index = 0; index < columns.length; index++) {
                                                    const element = columns[index];
                                                    var obj = {};
                                                    var cabecera = element.getAggregation("header").getProperty("text");
                                                    var flag = false;
                                                    if (index === 1) {
                                                        obj.flag = true;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].descEmba;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 2) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].cbodEmba;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 3) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].pescDecl;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 4) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].estado;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    } else if (index === 5) {
                                                        obj.flag = false;
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].horaArribo;
                                                        obj.fieldName = cabecera;
                                                        list.push(obj);
                                                    }
                                                    // else if(index === 6){
                                                    //     flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowTdc");
                                                    //     obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].tdc;
                                                    //     obj.fieldName = cabecera;     
                                                    //     if(flag){
                                                    //         list.push(obj);  
                                                    //     }                                                    
                                                    // } 
                                                    else if (index === 7) {
                                                        obj.flag = false;
                                                        flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowZonP");
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].tdc;
                                                        obj.fieldName = cabecera;
                                                        if (flag) {
                                                            list.push(obj);
                                                        }
                                                    } else if (index === 8) {
                                                        obj.flag = false;
                                                        flag = self.getOwnerComponent().getModel("modelDistFlota").getProperty("/ShowEstSisFrio");
                                                        obj.field = oEvent.getSource().getParent().getParent().getBindingInfo("items").binding.oList[0].descZonaCala;
                                                        obj.fieldName = cabecera;
                                                        if (flag) {
                                                            list.push(obj);
                                                        }
                                                    }


                                                }
                                                var model = this.getOwnerComponent().getModel("modelDistFlota");
                                                model.setProperty("/listField", list);
                                                model.setProperty("/currentTable", table);
                                                //open dialog
                                                var oDialog = self.byId("DialogFilter");
                                                if (!oDialog) {
                                                    // load asynchronous XML fragment
                                                    oDialog = sap.ui.xmlfragment(oView.getId(), "com.tasa.distribucionflota.fragment.FilterDialog", self);
                                                    oView.addDependent(oDialog);

                                                    this.getView().byId("idInputValueFilter").setValue("");
                                                    oDialog.open();
                                                } else {

                                                    this.getView().byId("idInputValueFilter").setValue("");
                                                    oDialog.open();
                                                }

                                                // this.getViewSettingsDialog("com.tasa.distribucionflota.fragment.FilterDialog")
                                                // .then(function (oViewSettingsDialog) {
                                                //     oViewSettingsDialog.open();
                                                // });
                                            }.bind(this)
                                        })

                                    ]
                                }),
                                columns: [
                                    new sap.m.Column({
                                        width: "10%",
                                        visible: false,
                                        header: new sap.m.Label({
                                            text: "FlagEmba"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: ""
                                        })
                                    }), new sap.m.Column({
                                        width: "35%",
                                        header: new sap.m.Label({
                                            wrapping: true,
                                            text: "Embarcación"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: "EP: " + tot_emb
                                        })
                                    }), new sap.m.Column({
                                        width: "25%",
                                        factory: '_resultColumnFactory',
                                        hAlign: "End",
                                        header: new sap.m.Label({
                                            text: "Cbod"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: tot_bod
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",
                                        hAlign: "End",
                                        header: new sap.m.Label({
                                            text: "Decl"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: tot_decl
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",

                                        header: new sap.m.Label({
                                            text: "Est"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: tot_Est
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",
                                        header: new sap.m.Label({
                                            text: "Arr"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: ""
                                        })
                                    })/*, new sap.m.Column({
                                width: "10%",
                                header : new sap.m.Label({
                                    text : "DA"
                                }),
                                footer : new sap.m.Label({ // footer of the second column
                                text : ""
                                })
                            })*/, new sap.m.Column({
                                        width: "20%",
                                        visible: '{modelDistFlota>/ShowTdc}',
                                        header: new sap.m.Label({
                                            text: "Tdc"
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",
                                        hAlign: "End",
                                        visible: '{modelDistFlota>/ShowZonP}',
                                        header: new sap.m.Label({
                                            text: "ZonP"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: ""
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",
                                        visible: '{modelDistFlota>/ShowEstSisFrio}',
                                        header: new sap.m.Label({
                                            text: "SisFrio"
                                        })
                                    }), new sap.m.Column({
                                        width: "20%",
                                        visible: false,
                                        header: new sap.m.Label({
                                            text: "Semaforo"
                                        }),
                                        footer: new sap.m.Label({ // footer of the second column
                                            text: ""
                                        })
                                    })]
                            });

                            var columnListItem = new sap.m.ColumnListItem({
                                cells: [new sap.m.Text({
                                    text: "{modelDistFlota>FlagEmba}",
                                    class: ".sapMTextEMB"
                                }), new sap.m.Link({
                                    text: "{modelDistFlota>descEmba}",
                                    wrapping: true,
                                    press: async function (evt) {
                                        //console.log(evt.getSource().getParent().getBindingContext("modelDistFlota").getObject());
                                        var object = evt.getSource().getParent().getBindingContext("modelDistFlota").getObject();
                                        await me._onNavDetalleMarea(object);
                                    }
                                }), new sap.m.Text({
                                    text: "{ parts: [ {path: 'modelDistFlota>cbodEmbaFormat'}]}"
                                }), new sap.m.Text({
                                    text: "{ parts: [ {path: 'modelDistFlota>pescDeclFormat'}], formatter : '.formatter.formaterNumMiles'}"
                                }), new sap.m.Text({
                                    text: "{modelDistFlota>estado}"
                                }), new sap.m.Text({
                                    text: "{ parts: [ {path: 'modelDistFlota>horaArribo'}], formatter : '.formatter.formatoHoraPlanta'}"
                                }),
                                //  new sap.ui.core.Icon({
                                //     src: "sap-icon://color-fill",
                                //     color: "#FF122A"
                                // }), 
                                new sap.m.Text({
                                    text: "{modelDistFlota>tdc}"
                                }), new sap.m.Text({
                                    text: "{modelDistFlota>descZonaCala}"
                                }), new sap.m.Text({
                                    text: "{modelDistFlota>estSisFrio}"
                                }), new sap.m.Text({
                                    text: "{modelDistFlota>zonP}"
                                }), new sap.m.Text({
                                    text: "{modelDistFlota>semaforo}",
                                }),]
                            });


                            oTable.bindAggregation("items", { path: rowstableDistribucion, template: columnListItem });

                            this.objMTable.push({ table: oTable, hbox: oHBoxDistribucionPlanta });
                            //this.arrHBox.push(oHBoxDistribucion);


                            oHBoxDistribucion.addItem(oHBoxDistribucionPlanta);

                            oHBoxDistribucionPlanta.addItem(oPanelDistribucionPlanta);

                            oPanelDistribucionPlanta.addContent(TabBarZonaPlanta);

                            TabBarZonaPlanta.addItem(iconTabFilterPlanta);

                            iconTabFilterPlanta.addContent(oHBoxPlantaBase);

                            oHBoxPlantaBase.addItem(oHBoxPlanta);

                            oHBoxPlanta.addItem(oPanelPlanta);

                            oPanelPlanta.addContent(oTable);

                            oHBoxDistribucion.placeAt("__bar1");
                        }
                    }
                }
                listPlantas.push({ "codPlanta": "0", "descPlanta": "TODOS" });
                self.getOwnerComponent().getModel("modelDistFlota").setProperty("/ListPlantaCbo", listPlantas);
            },

            _onOpenDialogMovEmbarcacion: function () { //_onOpenDialogCentro
                this.CargaMovEmba();
                this._getDialogMovEmbarcacion().open();
            },

            _onCloseDialogMovEmbarcacion: function () {
                this._getDialogMovEmbarcacion().close();
            },

            _PressMoverEmbarcacion: function () {
                this.MoverEmbarcacion();
            },

            _getDialogMovEmbarcacion: function () {
                if (!this._oDialogMoverEmbarcacion) {
                    this._oDialogMoverEmbarcacion = sap.ui.xmlfragment("com.tasa.distribucionflota.view.DlgMoverEmbarcacion", this.getView().getController());
                    this.getView().addDependent(this._oDialogMoverEmbarcacion);
                }
                return this._oDialogMoverEmbarcacion;
            },

            _onNavDetalleMarea: async function (objeto) {
                //BusyIndicator.show(0);
                var self = this;
                var nrmar = !isNaN(objeto.numMarea) ? parseInt(objeto.numMarea) : 0;
                if (nrmar > 0) {
                    var cargarMarea = await this.cargarDatosMarea(nrmar);
                    if (cargarMarea) {
                        var modelo = self.getOwnerComponent().getModel("DetalleMarea");
                        var modeloDistrFlota = self.getModel("modelDistFlota");
                        var dataModelo = modelo.getData();
                        var dataDistrFlota = modeloDistrFlota.getData();
                        self.getOwnerComponent().setModel(modelo, "DataModelo");
                        self.getOwnerComponent().setModel(modeloDistrFlota, "DistrFlota");
                        var objAppOrigin = {};
                        objAppOrigin.AppOrigin = 'DistribucionFlota';
                        var modelAppOrigin = new JSONModel();
                        modelAppOrigin.setData(objAppOrigin);
                        self.getOwnerComponent().setModel(modelAppOrigin, "AppOrigin");


                    } else {
                        // BusyIndicator.hide();
                    }
                }
                var oRouter = sap.ui.core.UIComponent.getRouterFor(self);
                oRouter.navTo('RouteDetalle', {
                    aux: 'X'
                });

                // else {
                //     BusyIndicator.hide();
                // }
            },
            onActionCloseDialog: function (oEvent, id) {
                // var self = this;
                // self.getViewSettingsDialog("com.tasa.distribucionflota.fragment.FilterDialog")
                //                             .then(function (oViewSettingsDialog) {
                //                                 oViewSettingsDialog.close();
                //                             });
                var self = this;
                var idPopUp = "";
                if (oEvent !== null) {
                    idPopUp = oEvent.getSource().getParent().getId();
                } else {
                    idPopUp = id;
                }

                var oDialog = self.getView().byId(idPopUp);
                oDialog.close();
            },
            onActionOkFilter: function (oEvent) {
                var self = this;
                var oView = self.getView();
                var model = this.getOwnerComponent().getModel("modelDistFlota");
                // var sflagSeleted = oView.byId("idListFieldFilter").getSelectedContexts().length;
                // if(sflagSeleted < 1){
                //     MessageBox.information("Seleccione un campo de filtrado");
                //     return;
                // }
                var sQuery = oView.byId("idInputValueFilter").getValue();
                // if(Utils.isEmpty(sQuery)){
                //     MessageBox.information("Ingrese el valor de filtro");
                //     return;
                // }

                var aContexts = oView.byId("idListFieldFilter").getSelectedContexts();
                var oThisObj = {};
                for (var i = aContexts.length - 1; i >= 0; i--) {
                    oThisObj = aContexts[i].getObject();
                }
                var sField = "";
                if (oThisObj.fieldName === "Embarcación") {
                    sField = "descEmba";
                } else if (oThisObj.fieldName === "Cbod") {
                    sField = "cbodEmba";
                } else if (oThisObj.fieldName === "Decl") {
                    sField = "pescDecl";
                } else if (oThisObj.fieldName === "Est") {
                    sField = "estado";
                } else if (oThisObj.fieldName === "Arr") {
                    sField = "horaArribo";
                } else if (oThisObj.fieldName === "ZonP") {
                    sField = "tdc";
                } else if (oThisObj.fieldName === "SisFrio") {
                    sField = "descZonaCala";
                }
                // add filter for search
                var aFilters = [];

                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter(sField, FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                // update list binding
                var oList = model.getProperty("/currentTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
                var idPopUp = oEvent.getSource().getParent().getId();
                self.onActionCloseDialog(null, idPopUp);

            },
            onActionOkSort: function (oEvent) {
                var self = this;
                var oView = self.getView();
                var model = this.getOwnerComponent().getModel("modelDistFlota");

                var oTable = model.getProperty("/currentTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];
                var aContexts = oView.byId("idListFieldSort").getSelectedContexts();
                var oThisObj = {};
                for (var i = aContexts.length - 1; i >= 0; i--) {
                    oThisObj = aContexts[i].getObject();
                }
                var sField = "";
                if (oThisObj.fieldName === "Embarcación") {
                    sField = "descEmba";
                } else if (oThisObj.fieldName === "Cbod") {
                    sField = "cbodEmba";
                } else if (oThisObj.fieldName === "Decl") {
                    sField = "pescDecl";
                } else if (oThisObj.fieldName === "Est") {
                    sField = "estado";
                } else if (oThisObj.fieldName === "Arr") {
                    sField = "horaArribo";
                } else if (oThisObj.fieldName === "ZonP") {
                    sField = "tdc";
                } else if (oThisObj.fieldName === "SisFrio") {
                    sField = "descZonaCala";
                }
                var selected = oView.byId("idRbtnSortOrder").getSelectedIndex();
                if (selected === 0) {
                    bDescending = false;
                } else if (selected === 1) {
                    bDescending = true;
                }

                aSorters.push(new Sorter(sField, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);

                var idPopUp = oEvent.getSource().getParent().getId();
                self.onActionCloseDialog(null, idPopUp);

            },
            ontestnav: function () {
                var self = this;
                var oView = self.getView();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(self);
                oRouter.navTo('RouteDetalle', {
                    aux: 'X'
                });
            }

        });
    });
