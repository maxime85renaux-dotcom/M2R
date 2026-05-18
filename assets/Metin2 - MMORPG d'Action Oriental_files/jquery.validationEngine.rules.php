var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");

(function($) {
    $.fn.validationEngineLanguage = function() {};
    $.validationEngineLanguage = {
        newLang: function() {
            $.validationEngineLanguage.allRules =     {
                    "required":{                // Add your regex rules here, you can take telephone as an example
                        "regex":"none",
                        "alertText":"* Ce champ est requis.",
                        "alertTextCheckboxMultiple":"* Treff eine Entscheidung",
                        "alertTextCheckboxe":"* Vous n'avez pas accepté les Conditions Générales d'Utilisation."},
                    "length":{
                        "regex":"none",
                        "alertText":"* Entre ",
                        "alertText2":" et ",
                        "alertText3":" caractères autorisés."},
                    "maxCheckbox":{
                        "regex":"none",
                        "alertText":"* Checks allowed Exceeded"},
                    "minCheckbox":{
                        "regex":"none",
                        "alertText":"* Bitte wähle ",
                        "alertText2":" Optionen"},
                    "confirm":{
                        "regex":"none",
                        "alertText":"* Ces champs ne correspondent pas."},
                    "telephone":{
                        "regex":"/^[0-9\-\(\)\ ]+$/",
                        "alertText":"* Unzulässige Telefonnummer"},
                    "email":{
                        "regex":"/^[a-zA-Z0-9_\\.\\-]+\\@([a-zA-Z0-9\\-]+\\.)+[a-zA-Z0-9]{2,4}$/",
                        "alertText":"* Attention, votre adresse mail semble invalide."},
                    "date":{
                         "regex":"/^[0-9]{4}\-\[0-9]{1,2}\-\[0-9]{1,2}$/",
                         "alertText":"* Invalid date, must be in YYYY-MM-DD format"},
                    "onlyNumber":{
                        "regex":"/^[0-9\ ]+$/",
                        "alertText":"* Bitte nur Nummern"},
                    "noSpecialCharacters":{
                        "regex":"/^[0-9a-zA-Z]*$/",
                        "alertText":"* Caractères spéciaux non autorisés"},
                    "noSpecialCharactersForLogin":{
                        "regex":"/^[0-9a-zA-Z_]*$/",
                        "alertText":"* Caractères spéciaux non autorisés"},
                    "onlyValidPasswordCharacters":{
                        "regex":"/^[a-zA-Z0-9 @!#$%&(){}*+,\-./:;<>=?[\\]\^_|~]*$/",
                        "alertText":"* Caractères spéciaux non autorisés"},
                    "ajaxUser":{
                        "file":"../validateUser.php",
                        "alertTextOk":"* Dieser Benutzername ist verfügbar",
                        "alertTextLoad":"* Bitte warten es wird geladen.",
                        "alertText":"* Dieser Benutzername ist nicht mehr verfügbar"},
                    "ajaxName":{
                        "file":"../validateUser.php",
                        "alertText":"* Dieser Benutzername ist nicht mehr verfügbar",
                        "alertTextOk":"* Dieser Benutzername ist verfügbar",
                        "alertTextLoad":"* Bitte warten es wird geladen."},
                    "onlyLetter":{
                        "regex":"/^[a-zA-Z\ \']+$/",
                        "alertText":"* Nur Zeichen verwenden."}
                    }
        }
    }
})(jQuery);

$(document).ready(function() {
    $.validationEngineLanguage.newLang()
});
}

/*
     FILE ARCHIVED ON 05:02:13 Apr 27, 2016 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 17:24:25 May 17, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.351
  load_resource: 59.528
  PetaboxLoader3.resolve: 45.1
  PetaboxLoader3.datanode: 13.921
*/