module.exports.percentToInteger = function(percent, maxInteger) {
    var res = percent*maxInteger/100;

    //get decimal parts
    var test = (res-Math.floor(res)).toFixed(2);

    if(test>0.75) return parseInt(percent*maxInteger/100,10)+1;
    return parseInt(percent*maxInteger/100,10);
};