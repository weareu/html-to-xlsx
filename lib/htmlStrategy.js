var cheerio = require('cheerio'),
    juice = require('juice');

var colorNameToHex = function(color) {
    if(!color) return color;
    
    var colors = {'aliceblue':'#f0f8ff','antiquewhite':'#faebd7','aqua':'#00ffff','aquamarine':'#7fffd4','azure':'#f0ffff',
    'beige':'#f5f5dc','bisque':'#ffe4c4','black':'#000000','blanchedalmond':'#ffebcd','blue':'#0000ff','blueviolet':'#8a2be2','brown':'#a52a2a','burlywood':'#deb887',
    'cadetblue':'#5f9ea0','chartreuse':'#7fff00','chocolate':'#d2691e','coral':'#ff7f50','cornflowerblue':'#6495ed','cornsilk':'#fff8dc','crimson':'#dc143c','cyan':'#00ffff',
    'darkblue':'#00008b','darkcyan':'#008b8b','darkgoldenrod':'#b8860b','darkgray':'#a9a9a9','darkgreen':'#006400','darkkhaki':'#bdb76b','darkmagenta':'#8b008b','darkolivegreen':'#556b2f',
    'darkorange':'#ff8c00','darkorchid':'#9932cc','darkred':'#8b0000','darksalmon':'#e9967a','darkseagreen':'#8fbc8f','darkslateblue':'#483d8b','darkslategray':'#2f4f4f','darkturquoise':'#00ced1',
    'darkviolet':'#9400d3','deeppink':'#ff1493','deepskyblue':'#00bfff','dimgray':'#696969','dodgerblue':'#1e90ff',
    'firebrick':'#b22222','floralwhite':'#fffaf0','forestgreen':'#228b22','fuchsia':'#ff00ff',
    'gainsboro':'#dcdcdc','ghostwhite':'#f8f8ff','gold':'#ffd700','goldenrod':'#daa520','gray':'#808080','green':'#008000','greenyellow':'#adff2f',
    'honeydew':'#f0fff0','hotpink':'#ff69b4',
    'indianred ':'#cd5c5c','indigo':'#4b0082','ivory':'#fffff0','khaki':'#f0e68c',
    'lavender':'#e6e6fa','lavenderblush':'#fff0f5','lawngreen':'#7cfc00','lemonchiffon':'#fffacd','lightblue':'#add8e6','lightcoral':'#f08080','lightcyan':'#e0ffff','lightgoldenrodyellow':'#fafad2',
    'lightgrey':'#d3d3d3','lightgreen':'#90ee90','lightpink':'#ffb6c1','lightsalmon':'#ffa07a','lightseagreen':'#20b2aa','lightskyblue':'#87cefa','lightslategray':'#778899','lightsteelblue':'#b0c4de',
    'lightyellow':'#ffffe0','lime':'#00ff00','limegreen':'#32cd32','linen':'#faf0e6',
    'magenta':'#ff00ff','maroon':'#800000','mediumaquamarine':'#66cdaa','mediumblue':'#0000cd','mediumorchid':'#ba55d3','mediumpurple':'#9370d8','mediumseagreen':'#3cb371','mediumslateblue':'#7b68ee',
    'mediumspringgreen':'#00fa9a','mediumturquoise':'#48d1cc','mediumvioletred':'#c71585','midnightblue':'#191970','mintcream':'#f5fffa','mistyrose':'#ffe4e1','moccasin':'#ffe4b5',
    'navajowhite':'#ffdead','navy':'#000080',
    'oldlace':'#fdf5e6','olive':'#808000','olivedrab':'#6b8e23','orange':'#ffa500','orangered':'#ff4500','orchid':'#da70d6',
    'palegoldenrod':'#eee8aa','palegreen':'#98fb98','paleturquoise':'#afeeee','palevioletred':'#d87093','papayawhip':'#ffefd5','peachpuff':'#ffdab9','peru':'#cd853f','pink':'#ffc0cb','plum':'#dda0dd','powderblue':'#b0e0e6','purple':'#800080',
    'rebeccapurple':'#663399','red':'#ff0000','rosybrown':'#bc8f8f','royalblue':'#4169e1',
    'saddlebrown':'#8b4513','salmon':'#fa8072','sandybrown':'#f4a460','seagreen':'#2e8b57','seashell':'#fff5ee','sienna':'#a0522d','silver':'#c0c0c0','skyblue':'#87ceeb','slateblue':'#6a5acd','slategray':'#708090','snow':'#fffafa','springgreen':'#00ff7f','steelblue':'#4682b4',
    'tan':'#d2b48c','teal':'#008080','thistle':'#d8bfd8','tomato':'#ff6347','turquoise':'#40e0d0',
    'violet':'#ee82ee',
    'wheat':'#f5deb3','white':'#ffffff','whitesmoke':'#f5f5f5',
    'yellow':'#ffff00','yellowgreen':'#9acd32'};

    if (typeof colors[color.toLowerCase()] != 'undefined')
        return colors[color.toLowerCase()];

    return color;
};

var getColor = function(color) {
    if(!color) return color;

    if(color.indexOf('rgb') >= 0) {
        var result = /rgb\s*\(([0-9]{1,3})\s*\,\s*([0-9]{1,3})\s*\,\s*([0-9]{1,3})\s*\)/.exec(color);
        return result ? [
            result[1],
            result[2],
            result[3] ] : color;
    }
    else {
        color = colorNameToHex(color);
            
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? [
            parseInt(result[1], 16).toString(),
            parseInt(result[2], 16).toString(),
            parseInt(result[3], 16).toString() ] : color;
    }
};

var valOrDef = function(val, def) {
    if(val)
        return val;
    else 
        return def;
};

var evaluate = function($html) {
    var $ = cheerio;

    var tableOut = { rows: [] };
    var table = $html.find('TABLE');
    if ($html.prop('tagName').toLowerCase() === 'table')
        table = $html;

    if (!table || table.length === 0)
        return tableOut;

    var rows = $(table).find('TR');
    for (var r = 0, n = rows.length; r < n; r++) {
        var row = [];
        tableOut.rows.push(row);

        var cells = $(rows[r]).find('TD');
        
        if(!cells || cells.length === 0)
            throw 'No cells detected';

        for (var c = 0, m = cells.length; c < m; c++) {
            var cell = $(cells[c]);

            var border = cell.css('border-style');
            var text = cell.text();
            if(text === '')
                text = '&nbsp;';
            row.push({
                value: text.trim(),
                backgroundColor: valOrDef(getColor(cell.css('background-color')), [255, 255, 255]),
                foregroundColor: valOrDef(getColor(cell.css('color')), [0, 0, 0]),
                fontSize: valOrDef(cell.css('font-size'), '12'),
                fontWeight: valOrDef(cell.css('font-weight'), 'normal'),
                verticalAlign: valOrDef(cell.css('vertical-align'), 'left'),
                horizontalAlign: valOrDef(cell.css('text-align'), 'top'),
                width: cell.css('width'),
                height: cell.css('height'),
                rowspan: parseInt(valOrDef(cell.attr('rowspan'), '1')),
                colspan: parseInt(valOrDef(cell.attr('colspan'), '1')),
                border: {
                    top: cell.css('border-to-style') || border,
                    right: cell.css('border-right-style') || border,
                    bottom: cell.css('border-bottom-style') || border,
                    left:cell.css('border-left-style') || border,
                    width: cell.css('border-width') || border
                }
            });
        }
    }

    return tableOut;
};

module.exports = function(options, html, id, cb) {
    var outputHTML = juice(html, { 
        xmlMode: true, preserveImportant: true, 
        inlinePseudoElements: true, insertPreservedExtraCss: true,  
        applyWidthAttributes: true, applyStyleTags: true, 
        applyHeightAttributes: true, applyAttributesTableElements: true,
        preserveFontFaces: true, preserveMediaQueries: true
    });
    
    var $doc = cheerio(outputHTML);
    
    var evalOut = null;
    try {   
        evalOut = evaluate($doc);
    }
    catch(e){
        return cb(e);
    }

    return cb(null, evalOut);
};
