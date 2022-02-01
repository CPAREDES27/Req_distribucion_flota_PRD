sap.ui.define([], function () {
    "use strict";
    return {
        formatDates: function (d) {
            const date = new Date(d);
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd/MM/yyyy" });

            return oDateFormat.format(date);
        },
        generateCommand: function (param, value1, value2) {
            const isRange = value1 && value2;
            const valueSelected = !isRange ? value1 ? value1 : value2 : null;
            const valuesType = typeof value1;
            let quot = ""
            switch (valuesType) {
                case "string":
                    quot = "'"
                    break;
                case "number":
                    quot = "";
                    break;
                default:
                    quot = "";
                    break;
            }
            const operator = isRange ? `BETWEEN ${quot}${value1}${quot} AND ${quot}${value2}${quot}` : `LIKE ${quot}${valueSelected}${quot}`;

            return `(${param} ${operator})`;
        },
        formatCodeDigits: function (code) {
            if(code){
                const length = 10;
                const codeFormatted = code.toString().padStart(length, "0");
                return codeFormatted;
            }else{
                return "";
            }
        },
        formatDate: function (date) {

            var fecha=null;
            if(date){
            fecha= date.split("T")[0];
            fecha=fecha.split("-").reverse().join("/");          
            }

            return fecha;
        },
        formatHour: function (hour) {
            var hora=null;
            if(hour){
                hora= hour.split("T")[1];
                hora= hora.split(":")[0]+":"+hora.split(":")[1];     

            }
            return hora;
        }
    };
});