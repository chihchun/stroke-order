/*
 * Authors:
 * Rex Tsai (chihchun@kalug.linux.org.tw)
 * Thinker Li (thinker@branda.to)
 *
 * Licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt)
*/

;(function($) { // Hide scope, no $ conflict

function StrokeHandler (root){
   this._root = root; 
   this._xml;
   this.svg;
}

$.extend(StrokeHandler.prototype, {
        _drawOutline: function(xmlTag, path) {
            if(xmlTag.tagName == 'MoveTo') {
                path = path.move($(xmlTag).attr('x'), $(xmlTag).attr('y'),false);
            }

            if(xmlTag.tagName == 'QuadTo') {
                path = path.curveQ(
                    $(xmlTag).attr('x1'), 
                    $(xmlTag).attr('y1'),
                    $(xmlTag).attr('x2'),
                    $(xmlTag).attr('y2'), false);
            }

            if(xmlTag.tagName == 'LineTo') {
                path = path.line($(xmlTag).attr('x'), 
                    $(xmlTag).attr('y'));
            }
        },

        drawStroke: function () {
                var path = this.svg.createPath(); 
                var svg = this.svg;
                var p = this;
                this._xml.find('Outline').each ( function () {
                        path = svg.createPath();
                        $(this).children().each( function () {
                            p._drawOutline(this, path);
                            });
                        svg.path(p.group, path, 
                            {fill: 'none', stroke: '#D90000', strokeWidth: 10});
                });
        },

        loadWord: function () {
             var p = this;
             // create a new svg
             $('#svgbasics').svg();
             // get the svg 
             this.svg = $('#svgbasics').svg('get');
             this.group = this.svg.group(null);
             $.ajax({
                type: "GET",
                url: "B3B0.xml",
                dataType: "xml",
		success: function(xml) {
                    p._xml = $(xml);
                    $(xml).find('Stroke').each(function() {
                        p.drawStroke();
                    });
		}
	     });

             $('g').get(0).setAttribute("transform", "scale(0.1, 0.1)");
        },

        draw: function () {
            this.loadWord();
        }
});

$.fn.stroke = function(options) {
    return new StrokeHandler(this.get(0), options || {});
    /*
    this.each(function() {
            alert(this);
            return new StrokeHandler(this, options || {});
            }
    )
    */
};
})(jQuery);
