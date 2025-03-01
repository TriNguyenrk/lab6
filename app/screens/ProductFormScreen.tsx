import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
}

interface ProductFormScreenProps {
  route: {
    params?: {
      mode: 'add' | 'edit';
      product?: Product;
    };
  };
  navigation: any;
}

const ProductFormScreen: React.FC<ProductFormScreenProps> = ({ route, navigation }) => {
  const { mode, product } = route.params || {};
  const [name, setName] = useState(product?.name || '');
  const [image, setImage] = useState(product?.image || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ValueType | null>(product?.type || null);
  const [loading, setLoading] = useState(false);
  const [items] = useState([
    { label: 'Điện thoại', value: 'Điện thoại' },
    { label: 'Laptop', value: 'Laptop' },
    { label: 'Phụ kiện', value: 'Phụ kiện' },
  ]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên sản phẩm không được để trống');
      return false;
    }
    if (!image.trim() || !image.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)) {
      Alert.alert('Lỗi', 'Link ảnh không hợp lệ (phải là URL hình ảnh)');
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return false;
    }
    if (!type) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại sản phẩm');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const productData = {
      id: mode === 'add' ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : product!.id, // ID độc nhất hơn
      name: name.trim(),
      image: image.trim(),
      price: Number(price),
      type: type as string,
    };

    try {
      if (mode === 'add') {
        await axios.post('http://192.168.100.10:3000/products', productData);
        Alert.alert('Thành công', 'Đã thêm sản phẩm');
      } else {
        await axios.put(`http://192.168.100.10:3000/products/${product!.id}`, productData);
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
      }
      navigation.goBack();
    } catch (error) {
      let message = 'Không thể lưu sản phẩm';
      if (axios.isAxiosError(error)) {
        console.error('API Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
        });
        if (error.code === 'ECONNREFUSED') message = 'Không thể kết nối đến server';
        else if (error.response?.status === 400) message = 'Dữ liệu không hợp lệ';
        else if (error.response?.status === 404) message = 'Không tìm thấy sản phẩm';
      } else {
        console.error('Unknown Error:', error);
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên sản phẩm</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên sản phẩm"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Link ảnh</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập URL hình ảnh (jpg, png, gif)"
        value={image}
        onChangeText={setImage}
      />
      <Text style={styles.label}>Giá bán</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập giá (VD: 1000000)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Loại sản phẩm</Text>
      <DropDownPicker
        open={open}
        value={type}
        items={items}
        setOpen={setOpen}
        setValue={setType}
        placeholder="Chọn loại sản phẩm"
        style={styles.dropdown}
        containerStyle={{ marginBottom: 20 }}
        disabled={loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'add' ? 'Thêm' : 'Cập nhật'} sản phẩm</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    padding: 15,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProductFormScreen;