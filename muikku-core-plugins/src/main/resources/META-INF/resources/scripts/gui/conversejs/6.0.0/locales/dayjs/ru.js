(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["locales/dayjs/ru"],{

/***/ "./node_modules/dayjs/locale/ru.js":
/*!*****************************************!*\
  !*** ./node_modules/dayjs/locale/ru.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

!function(_,t){ true?module.exports=t(__webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js")):undefined}(this,function(_){"use strict";_=_&&_.hasOwnProperty("default")?_.default:_;var t="января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),e="январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),n="янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.".split("_"),s="янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.".split("_"),d=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/,o={name:"ru",weekdays:"воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),weekdaysShort:"вск_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"вс_пн_вт_ср_чт_пт_сб".split("_"),months:function(_,n){return d.test(n)?t[_.month()]:e[_.month()]},monthsShort:function(_,t){return d.test(t)?n[_.month()]:s[_.month()]},weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., H:mm",LLLL:"dddd, D MMMM YYYY г., H:mm"},relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:"минута",mm:"%d минут",h:"час",hh:"%d часов",d:"день",dd:"%d дней",M:"месяц",MM:"%d месяцев",y:"год",yy:"%d лет"},ordinal:function(_){return _}};return _.locale(o,null,!0),o});


/***/ })

}]);
//# sourceMappingURL=ru.js.map