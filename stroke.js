/*
 * Authors:
 * Rex Tsai (chihchun@kalug.linux.org.tw)
 * Thinker Li (thinker@branda.to)
 *
 * Licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt)
*/

;(function($) { // Hide scope, no $ conflict

function StrokeHandler (root) {
   this._root = root; 
   this._xml;
   this.svg;
}

$.extend(StrokeHandler.prototype, {

        draw: function () {
            this.loadWord();
        },

        loadWord: function () {
             var handler = this;
             // create a new svg
             $('#svgbasics').svg();
             // get the svg 
             this.svg = $('#svgbasics').svg('get');
             this.mask = this.svg.mask(null, 'WordMask', 0, 0, 2000, 2000, {maskUnits: 'userSpaceOnUse'});

             $.ajax({
                type: "GET",
                url: "B3B0.xml",
                // url: "C1A6.xml",
                dataType: "xml",
		success: function(xml) {
                    handler._xml = $(xml);
                    $(xml).find('Stroke').each(function() {
                        handler.drawStroke(this);
                    });
		}
	     });

             // this.svg.rect(null, 0, 0, 200, 200, 0, 0, {fill: 'yellow', stroke: 'navy', strokeWidth: 0, mask: "url(#WordMask)"});
             // this.svg.circle(null, 410, 476, 100, {fill: 'yellow', stroke: 'blue', strokeWidth: 1, mask: "url(#WordMask)", transform: "scale(0.1)"});
        },

        drawStroke: function (xmlTag) {
                var handler = this;
                var svg = this.svg;
                var path = svg.createPath(); 
                this.group = this.svg.group(handler.mask);

                // outline
                $(xmlTag).find('Outline').each ( function () {
                        path = svg.createPath();
                        $(this).children().each( function () {
                            handler._drawOutline(this, path);
                        });
                        svg.path(handler.group, path, {fill: 'white', stroke: '#D90000', strokeWidth: 1});
                });


                // tracks
                this.group = this.svg.group();
                this.group.setAttribute("transform", "scale(0.1, 0.1)");
                path = svg.createPath();
                var loc =  $(xmlTag).find('Track > MoveTo').get(0);
                path = path.move($(loc).attr('x'), $(loc).attr('y'), false);
                $(xmlTag).find('Track').children().each ( function () {
                        var xmlTag = this;
                        if(this.tagName == 'MoveTo') {
                            path = path.line($(xmlTag).attr('x'), $(xmlTag).attr('y'), false);
                            svg.circle($(xmlTag).attr('x'), $(xmlTag).attr('y'), 100, {fill: 'yellow', stroke: 'blue', strokeWidth: 0, mask: "url(#WordMask)", transform: "scale(0.1)"});
                        }
                });
                svg.path(handler.group, path, {fill: 'red', stroke: '#000000', strokeWidth: 10, mask: "url(#WordMask)"});
        },

        _drawOutline: function(xmlTag, path) {
            if(xmlTag.tagName == 'MoveTo') {
                path = path.move($(xmlTag).attr('x'), $(xmlTag).attr('y'),false);
            }

            if(xmlTag.tagName == 'QuadTo') {
                path = path.curveQ(
                    $(xmlTag).attr('x1'), 
                    $(xmlTag).attr('y1'),
                    $(xmlTag).attr('x2'),
                    $(xmlTag).attr('y2'), 
                    false);
            }

            if(xmlTag.tagName == 'LineTo') {
                path = path.line(
                    $(xmlTag).attr('x'), 
                    $(xmlTag).attr('y')
                    );
            }

            if(xmlTag.tagName == 'CubicTo') {
                path = path.curveQ(
                        $(xmlTag).attr('x1'), 
                        $(xmlTag).attr('y1'),
                        $(xmlTag).attr('x2'),
                        $(xmlTag).attr('y2'), 
                        false);
                path = path.curveQ(
                        $(xmlTag).attr('x2'), 
                        $(xmlTag).attr('y2'),
                        $(xmlTag).attr('x3'),
                        $(xmlTag).attr('y3'), 
                        false);
            }
        },

});

$.fn.stroke = function(options) {
    return new StrokeHandler(this.get(0), options || {});
};

})(jQuery);
