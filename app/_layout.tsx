import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductFormScreen from './screens/ProductFormScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
      <Stack.Navigator initialRouteName="ProductList">
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{ title: 'Danh sách sản phẩm' }}
        />
        <Stack.Screen
          name="detail"
          component={ProductDetailScreen}
          options={{ title: 'Chi tiết sản phẩm' }}
        />
        <Stack.Screen
          name="form"
          component={ProductFormScreen}
          options={{ title: 'Form sản phẩm' }}
        />
      </Stack.Navigator>
  );
};

export default App;