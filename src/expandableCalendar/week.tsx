import XDate from 'xdate';
import React, {useRef, useMemo, useCallback} from 'react';
import {View, Text} from 'react-native';

import {getPartialWeekDates, getWeekDates, sameMonth} from '../dateutils';
import {parseDate, toMarkingFormat} from '../interface';
import {getState} from '../day-state-manager';
import {extractDayProps} from '../componentUpdater';
import styleConstructor from './style';
import Calendar, {CalendarProps} from '../calendar';
import Day from '../calendar/day/index';


export type WeekProps = CalendarProps & {visible?: boolean};

const Week = (props: WeekProps) => {
  const {theme, current, firstDay, hideExtraDays, markedDates, onDayPress, onDayLongPress, style: propsStyle, numberOfDays = 1, timelineLeftInset, visible = true} = props;
  const style = useRef(styleConstructor(theme));
  const getWeek = useCallback((date?: string) => {
    if (date) {
      return getWeekDates(date, firstDay);
    }
  }, [firstDay]);

  const partialWeekStyle = useMemo(() => {
    return [style.current.partialWeek, {paddingLeft: timelineLeftInset}];
  }, [timelineLeftInset]);

  const dayProps = extractDayProps(props);
  const currXdate = parseDate(current);

  const renderDay = (day: XDate, id: number) => {
    // hide extra days
    if (current && hideExtraDays) {
      if (!sameMonth(day, currXdate)) {
        return <View key={id} style={style.current.emptyDayContainer}/>;
      }
    }

    return (
      <View style={style.current.dayContainer} key={id}>
        <Day
          {...dayProps}
          date={toMarkingFormat(day)}
          state={getState(day, currXdate, props)}
          marking={markedDates?.[toMarkingFormat(day)]}
          onPress={onDayPress}
          onLongPress={onDayLongPress}
        />
      </View>
    );
  };

  const renderWeek = () => {
    const dates = numberOfDays > 1 ? getPartialWeekDates(current, numberOfDays) : getWeek(current);
    const week: JSX.Element[] = [];

    if (dates) {
      const todayIndex = dates?.indexOf(parseDate(new Date())) || -1;
      const sliced = dates.slice(todayIndex, numberOfDays);
      const datesToRender = numberOfDays > 1 && todayIndex > -1 ? sliced : dates;
      datesToRender.forEach((day: XDate | string, id: number) => {
        const d = day instanceof XDate ? day : new XDate(day);
        week.push(renderDay(d, id));
      }, this);
    }

    return week;
  };

  const weekString = useMemo(() => {
    const day = new XDate(current ?? '');
    const firstDayOfWeek = day.toString('dd.MM.yyyy');
    const lastDayOfWeek = day.addDays(numberOfDays > 1 ? numberOfDays : 6).toString('dd.MM.yyyy');
    return `${firstDayOfWeek} - ${lastDayOfWeek}`;
  }, []);

  if(!visible) {
    return (
      <View style={style.current.container}>
        <View style={[style.current.week, numberOfDays > 1 ? partialWeekStyle : undefined, propsStyle]}>
          <Text allowFontScaling={false} adjustsFontSizeToFit>{weekString}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={style.current.container}>
      <View style={[style.current.week, numberOfDays > 1 ? partialWeekStyle : undefined, propsStyle]}>{renderWeek()}</View>
    </View>
  );
};

const shouldUpdate = (_: WeekProps, nextProps: WeekProps) => {
  console.log('aaa', _.visible, nextProps.visible);
  return nextProps.visible ?? true;
};

export default React.memo(Week, shouldUpdate);

Week.displayName = 'Week';
Week.propTypes = {
  ...Calendar.propTypes
};
