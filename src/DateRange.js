import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import parseInput from './utils/parseInput.js';
import Calendar from './Calendar.js';
import PredefinedRanges from './PredefinedRanges.js';
import getTheme, { defaultClasses } from './styles.js';

class DateRange extends Component {

  constructor(props, context) {
    super(props, context);

    const { format, linkedCalendars, theme, pickSingleDate } = props;

    const startDate = parseInput(props.startDate, format);
    const endDate   = pickSingleDate ? parseInput(props.startDate, format) : parseInput(props.endDate, format);

    this.state = {
      range     : { startDate, endDate },
      link      : linkedCalendars && endDate,
    }

    this.step = 0;
    this.styles = getTheme(theme);
  }

  componentDidMount() {
    const { onInit } = this.props;
    onInit && onInit(this.state.range);
  }

  orderRange(range) {
    const { startDate, endDate } = range;
    const swap = startDate.isAfter(endDate);

    if (!swap) return range;

    return {
      startDate : endDate,
      endDate   : startDate
    }
  }

  setRange(range, source) {
    const { onChange, pickSingleDate } = this.props
    range = this.orderRange(range);

    this.setState({ range });

    if (pickSingleDate) {
      onChange && onChange(range.startDate, source)
    } else {
      onChange && onChange(range, source);
    }
  }

  changeYear(e){
    const { link } = this.state;

    this.setState({
        link : link.clone().isoWeekYear(e.target.value),
    });
  }

  handleSelect(date, source) {
    if (this.props.pickSingleDate) {
      return this.setRange({
        startDate: date,
        endDate: date,
      }, source)
    }

    if (date.startDate && date.endDate) {
      this.step = 0;
      return this.setRange(date, source);
    }

    const { startDate, endDate } = this.state.range;

    const range = {
      startDate : startDate,
      endDate   : endDate
    };

    switch (this.step) {
      case 0:
        range['startDate'] = date;
        range['endDate'] = date;
        this.step = 1;
        break;

      case 1:
        range['endDate'] = date;
        this.step = 0;
        break;

    }

    this.setRange(range, source);
  }

  handleLinkChange(direction) {
    const { link } = this.state;

    this.setState({
      link : link.clone().add(direction, 'months')
    });
  }

  componentWillReceiveProps(newProps) {
    // Whenever date props changes, update state with parsed variant
    if (newProps.startDate || newProps.endDate) {
      const format       = newProps.format || this.props.format;
      const startDate    = newProps.startDate   && parseInput(newProps.startDate, format);
      const endDate      = newProps.endDate     && parseInput(newProps.endDate, format);
      const oldStartDate = this.props.startDate && parseInput(this.props.startDate, format);
      const oldEndDate   = this.props.endDate   && parseInput(this.props.endDate, format);

      if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
        this.setRange({
          startDate: startDate || oldStartDate,
          endDate: endDate || oldEndDate
        });
      }
    }
  }

  render() {
    const { ranges, format, linkedCalendars, style, calendars, firstDayOfWeek, minDate, maxDate, classNames, onlyClasses, pickSingleDate, showIndex, yearRange, selectYear } = this.props;
    const { range, link } = this.state;
    const { styles } = this;
    const classes = { ...defaultClasses, ...classNames };

    return (
      <div style={onlyClasses ? undefined : { ...styles['DateRange'], ...style }} className={classes.dateRange}>
        { ranges && (
          <PredefinedRanges
            format={ format }
            ranges={ ranges }
            range={ range }
            theme={ styles }
            onSelect={this.handleSelect.bind(this)}
            onlyClasses={ onlyClasses }
            classNames={ classes } />
        )}

        {()=>{
          const _calendars = [...Array(calendars).keys()].map( i => {
            const offset = i - showIndex
            return <Calendar
              key={i}
              index={i}
              offset={ offset }
              changeYear={ this.changeYear.bind(this) }
              link={ linkedCalendars && link }
              calendarEnd = {calendars - 1}
              linkCB={ this.handleLinkChange.bind(this) }
              pickSingleDate={ pickSingleDate }
              yearRange = { yearRange }
              selectYear = { selectYear }
              range={ range }
              format={ format }
              firstDayOfWeek={ firstDayOfWeek }
              theme={ styles }
              minDate={ minDate }
              maxDate={ maxDate }
              onlyClasses={ onlyClasses }
              classNames={ classes }
              onChange={ this.handleSelect.bind(this) }  />
          })
          return _calendars;
        }()}
      </div>
    );
  }
}

DateRange.defaultProps = {
  pickSingleDate  : false,
  linkedCalendars : false,
  selectYear      : false,
  theme           : {},
  format          : 'DD/MM/YYYY',
  calendars       : 2,
  onlyClasses     : false,
  showIndex       : 0,
  classNames      : {}
}

DateRange.propTypes = {
  selectYear      : PropTypes.bool,
  pickSingleDate  : PropTypes.bool,
  showIndex       : PropTypes.number,
  format          : PropTypes.string,
  firstDayOfWeek  : PropTypes.number,
  calendars       : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate       : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  endDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  minDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  dateLimit       : PropTypes.func,
  ranges          : PropTypes.object,
  linkedCalendars : PropTypes.bool,
  theme           : PropTypes.object,
  onInit          : PropTypes.func,
  onChange        : PropTypes.func,
  onlyClasses     : PropTypes.bool,
  classNames      : PropTypes.object
}

export default DateRange;
