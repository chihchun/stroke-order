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

        draw: function () {
            this.loadWord();
        },

        loadWord: function () {
             var p = this;
             // create a new svg
             $('#svgbasics').svg();
             // get the svg 
             this.svg = $('#svgbasics').svg('get');
             $.ajax({
                type: "GET",
                url: "B3B0.xml",
                // url: "C1A6.xml",
                dataType: "xml",
		success: function(xml) {
                    p._xml = $(xml);
                    $(xml).find('Stroke').each(function() {
                        p.drawStroke(this);
                    });
		}
	     });

        },

        drawStroke: function (xmlTag) {
                var handler = this;
                var svg = this.svg;
                var path = svg.createPath(); 
                var mask = svg.mask(null, 'myMask', 0, 0, 200, 200, {maskUnits: 'userSpaceOnUse'});
                this.group = this.svg.group();

                $(xmlTag).find('Outline').each ( function () {
                        path = svg.createPath();
                        $(this).children().each( function () {
                            handler._drawOutline(this, path);
                        });
                        svg.path(handler.group, path, 
                            {fill: 'none', stroke: '#D90000', strokeWidth: 1});
                });

/*
                svg.linearGradient(handler.group,
                        'gradient', 
                        [[0, 'black'], [1, 'black']], 0, 0, 200, 200, 
                        {gradientUnits: 'userSpaceOnUse'});
                // gradient
*/
                path = svg.createPath();
                var loc =  $(xmlTag).find('Track > MoveTo').get(0);
                path = path.move($(loc).attr('x'), $(loc).attr('y'), false);
                $(xmlTag).find('Track').children().each ( function () {
                        var xmlTag = this;
                        if(this.tagName == 'MoveTo') {
                               path = path.line($(xmlTag).attr('x'), $(xmlTag).attr('y'), false);
                        }
                });
                svg.path(handler.group, path, 
                        {fill: 'black', stroke: '#000000', strokeWidth: 10});
                this.group.setAttribute("transform", "scale(0.1, 0.1)");
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
