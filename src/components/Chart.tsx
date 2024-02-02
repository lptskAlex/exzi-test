import { SVGRenderer, SvgChart } from '@wuba/react-native-echarts';
import { ECharts, EChartsOption } from 'echarts';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import { format } from 'date-fns';
import {
  DataZoomComponent,
  GridComponent,
  TitleComponent,
} from 'echarts/components';
import { CandlestickChart } from 'echarts/charts';

echarts.use([
  TitleComponent,
  GridComponent,
  SVGRenderer,
  DataZoomComponent,
  CandlestickChart,
]);

export const ChartComponent = () => {
  const chartRef = useRef<ECharts | null>(null);
  const [chart, setChart] = useState<any>();

  const upColor = '#ec0000';
  const upBorderColor = '#8A0000';
  const downColor = '#00da3c';
  const downBorderColor = '#008F28';

  const [data, setData] = useState<Array<any>>([]);
  const data0 = splitData();

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'wss://api-pub.bitfinex.com/ws/2'
  );

  let msg = JSON.stringify({
    event: 'subscribe',
    channel: 'candles',
    key: 'trade:1m:tBTCUSD',
  });

  useEffect(() => {
    sendMessage(msg);
  }, []);

  useEffect(() => {
    try {
      const message = JSON.parse(lastMessage.data);
      if (message.length && message[1] !== 'hb') {
        if (message[1].length > 6) {
          setData([...data, ...message[1]]);
        } else {
          setData(prevData => [
            ...prevData.filter(el => el[0] !== message[1][0]).slice(1),
            message[1],
          ]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [lastMessage]);

  function splitData() {
    const tmp = [...new Set(data)].sort((a, b) => a[0] - b[0]);
    const categoryData = tmp.map(el =>
      format(new Date(el[0]), 'yyyy-MM-dd HH:mm')
    );
    const values = tmp.map(el => el.slice(1, 5));
    return {
      categoryData: categoryData,
      values: values,
    };
  }

  const option: EChartsOption = {
    title: {
      text: 'BTC/USD',
      left: 0,
    },
    dataZoom: [
      {
        show: false,
        start: 50,
        end: 100,
      },
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
    ],

    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: data0.categoryData,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true,
      },
    },
    series: [
      {
        name: 'Chart',
        type: 'candlestick',
        data: data0.values,
        barMinWidth: 5,
        itemStyle: {
          color0: upColor,
          color: downColor,
          borderColor0: upBorderColor,
          borderColor: downBorderColor,
        },
        markPoint: {
          data: [
            {
              name: 'Mark',
              coord: ['2013/5/31', 2300],
              value: 2300,
              itemStyle: {
                color: 'rgb(41,60,85)',
              },
            },
            {
              name: 'highest value',
              type: 'max',
              valueDim: 'highest',
            },
            {
              name: 'lowest value',
              type: 'min',
              valueDim: 'lowest',
            },
            {
              name: 'average value on close',
              type: 'average',
              valueDim: 'close',
            },
          ],
        },
      },
    ],
  };

  useEffect(() => {
    if (chartRef.current) {
      // @ts-ignore
      if (!chart) {
        setChart(
          echarts.init(chartRef.current, 'dark', {
            renderer: 'svg',
            width: 400,

            height: 400,
          })
        );
      }

      chart?.setOption(option, true);
    }
  }, [option]);

  return <SvgChart ref={chartRef} />;
};
