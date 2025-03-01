import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
}

const ProductListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Product[]>('http://192.168.100.10:3000/products');
      response.data.forEach(product => {
        console.log('Product image URL:', product.image);
      });
      setOriginalProducts(response.data);
      setDisplayedProducts(response.data);
    } catch (error) {
      let message = 'Không thể tải danh sách sản phẩm';
      if (error instanceof AxiosError) {
        console.error('Axios Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
        });
        if (error.code === 'ECONNREFUSED') message = 'Không thể kết nối đến server';
        else if (error.response?.status === 404) message = 'Không tìm thấy dữ liệu';
      } else {
        console.error('Unknown Error:', error);
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const deleteProduct = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.100.10:3000/products/${id}`);
              const updatedProducts = originalProducts.filter((p) => p.id !== id);
              setOriginalProducts(updatedProducts);
              setDisplayedProducts(updatedProducts);
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const sortProducts = () => {
    const sorted = [...displayedProducts].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setDisplayedProducts(sorted);
    setSortAsc(!sortAsc);
  };

  const searchProducts = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setDisplayedProducts([...originalProducts]);
      return;
    }
    const filtered = originalProducts.filter((product) =>
      removeVietnameseTones(product.name.toLowerCase()).includes(
        removeVietnameseTones(text.toLowerCase())
      )
    );
    setDisplayedProducts(filtered);
  };

  const removeVietnameseTones = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChangeText={searchProducts}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={sortProducts}>
          <Text style={styles.buttonText}>Sắp xếp {sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('form', { mode: 'add' })}
        >
          <Text style={styles.buttonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name} - {item.price}đ</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('Navigating to detail with product:', item);
                    navigation.navigate('detail', { product: item });
                  }}
                >
                  <Text style={styles.actionText}>Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    console.log('Navigating to form with mode: edit, product:', item);
                    navigation.navigate('form', { mode: 'edit', product: item });
                  }}
                >
                  <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                  <Text style={styles.actionText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có sản phẩm nào</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default ProductListScreen;