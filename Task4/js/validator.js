function Validator(){}
Validator.prototype.isValidDate = function (str) {
    var parts = str.split('-');
    if(parts.length !== 3) return false;
    
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1])-1;
    var day = parseInt(parts[2]);
    
    var d = new Date(year, month, day);
    return /^\d+-\d+-\d+$/.test(str) && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

Validator.prototype.validateNumber = function (val) {
    return val.replace(/\D/g, '');
}

Validator.prototype.validateText = function (val) {
    return val.replace(/[^a-zA-Z]/g, '').toUpperCase();
},
Validator.prototype.validateRange = function(val, min, max) {
    return (val >= min && val <= max) ? val : "";
}