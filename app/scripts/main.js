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

require(['scripts/render', 'json!data/data.json'], function (render, data) {
  function entry(start, end, quadrant, position, position_angle, direction, direction_angle) {
    return {
      // start date that this entry applies for
      start: start,
      // end date for the entry
      end: end,
      // the quadrant label
      quadrant: quadrant,
      // position is within the total of horizons.
      position: position,
      // angles are fractions of pi/2 (ie of a quadrant)
      position_angle: position_angle,
      // the learning end point with the total of horizons.
      direction: direction,
      // angles are fractions of pi/2 (ie of a quadrant)
      direction_angle: direction_angle
    };
  }

  render.renderPage('#radar', {
    horizons: ['discover', 'assess', 'learn', 'use'],
    quadrants: ['languages', 'frameworks', 'tools', 'others'],
    height: 768,
    width: 768,
    data: [
      {
        name: 'd3',
        history: [
          entry(new Date(2013,1,29),new Date(2013,9,29),'frameworks', 0.8, 0.5, 0.6, 0.5),
          entry(new Date(2013,9,29),null,'frameworks', 0.6, 0.5, 0.2, 0.5)
        ]
      },
      {
        name: 'java',
        history: [
          entry(new Date(2013,1,29),new Date(2013,9,29),'others', 0.3, 0.5, 0.6, 0.5),
          entry(new Date(2013,9,29),null,'others', 0.25, 0.5, 0.5, 0.5)
        ]
      }
    ]
  });
});
