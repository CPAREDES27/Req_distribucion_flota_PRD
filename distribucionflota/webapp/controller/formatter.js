sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function (NumberFormat) {
	"use strict";
	return {

        formaterNumMiles: function (input) {
			var num;
			num = (input * 1).toFixed(2);
			// num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
			// num = num.split('').reverse().join('').replace(/^[\.]/, '');
			// return num;
			var separador = ","; // separador para los miles
			var sepDecimal = "."; // separador para los decimales

			num += '';
			var splitStr = num.split('.');
			var splitLeft = splitStr[0];
			var splitRight = splitStr.length > 1 ? sepDecimal + splitStr[1] : '';
			var regx = /(\d+)(\d{3})/;
			while (regx.test(splitLeft)) {
				splitLeft = splitLeft.replace(regx, '$1' + separador + '$2');
			}
			return splitLeft + splitRight;

		},
		formato2Decimales: function(decimal) {
			if (decimal){
				if (!isNaN(parseFloat(decimal))){
					return parseFloat(decimal).toFixed(2);
				} else {
					return "0";
				}
			} else {
				return "0";
			}
		},
        
        sumTotal: function (importe) {
            var sumTotal=0;
            sumTotal = sumTotal + importe;
            return sumTotal;
        },

		formato3Decimales: function(decimal) {
			if (decimal){
				if (!isNaN(parseFloat(decimal))){
					return parseFloat(decimal).toFixed(2);
				} else {
					return "0";
				}
			} else {
				return "0";
			}
        },
        
        formatoPorcDecl: function(decimal) {
			if (decimal){
				if (!isNaN(parseFloat(decimal))){
					return (parseFloat(decimal) / parseFloat(this.totDeclTodosAux)) * 100;
				} else {
					return "0";
				}
			} else {
				return "0";
			}
        },
        
		formatoEnteros: function(importe) {
			if (importe){
				if (!isNaN(parseInt(importe))){
					return parseInt(importe);
				} else {
					return "0";
				}
			} else {
				return "0";
			}
        },	 
        formaterNumMiles: function (NumberFormat) {
			var num;
			num = (NumberFormat * 1).toFixed(2);
			// num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
			// num = num.split('').reverse().join('').replace(/^[\.]/, '');
			// return num;
			var separador = ","; // separador para los miles
			var sepDecimal = "."; // separador para los decimales

			num += '';
			var splitStr = num.split('.');
			var splitLeft = splitStr[0];
			var splitRight = splitStr.length > 1 ? sepDecimal + splitStr[1] : '';
			var regx = /(\d+)(\d{3})/;
			while (regx.test(splitLeft)) {
				splitLeft = splitLeft.replace(regx, '$1' + separador + '$2');
			}
			return splitLeft + splitRight;

		},
		formatoPromedioPorc: function(importeA, importeB) {
			if (importeA && importeB){
				if (!isNaN(parseFloat(importeA)) && !isNaN(parseFloat(importeB))){
					return parseFloat((parseFloat(importeA) / parseFloat(importeB)) * 100).toFixed(2);
				} else {
					return "0";
				}
			} else {
				return "0";
			}
		},        


		formatoFecha: function(date) {
			if (date){
				var dia = date.getDate();
				var mes = date.getMonth() + 1;
				var anio = date.getFullYear();
				if (dia.toString().length == 1) dia = "0" + dia; 
				if (mes.toString().length == 1) mes = "0" + mes; 
			
				return dia + '/' + mes + '/' + anio;
			} else {
				return "";
			}
        },
        
		formatoFechaString: function(date) {
			if (date){
				var dia = date.substring(6, 8);
				var mes = date.substring(4, 6);
				var anio = date.substring(0, 4);
			
				return dia + '/' + mes + '/' + anio;
			} else {
				return "";
			}
        },   
        
		formatoHoraString: function(time) {
			if (time){
				var hora = time.substring(0, 2);
				var minuto = time.substring(2, 4);
				var segundo = time.substring(4, 6);
			
				return hora + ':' + minuto + ':' + segundo;
			} else {
				return "";
			}
        },        
        
		formatoEstado: function(IdEstado) {
			if (IdEstado){
				return IdEstado === 'S' ? 'Valido' : 'Inactivo';
			} else {
				return "";
			}
		},           
		
		formatoFechaJson: function(date) {
			if (date){
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
				var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
				var dateStr = dateFormat.format(new Date(date.getTime() + TZOffsetMs)); 
				return dateStr;
			} else {
				return "";
			}
		},		
		
		formatoFechaJson2: function(date) {
			if (date){
				var dia = date.getDate();
				var mes = date.getMonth() + 1;
				var anio = date.getFullYear();
				if (dia.toString().length == 1) dia = "0" + dia; 
				if (mes.toString().length == 1) mes = "0" + mes; 
			
				return anio + '/' + mes + '/' + dia;
			} else {
				return "";
			}
		},		
		
		formatoHora: function(s) {
			if (s && s > 0) {
				var ms = s % 1000;
				s = (s - ms) / 1000;
				var secs = s % 60;
				s = (s - secs) / 60;
				var mins = s % 60;
				var hrs = (s - mins) / 60;
				if (hrs.toString().length == 1) hrs = "0" + hrs;
				if (mins.toString().length == 1) mins = "0" + mins;
				if (secs.toString().length == 1) secs = "0" + secs;
			
				return hrs + ':' + mins + ':' + secs;				
			} else {
				return "";
			}
		}


	};
});