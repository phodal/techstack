require.config({
  baseUrl: 'app',
  paths: {
    jquery: 'lib/jquery-2.1.3',
    json: 'lib/json',
    d3: 'lib/d3.min',
    lettuce: 'lib/lettuce',
    text: 'lib/text',
    'jquery.tooltipster': 'lib/jquery.tooltipster.min'
  },
  'shim': {
    'jquery.tooltipster': {
      deps: ['jquery']
    }
  }
});

require(['scripts/render', 'json!data/data.json', 'jquery'], function (render, data, $) {
  function parse(data) {
    var results = [];
    for (var quadrant in data) {
      var convertFractions = function (trend) {
        return 1 - (trend - 1) / 5
      };

      function entry(quadrant, position, direction) {
        var randArray = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
        var angle = randArray[Math.floor(Math.random() * randArray.length)];
        return {
          quadrant: quadrant,
          // position is within the total of horizons.
          position: position,
          // angles are fractions of pi/2 (ie of a quadrant)
          position_angle: angle,
          // the learning end point with the total of horizons.
          direction: direction,
          // angles are fractions of pi/2 (ie of a quadrant)
          direction_angle: angle
        };
      }

      $.each(data[quadrant], function (index, skill) {
        results.push({
          name: skill.name,
          important: skill.important,
          usage: skill.usage,
          description: skill.description,
          trend: entry(quadrant, convertFractions(skill.current), convertFractions(skill.future))
        });
      })
    }
    return results;
  }

  render.renderPage('#radar', {
    horizons: ['discover', 'assess', 'learn', 'use'],
    quadrants: ['languages', 'frameworks', 'tools', 'others'],
    height: 768,
    width: 768,
    data: parse(data)
  });
});
