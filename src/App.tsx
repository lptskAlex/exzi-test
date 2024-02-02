import { SVGRenderer } from '@wuba/react-native-echarts';

import { CandlestickChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { ChartComponent } from './components/Chart';
import { SafeAreaView, ScrollView } from 'react-native';
import { OrderBook } from './components/OrderBook';
import * as echarts from 'echarts/core';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  DataZoomComponent,
  CandlestickChart,
]);

export default function App() {
  return (
    <SafeAreaView>
      <ScrollView>
        <ChartComponent />
        <OrderBook />
      </ScrollView>
    </SafeAreaView>
  );
}
