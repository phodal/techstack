define(['d3'], function (d3) {
  'use strict';
  function renderPage(id, data) {
    function identity(i) {
      return i;
    }

    var width = data.width || 800, height = data.height || 600;
    var cx = width / 2, cy = height / 2;
    var horizonWidth = 0.95 * (width > height ? height : width) / 2;
    var quad_angle = 2 * Math.PI / data.quadrants.length;
    var color_scale = d3.scale.category10();

    var svg = d3.select(id).append('svg')
      .attr("width", width)
      .attr("height", height);

    function add_quadrants(base) {
      var quadrants = base
        .append('g')
        .attr('class', 'quadrants');

      function quadrant_class(d) {
        return 'quadrant quadarant-' + d.name.toLowerCase().replace(/ /, '-');
      }

      quadrants.selectAll('line.quadrant')
        .data(data.quadrants, identity)
        .enter().append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', function (d, i) {
          return (Math.cos(quad_angle * i) * horizonWidth);
        })
        .attr('y2', function (d, i) {
          return (Math.sin(quad_angle * i) * horizonWidth);
        })
        .attr('stroke', function (d, i) {
          return color_scale(i);
        });

      var arc_function = d3.svg.arc()
        .outerRadius(function (d, i) {
          return d.outerRadius * horizonWidth;
        })
        .innerRadius(function (d, i) {
          return d.innerRadius * horizonWidth;
        })
        .startAngle(function (d, i) {
          return d.quadrant * quad_angle + Math.PI / 2;
        })
        .endAngle(function (d, i) {
          return (d.quadrant + 1) * quad_angle + Math.PI / 2;
        });

      var quads = [];
      for (var i = 0, ilen = data.quadrants.length; i < ilen; i++) {
        for (var j = 0, jlen = data.horizons.length; j < jlen; j++) {
          quads.push({
            outerRadius: (j + 1) / jlen,
            innerRadius: j / jlen,
            quadrant: i,
            horizon: j,
            name: data.quadrants[i]
          });
        }
      }
      var text_angle = (360 / data.quadrants.length);

      quadrants.selectAll('text.quadrant')
        .data(quads.filter(function (d) {
          return d.horizon == 0;
        }))
        .enter()
        .append('text')
        .attr('class', 'quadrant')
        .attr('dx', horizonWidth / data.horizons.length)
        .attr('transform', function (d) {
          return 'rotate(' + (d.quadrant * text_angle + text_angle ) + ')'
        })
        .text(function (d) {
          return d.name;
        });

      quadrants.selectAll('path.quadrant')
        .data(quads)
        .enter()
        .append('path')
        .attr('d', arc_function)
        .attr('fill', function (d, i) {
          var rgb = d3.rgb(color_scale(d.quadrant));
          return rgb.brighter(d.horizon / data.horizons.length * 3);
        })
        .attr('class', quadrant_class);
    }

    function draw_radar() {
      var base = svg.append('g')
        .attr('transform', "translate(" + cx + "," + cy + ")");
      add_quadrants(base);
    }

    draw_radar();
  }

  return {
    renderPage: renderPage
  };
});
