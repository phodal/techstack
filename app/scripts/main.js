require.config({
  baseUrl: 'app',
  paths: {
    jquery: 'lib/jquery-2.1.3',
    json: 'lib/json',
    d3: 'lib/d3.min',
    text: 'lib/text'
  },
  'shim': {}
});

require(['scripts/render', 'json!data/data.json', 'jquery'], function (render, data, $) {
  function entry(quadrant, position, direction) {
    return {
      quadrant: quadrant,
      // position is within the total of horizons.
      position: position,
      // angles are fractions of pi/2 (ie of a quadrant)
      position_angle: 0.5,
      // the learning end point with the total of horizons.
      direction: direction,
      // angles are fractions of pi/2 (ie of a quadrant)
      direction_angle: 0.5
    };
  }

  function parse(data) {
    var results = [];
    for (var quadrant in data) {
      var convertFractions = function (trend) {
        return 1 - (trend - 1) / 5
      };
      $.each(data[quadrant], function (index, skill) {
        results.push({
          name: skill.name,
          important: skill.important,
          usage: skill.usage,
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
