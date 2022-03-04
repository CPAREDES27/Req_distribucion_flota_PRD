sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "../Service/TasaBackendService",
    "./Utils",
    "sap/ui/core/BusyIndicator",
], function (Controller, UIComponent, mobileLibrary, TasaBackendService, Utils, BusyIndicator) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.tasa.distribucionflota.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
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
        _getHelpSearch:  function(){
            var oRouter = window.location.origin;
            var service=[];
            if(oRouter.indexOf("localhost") !== -1){
                service.push({
                    url:"https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter:"IDEVT_QAS"
                })
            } else if(oRouter.indexOf("tasadev")!== -1){
                service.push({
                    url:"https://tasadev.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter:"IDEVT_DEV"
                })
            } else if(oRouter.indexOf("tasaprd")!==-1){
                service.push({
                    url:"https://tasaprd.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter:"IDEVT_PRD"
                })
            } else if(oRouter.indexOf("tasaqas")!==-1){
                service.push({
                    url:"https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/",
                    parameter:"IDEVT_QAS"
                })
            } 
            // else{
            //     service.push({
            //         url:'https://cf-nodejs-cheerful-bat-js.cfapps.us10.hana.ondemand.com/api/',
            //         parameter:"IDEVT_DEV"
            //     })
            // }
            return service;
        },
        onLocation: function () {

            var oRouter = window.location.origin;

            console.log(oRouter)

            var service = "";

            if (oRouter.indexOf("localhost") !== -1) {

                service = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
                //service='https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

            } else if (oRouter.indexOf("tasadev") !== -1) {

                service = 'https://cf-nodejs-cheerful-bat-js.cfapps.us10.hana.ondemand.com/api/'

            } else if (oRouter.indexOf("tasaprd") !== -1) {

                service = 'https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'

            } else if (oRouter.indexOf("tasaqas") !== -1) {

                service = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'

            } else {
                service = 'https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'

            }

            console.log(service);

            return service;

        },

        cargarDatosMarea: async function (marea) {
            var bOk = false;
            var usuario = await this.getCurrentUser();
            var response = await TasaBackendService.obtenerDetalleMarea(marea, usuario);
            if (response) {
                bOk = await this.setDetalleMarea(response);
            }
            return bOk;
        },

        setDetalleMarea: async function (data) {
            BusyIndicator.show(0);
            var me = this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var modeloDetalleMarea = me.getOwnerComponent().getModel("DetalleMarea");
            var dataDetalleMarea = modeloDetalleMarea.getData();
            var marea = data.s_marea[0];
            var eventos = data.s_evento;
            var incidental = data.str_pscinc;
            var biometria = data.str_flbsp;
            var motivoResCombu = ["1", "2", "4", "5", "6", "7", "8"];
            await this.clearAllData();//inicalizar valores
            modeloDetalleMarea.setProperty("/Cabecera/INDICADOR", "E");
            //setear cabecera de formulario
            //var cabecera = dataDetalleMarea.Cabecera;
            var cabecera = modeloDetalleMarea.getProperty("/Cabecera");
            for (var keyC in cabecera) {
                if (marea.hasOwnProperty(keyC)) {
                    cabecera[keyC] = marea[keyC];
                }
            }

            //setear pestania datos generales
            //var datsoGenerales = dataDetalleMarea.DatosGenerales;
            var datsoGenerales = modeloDetalleMarea.getProperty("/DatosGenerales");
            for (var keyC in datsoGenerales) {
                if (marea.hasOwnProperty(keyC)) {
                    datsoGenerales[keyC] = marea[keyC];
                }
            }

            //cargar dsitribucion de flota
            var codigo = modeloDetalleMarea.getProperty("/Cabecera/CDEMB");
            await this.obtenerDatosDistribFlota(codigo);

            var estMarea = modeloDetalleMarea.getProperty("/DatosGenerales/ESMAR");
            var marea = modeloDetalleMarea.getProperty("/Cabecera/NRMAR");
            if (estMarea == "A") {
                await this.obtenerDatosMareaAnt(marea, codigo);
            }

            //setear lista de eventos
            modeloDetalleMarea.setProperty("/Eventos/TituloEventos", "Eventos (" + eventos.length + ")")
            //dataDetalleMarea.Eventos.TituloEventos = "Eventos (" + eventos.length + ")";

            for (let index1 = 0; index1 < eventos.length; index1++) {
                const element = eventos[index1];
                element.Indicador = "E";
                element.LatitudD = Utils.getDegrees(element.LTGEO);
                element.LatitudM = Utils.getMinutes(element.LTGEO);
                element.LongitudD = Utils.getDegrees(element.LNGEO);
                element.LongitudM = Utils.getMinutes(element.LNGEO)
            }

            //dataDetalleMarea.Eventos.Lista = eventos;
            modeloDetalleMarea.setProperty("/Eventos/Lista", eventos);
            //dataDetalleMarea.Incidental = incidental;
            modeloDetalleMarea.setProperty("/Incidental", incidental);
            //dataDetalleMarea.Biometria = biometria;
            modeloDetalleMarea.setProperty("/Biometria", biometria);

            modeloDetalleMarea.setProperty("/Config/visibleTabReserva", false);
            modeloDetalleMarea.setProperty("/Config/visibleTabVenta", false);
            var inprp = modeloDetalleMarea.getProperty("/Cabecera/INPRP");
            var motivo = modeloDetalleMarea.getProperty("/Cabecera/CDMMA");
            if (inprp == "P" && motivoResCombu.includes(motivo)) {
                await this.obtenerReservasCombustible(marea, codigo);
            }

            if (inprp == "T") {
                await this.obtenerVentasCombustible(marea);
            }

            //la pestania de reserva de combustible y venta de combustible se setean en el Detalle

            //setear config inicial
            /*dataDetalleMarea.Config.visibleLinkSelecArmador = false;
            dataDetalleMarea.Config.visibleArmadorRuc = false;
            dataDetalleMarea.Config.visibleArmadorRazon = false;
            dataDetalleMarea.Config.visibleArmadorCalle = false;
            dataDetalleMarea.Config.visibleArmadorDistrito = false;
            dataDetalleMarea.Config.visibleArmadorProvincia = false;
            dataDetalleMarea.Config.visibleArmadorDepartamento = false;*/

            //refrescar modelo y navegar al detalle
            modeloDetalleMarea.refresh();
            BusyIndicator.hide();
            //oRouter.navTo("DetalleMarea");
            //me.navToExternalComp();
            return true;
        },

        clearAllData: async function () {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            modelo.setProperty("/DatosGenerales/ESMAR", "A");
            modelo.setProperty("/Cabecera/FCCRE", Utils.strDateToSapDate(Utils.dateToStrDate(new Date())));
            modelo.setProperty("/Cabecera/HRCRE", Utils.strHourToSapHo(Utils.dateToStrHours(new Date())));
            modelo.setProperty("/Cabecera/ATCRE", await this.getCurrentUser());
        },

        obtenerDatosDistribFlota: async function (codigo) {
            //var me = this;
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            //var dataSesionModel = this.getModel("DataSession");
            //var usuario = dataSesionModel.getProperty("/User");
            var usuario = await this.getCurrentUser();
            //var distribFlota = this.getModel("DistribFlota");
            var distribFlota = modelo.getProperty("/DistribFlota");
            var constantsUtility = sap.ui.getCore().getModel("ConstantsUtility");
            var caracterEditar = constantsUtility.getProperty("/CARACTEREDITAR");
            var response = await TasaBackendService.obtenerDatosDstrFlota(codigo, usuario);
            if (response) {
                for (var key in response) {
                    if (distribFlota.hasOwnProperty(key)) {
                        distribFlota[key] = response[key];
                    }
                }
                modelo.setProperty("/DistribFlota/Indicador", caracterEditar);
                modelo.setProperty("/DistribFlota/IntLatPuerto", parseInt(response.LTGEO));
                modelo.setProperty("/DistribFlota/IntLonPuerto", parseInt(response.LNGEO));
                if (!response.DSEMP || !response.INPRP) {
                    var mssg = this.getResourceBundle().getText("PLANTASINEMPRESA");
                    MessageBox.error(mssg);
                }
                modelo.refresh();
                return true;
            } else {
                return false;
            }
        },

        obtenerDatosMareaAnt: async function (marea, codigo) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var mareaAnterior = modelo.getProperty("/MareaAnterior");
            //var utilitario = this.getModel("Utilitario");
            //var dataSesionModel = this.getModel("DataSession");
            var usuario = await this.getCurrentUser();
            var motivosSinZarpe = ["3", "7", "8"]; // motivos sin zarpe
            //var mareaAnterior = this.getModel("MareaAnterior");
            var response = await TasaBackendService.obtenerMareaAnterior(marea, codigo, usuario);
            if (response) {
                var mareaAnt = response.data[0];
                for (var key in mareaAnt) {
                    if (mareaAnterior.hasOwnProperty(key)) {
                        mareaAnterior[key] = mareaAnt[key];
                    }
                }
                if (!motivosSinZarpe.includes(mareaAnt.CDMMA)) {
                    var response1 = await TasaBackendService.obtenerEventoAnterior(parseInt(mareaAnt.NRMAR), usuario);
                    if (response1) {
                        var eventoAnt = response1.data[0];
                        if (eventoAnt) {
                            var evtMarAnt = modelo.getProperty("/MareaAnterior/EventoMarAnt");
                            for (var key in eventoAnt) {
                                if (evtMarAnt.hasOwnProperty(key)) {
                                    evtMarAnt[key] = eventoAnt[key];
                                }
                            }
                        }
                    }
                }
            }
            modelo.refresh();
        },

        obtenerReservasCombustible: async function (marea, codigo) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            var motivoSinZarpe = ["3", "7", "8"];
            var eveReserCombus = ["4", "5", "6"];
            var visibleNuevo = true;
            var mostrarTab = false;
            var mareaCerrada = modelo.getProperty("/DatosGenerales/ESMAR") == "C" ? true : false;
            var usuario = await this.getCurrentUser();
            var response = await TasaBackendService.obtenerNroReserva(marea, usuario);
            var motivoMarea = modelo.getProperty("/Cabecera/CDMMA");
            var embarcacion = modelo.getProperty("/Cabecera/CDEMB");
            modelo.setProperty("/Config/visibleReserva1", false);
            modelo.setProperty("/Config/visibleReserva2", false);
            modelo.setProperty("/Config/visibleReserva3", false);
            if (response) {
                if (response.data.length > 0) {
                    mostrarTab = true;
                }
            }
            if (!mareaCerrada) {
                if (!motivoSinZarpe.includes(motivoMarea)) {
                    var ultimoEvento = listaEventos[listaEventos.length - 1];
                    var tipoUltEvnt = ultimoEvento.CDTEV;
                    visibleNuevo = eveReserCombus.includes(tipoUltEvnt);
                    if (!mostrarTab && visibleNuevo) {
                        mostrarTab = true;
                    }
                } else {
                    mostrarTab = true;
                }
            }
            modelo.setProperty("/Config/visibleTabReserva", mostrarTab);
            if (mostrarTab) {
                var configReservas = await TasaBackendService.obtenerConfigReservas(usuario);
                if (configReservas) {
                    modelo.setProperty("/ConfigReservas/BWART", configReservas.bwart);
                    modelo.setProperty("/ConfigReservas/MATNR", configReservas.matnr);
                    modelo.setProperty("/ConfigReservas/WERKS", configReservas.werks);
                    modelo.setProperty("/ConfigReservas/Almacenes", configReservas.almacenes);
                }
                var embaComb = await TasaBackendService.obtenerEmbaComb(usuario, embarcacion);
                if (embaComb) {
                    if (embaComb.data) {
                        var emba = embaComb.data[0];
                        var objEmbComb = modelo.getProperty("/EmbaComb");
                        for (var key in emba) {
                            if (objEmbComb.hasOwnProperty(key)) {
                                objEmbComb[key] = emba[key];
                            }
                        }
                    }
                }
                await this.obtenerReservas(visibleNuevo);
                /*if (!mareaCerrada) {
                    await this.obtenerReservas(visibleNuevo);
                }else{
                    modelo.setProperty("/ReservasCombustible", reservas);
                    modelo.setProperty("/Config/visibleReserva3", true);
                }*/
            }

        },

        obtenerReservas: async function (visibleNuevo) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = modelo.getProperty("/Cabecera/NRMAR");
            var usuario = await this.getCurrentUser();
            var mareaCerrada = modelo.getProperty("/DatosGenerales/ESMAR") == "C" ? true : false;
            var response = await TasaBackendService.obtenerReservas(marea, null, null, usuario);
            modelo.setProperty("/Config/visibleReserva1", false);
            modelo.setProperty("/Config/visibleReserva2", false);
            modelo.setProperty("/Utils/TxtBtnSuministro", "Reservar");
            if (response) {
                var reservas = response.t_reservas;
                if (reservas.length != 0) {
                    modelo.setProperty("/Config/visibleReserva2", true);
                    if (visibleNuevo) {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", true);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", false);
                    }
                    for (let index = 0; index < reservas.length; index++) {
                        const element = reservas[index];
                        element.CHKDE = false;
                    }
                    modelo.setProperty("/ReservasCombustible", reservas);
                    if (mareaCerrada) {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", false);
                        modelo.setProperty("/Config/visibleAnulaReserva", false);
                        modelo.setProperty("/Config/visibleCheckReserva", false);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaReserva", true);
                        modelo.setProperty("/Config/visibleAnulaReserva", true);
                        modelo.setProperty("/Config/visibleCheckReserva", true);
                    }
                } else {
                    await this.obtenerNuevoSuministro(true);
                }
            }
            BusyIndicator.hide();
        },

        obtenerNuevoSuministro: async function (visible) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var usuario = await this.getCurrentUser();
            var eventos = modelo.getProperty("/Eventos/Lista");
            modelo.setProperty("/Config/visibleReserva1", visible);
            modelo.setProperty("/Config/visibleVenta2", visible);
            var ultimoEvento = eventos.length > 0 ? eventos[eventos.length - 1] : null;
            var descEvento = ultimoEvento ? ultimoEvento.DESC_CDTEV : "";
            var fechIniEve = ultimoEvento ? ultimoEvento.FIEVN : "";
            var numeroEvt = ultimoEvento ? ultimoEvento.NREVN : "";
            modelo.setProperty("/Cabecera/NREVN", numeroEvt);
            modelo.setProperty("/Cabecera/DESC_CDTEV", descEvento);
            modelo.setProperty("/Cabecera/FIEVN", fechIniEve);
            var planta = ultimoEvento ? ultimoEvento.CDPTA : "";
            var descr = ultimoEvento ? ultimoEvento.DESCR : "";
            var centro = modelo.getProperty("/ConfigReservas/WERKS");
            var material = modelo.getProperty("/ConfigReservas/MATNR");
            var data = await TasaBackendService.obtenerSuministro(usuario, material);
            if (data) {
                var suministro = data.data[0];
                var dsalm = "";
                var cdale = "";
                var almacenes = modelo.getProperty("/ConfigReservas/Almacenes");
                for (let index = 0; index < almacenes.length; index++) {
                    const element = almacenes[index];
                    if (element.DSALM == descr) {
                        dsalm = element.DSALM;
                        cdale = element.CDALE;
                    }
                }
                var listaSuministro = [{
                    NRPOS: "001",
                    CDSUM: suministro.CDSUM,
                    CNSUM: 0,
                    MAKTX: suministro.MAKTX,
                    CDUMD: suministro.CDUMD,
                    DSUMD: suministro.DSUMD,
                    CDPTA: planta,
                    DESCR: descr,
                    WERKS: centro,
                    DSALM: dsalm,
                    CDALE: cdale
                }];
                modelo.setProperty("/Suministro", listaSuministro);
            }
        },

        obtenerVentasCombustible: async function (marea) {
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var listaEventos = modelo.getProperty("/Eventos/Lista");
            console.log("EVENTOS: ", listaEventos);
            var mostrarTab = false;
            var mareaCerrada = modelo.getProperty("/DatosGenerales/ESMAR") == "C" ? true : false;
            var usuario = await this.getCurrentUser();
            var embarcacion = modelo.getProperty("/Cabecera/CDEMB");
            var nroVenta = await TasaBackendService.obtenerNroReserva(marea, usuario);
            if (nroVenta) {
                mostrarTab = true;
            }
            var primerRegVenta = !mostrarTab;
            var regVenta = false;
            var tipoEvento = "";
            if (!mareaCerrada) {
                for (let index = 0; index < listaEventos.length; index++) {
                    const element = listaEventos[index];
                    tipoEvento = element.CDTEV;
                    if (tipoEvento == "5") {
                        //setear centro de planta de suministro
                        regVenta = true;
                        break;
                    }
                }
                if (regVenta) {
                    mostrarTab = true;
                } else {
                    mostrarTab = false;
                }
            }
            console.log("MOST5RAR TAB: ", mostrarTab);
            modelo.setProperty("/Config/visibleTabVenta", mostrarTab);
            if (mostrarTab) {
                var configReservas = await TasaBackendService.obtenerConfigReservas(usuario);
                if (configReservas) {
                    modelo.setProperty("/ConfigReservas/BWART", configReservas.bwart);
                    modelo.setProperty("/ConfigReservas/MATNR", configReservas.matnr);
                    modelo.setProperty("/ConfigReservas/WERKS", configReservas.werks);
                    modelo.setProperty("/ConfigReservas/Almacenes", configReservas.almacenes);
                }
                var embaComb = await TasaBackendService.obtenerEmbaComb(usuario, embarcacion);
                if (embaComb) {
                    if (embaComb.data) {
                        var emba = embaComb.data[0];
                        var objEmbComb = modelo.getProperty("/EmbaComb");
                        for (var key in emba) {
                            if (objEmbComb.hasOwnProperty(key)) {
                                objEmbComb[key] = emba[key];
                            }
                        }
                    }
                }
                await this.obtenerVentas(primerRegVenta);
            }
        },

        obtenerVentas: async function (primerRegVenta) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var marea = modelo.getProperty("/Cabecera/NRMAR");
            var usuario = await this.getCurrentUser();
            var mareaCerrada = modelo.getProperty("/DatosGenerales/ESMAR") == "C" ? true : false;
            modelo.setProperty("/Config/visibleVenta1", false);
            modelo.setProperty("/Config/visibleVenta2", false);
            modelo.setProperty("/Utils/TxtBtnSuministro", "Vender");
            var response = await TasaBackendService.obtenerReservas(marea, null, null, usuario);
            if (response) {
                var ventas = response.t_reservas;
                if (ventas.length != 0) {
                    modelo.setProperty("/Config/visibleVenta1", true);
                    if (primerRegVenta) {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", true);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", false);
                    }
                    for (let index = 0; index < ventas.length; index++) {
                        const element = ventas[index];
                        element.CHKDE = false;
                    }
                    modelo.setProperty("/VentasCombustible", ventas);
                    if (mareaCerrada) {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", false);
                        modelo.setProperty("/Config/visibleAnulaVenta", false);
                        modelo.setProperty("/Config/visibleCheckVenta", false);
                    } else {
                        modelo.setProperty("/Config/visibleBtnNuevaVenta", true);
                        modelo.setProperty("/Config/visibleAnulaVenta", true);
                        modelo.setProperty("/Config/visibleCheckVenta", true);
                    }
                } else {
                    await this.obtenerNuevoSuministro(true);
                }
            }

            BusyIndicator.hide();
        },

        anularMarea: async function (marea) {
            BusyIndicator.show(0);
            var modelo = this.getOwnerComponent().getModel("DetalleMarea");
            var anularMarea = await TasaBackendService.anularMarea(marea);
            if (anularMarea) {
                var mensajes = anularMarea.t_mensaje;
                var messageItems = modelo.getProperty("/Utils/MessageItemsDM");
                modelo.setProperty("/Utils/MessageItemsDM", []);
                for (let index = 0; index < mensajes.length; index++) {
                    const element = mensajes[index];
                    var objMessage = {
                        type: element.CMIN == 'S' ? 'Success' : 'Error',
                        title: element.CMIN == 'S' ? 'Mensaje de Éxito' : 'Mensaje de Error',
                        activeTitle: false,
                        description: element.DSMIN,
                        subtitle: element.DSMIN,
                        counter: index
                    };
                    messageItems.push(objMessage);
                }
            }
            BusyIndicator.hide();
        },

        getCurrentUser: async function () {
            let oUshell = sap.ushell,
            oUser={};
            if(oUshell){
                let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
                let sEmail = oUserInfo.getEmail().toUpperCase(),
                sName = sEmail.split("@")[0],
                sDominio= sEmail.split("@")[1];
                if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
                oUser = {
                    name:sName
                }
            }else{
                oUser = {
                    name: "FGARCIA"
                }
            }

			var usuario=oUser.name;
			console.log(usuario);

            return usuario;
        },

        getUserInfoService: function () {
            return new Promise(resolve => sap.ui.require([
                "sap/ushell/library"
            ], oSapUshellLib => {
                const oContainer = oSapUshellLib.Container;
                const pService = oContainer.getServiceAsync("UserInfo"); // .getService is deprecated!
                resolve(pService);
            }));
        },



    });

});