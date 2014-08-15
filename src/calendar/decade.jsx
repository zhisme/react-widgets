var React = require('react/addons')
  , cx    = React.addons.classSet
  , dates = require('../util/dates')
  , chunk = require('../util/chunk')
  , directions = require('../util/constants').directions
  , _ = require('lodash')

var opposite = {
  LEFT: directions.RIGHT,
  RIGHT: directions.LEFT
};


module.exports = React.createClass({

  displayName: 'DecadeView',

  mixins: [
    require('../mixins/PureRenderMixin'),
    require('../mixins/RtlChildContextMixin'),
    require('../mixins/DateFocusMixin')('decade', 'year')
  ],

  propTypes: {
    value:        React.PropTypes.instanceOf(Date),
    min:          React.PropTypes.instanceOf(Date),
    max:          React.PropTypes.instanceOf(Date),
    onChange:     React.PropTypes.func.isRequired
  },

  render: function(){
    var years = getDecadeYears(this.props.value)
      , rows  = chunk(years, 4)
      , id = this.props.id && this.props.id + '_selected_option';

    this.selectedId = id

    return (
      <table 
        tabIndex='-1'
        role='grid' 
        className='rw-calendar-grid rw-nav-view' 
        aria-activedescendant={selectedId}
        aria-labeledby={this.props['aria-labeledby']}>

        <tbody onKeyUp={this._keyUp}>
          { _.map(rows, this._row)}
        </tbody>
      </table>
    )
  },

  _row: function(row, i){
    var id = this.selectedId
  
    return (
      <tr key={'row_' + i}>
      {_.map(row, date => {
        var focused = dates.eq(date,  this.state.focusedDate,  'year')

        return !dates.inRange(date, this.props.min, this.props.max, 'year') 
          ? <td className='rw-empty-cell'>&nbsp;</td>
          : (<td>
              <btn onClick={_.partial(this.props.onChange, date)}
                id={ focused ? id : undefined }
                className={cx({ 
                  'rw-off-range':   !inDecade(date, this.props.value),
                  'rw-state-focus': focused
                })}>
                { dates.format(date, dates.formats.YEAR) }
              </btn>
            </td>)
      })}
    </tr>)
  },

  move: function(date, direction){
    if ( this.isRtl() && opposite[direction])
      direction =  opposite[direction]

    if ( direction === directions.LEFT)
      date = dates.subtract(date, 1, 'year')

    else if ( direction === directions.RIGHT)
      date = dates.add(date, 1, 'year')

    else if ( direction === directions.UP)
      date = dates.subtract(date, 4, 'year')

    else if ( direction === directions.DOWN)
      date = dates.add(date, 4, 'year')

    return date
  }

});

function inDecade(date, start){
  return dates.gte(date, dates.startOf(start, 'decade'), 'year') 
      && dates.lte(date, dates.endOf(start,'decade'),  'year')
}

function getDecadeYears(date){
  var date = dates.add(dates.startOf(date, 'decade'), -2, 'year')

  return _.map(_.range(12), function(i){
    return date = dates.add(date, 1, 'year')
  })
}

var btn = require('../common/btn.jsx')