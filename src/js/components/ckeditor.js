var bootData = require('js/library/bootData');
var locale = require('js/app').getLocale();

window.CKEDITOR_BASEPATH = bootData('assetsBuildPath') + 'ckeditor/';

if (!window.CKEDITOR) {
    require('ckeditor');
}

var ckeditor = window.CKEDITOR;

ckeditor.config.defaultLanguage = locale;
ckeditor.config.language = locale;

// ckeditor.config.extraPlugins = 'sourcedialog,specialchar,pastetext';

ckeditor.customStyles = {
    richCombo:
        '.body, html { margin: 0; padding: 0; }' +
        '.cke_panel_block { padding: 5px 0; outline: none !important; }' +
        '.cke_panel_list { list-style:none; padding: 0; margin: 0; }' +
        '.cke_panel_listItem { padding: 0; margin; 0; }' +
        '.cke_panel_listItem a { font-family: Arial; display:block; padding: 5px 10px; text-decoration:none; font-size: 13px; color: #303030; }' +
        '.cke_panel_listItem a:hover { background-color: #ededed; }'
};

module.exports = ckeditor;
