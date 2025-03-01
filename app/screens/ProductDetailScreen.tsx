import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
}

interface ProductDetailScreenProps {
  route: {
    params: {
      product: Product;
    };
  };
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route }) => {
  const { product } = route.params;
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const [errorLoadingImage, setErrorLoadingImage] = useState<boolean>(false);

  const handleImageLoad = () => {
    setLoadingImage(false);
    setErrorLoadingImage(false);
  };

  const handleImageError = () => {
    setLoadingImage(false);
    setErrorLoadingImage(true);
    console.log('Loading image from:', product.image);
  };
  const checkImage = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Image check error:', error);
      return false;
    }
  };
  return (
    <View style={styles.container}>
      {loadingImage && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      {errorLoadingImage ? (
        <Text style={styles.errorText}>Không thể tải hình ảnh</Text>
      ) : (
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="contain"
        />
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text>Giá: {product.price}đ</Text>
      <Text>Loại: {product.type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  image: { width: 200, height: 200, marginBottom: 20 },
  loading: { position: 'absolute', top: '30%' },
  errorText: { fontSize: 16, color: '#666', marginBottom: 20 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

export default ProductDetailScreen;