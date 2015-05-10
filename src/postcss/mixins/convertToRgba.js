module.exports = function (mixin, hexColor, opacity) {

    if (hexColor.indexOf('#') == 0) {
        hexColor = hexColor.substring(1);
    }

    var bigint = parseInt(hexColor, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    //console.log([r, g, b, opacity].join());
    return {
        "background-color": 'rgba('+[r, g, b, opacity].join() + ')'
    }
};