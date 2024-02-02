import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';

interface OrderItem {
  total: number;
  price: number;
  count: number;
  amount: number;
}

export const OrderBook: React.FC = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'wss://api-pub.bitfinex.com/ws/2'
  );

  const buyRef = useRef<number[][]>([]);
  const sellRef = useRef<number[][]>([]);

  const buyData = useRef<OrderItem[]>([]);
  const sellData = useRef<OrderItem[]>([]);

  const msg = JSON.stringify({
    event: 'subscribe',
    channel: 'book',
    symbol: 'tBTCUSD',
    freq: 'F1',
  });

  useEffect(() => {
    sendMessage(msg);
  }, [sendMessage, msg]);

  useEffect(() => {
    try {
      const message = JSON.parse(lastMessage?.data || '');
      if (message[1] !== 'hb') {
        if (message[1].length > 5) {
          buyRef.current = message[1].filter((el: number[]) => el[2] > 0);
          sellRef.current = message[1].filter((el: number[]) => el[2] < 0);
        } else {
          if (message[1][1] !== 0) {
            if (message[1][2] > 0) {
              buyRef.current = [
                ...buyRef.current.filter(
                  (el: number[]) => el[0] !== message[1][0]
                ),
                message[1],
              ];
            } else {
              sellRef.current = [
                ...sellRef.current.filter(
                  (el: number[]) => el[0] !== message[1][0]
                ),
                message[1],
              ];
            }
          } else {
            if (message[1][2] > 0) {
              buyRef.current = [
                ...buyRef.current.filter(
                  (el: number[]) => el[0] !== message[1][0]
                ),
              ];
            } else {
              sellRef.current = [
                ...sellRef.current.filter(
                  (el: number[]) => el[0] !== message[1][0]
                ),
              ];
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (buyRef.current.length === 25) {
      buyData.current = [
        ...buyRef.current
          .sort((a, b) => b[0] - a[0])
          .reduce(
            (
              accumulator: OrderItem[],
              currentValue: number[],
              index: number
            ) => {
              const sum =
                currentValue[2] +
                (index > 0 ? accumulator[index - 1].total : 0);
              accumulator.push({
                total: sum,
                price: currentValue[0],
                count: currentValue[1],
                amount: currentValue[2],
              });
              return accumulator;
            },
            []
          ),
      ];
    }
  }, [buyRef.current.length]);

  useEffect(() => {
    if (sellRef.current.length === 25) {
      sellData.current = [
        ...sellRef.current
          .sort((a, b) => b[0] - a[0])
          .reduce(
            (
              accumulator: OrderItem[],
              currentValue: number[],
              index: number
            ) => {
              const sum =
                Math.abs(currentValue[2]) +
                (index > 0 ? accumulator[index - 1].total : 0);
              accumulator.push({
                total: sum,
                price: currentValue[0],
                count: currentValue[1],
                amount: Math.abs(currentValue[2]),
              });
              return accumulator;
            },
            []
          ),
      ];
    }
  }, [sellRef.current.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Book</Text>
      {buyData.current.length && sellData.current.length ? (
        <>
          <FlatList
            ListHeaderComponent={() => (
              <View style={styles.listHeader}>
                <Text style={styles.listData}>Count</Text>
                <Text style={styles.listData}>Amount</Text>
                <Text style={styles.listData}>Total</Text>
                <Text style={styles.listData}>Price</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listData}>{item.count}</Text>
                <Text style={styles.listData}>{item.amount.toFixed(4)}</Text>
                <Text style={styles.listData}>{item.total.toFixed(4)}</Text>
                <Text style={styles.listData}>{item.price}</Text>
              </View>
            )}
            keyExtractor={item => item.price.toString()}
            data={buyData.current}
            style={{ backgroundColor: '#19484c' }}
            scrollEnabled={false}
          />
          <FlatList
            ListHeaderComponent={() => (
              <View style={styles.listHeader}>
                <Text style={styles.listData}>Count</Text>
                <Text style={styles.listData}>Amount</Text>
                <Text style={styles.listData}>Total</Text>
                <Text style={styles.listData}>Price</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listData}>{item.count}</Text>
                <Text style={styles.listData}>{item.amount.toFixed(4)}</Text>
                <Text style={styles.listData}>{item.total.toFixed(4)}</Text>
                <Text style={styles.listData}>{item.price}</Text>
              </View>
            )}
            keyExtractor={item => item.price.toString()}
            data={sellData.current}
            style={{ backgroundColor: '#693741' }}
            scrollEnabled={false}
          />
        </>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  heading: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#19484c',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listData: {
    width: '25%',
    textAlign: 'center',
    color: 'white',
  },
});
