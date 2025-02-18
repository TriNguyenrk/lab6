import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import { Button, Card, Divider } from "react-native-paper";

type User = {
  id: string;
  name: string;
  avatar: string;
  dod: string;
};

const Home = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userDod, setUserDod] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<User[]>(
        "https://67b00314dffcd88a6788210e.mockapi.io/Lab6"
      );
      setUsers(response.data);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserAvatar(user.avatar);
      setUserDod(user.dod);
    } else {
      setEditingUser(null);
      setUserName("");
      setUserAvatar("");
      setUserDod("");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (userName && userAvatar && userDod) {
      if (editingUser) {
        // Cập nhật người dùng
        try {
          await axios.put(
            `https://67b00314dffcd88a6788210e.mockapi.io/Lab6/${editingUser.id}`,
            { name: userName, avatar: userAvatar, dod: userDod }
          );
          setUsers(
            users.map((user) =>
              user.id === editingUser.id
                ? { ...user, name: userName, avatar: userAvatar, dod: userDod }
                : user
            )
          );
        } catch (error) {
          console.error("Error updating user:", error);
        }
      } else {
        // Thêm người dùng mới vào MockAPI
        try {
          const newUser = {
            id: Math.random().toString(),
            name: userName,
            avatar: userAvatar,
            dod: userDod,
          };
          const response = await axios.post(
            "https://67b00314dffcd88a6788210e.mockapi.io/Lab6",
            newUser
          );
          setUsers([...users, response.data]); // Cập nhật danh sách người dùng
        } catch (error) {
          console.error("Error adding user:", error);
        }
      }
      setModalVisible(false);
    } else {
      alert("Vui lòng điền đầy đủ thông tin.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa người dùng này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(
              `https://67b00314dffcd88a6788210e.mockapi.io/Lab6/${id}`
            );
            setUsers(users.filter((user) => user.id !== id));
          } catch (error) {
            console.error("Error deleting user:", error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người dùng</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => handleOpenDialog()}>
        <Text style={styles.addButtonText}>+ Thêm Người Dùng</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <Card.Content>
              <View style={styles.userInfo}>
                <TouchableOpacity onPress={() => setSelectedImage(item.avatar)}>
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                </TouchableOpacity>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.dob}>Ngày sinh: {item.dod}</Text>
                </View>
              </View>
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.actionButtons}>
                <Button mode="contained" onPress={() => handleOpenDialog(item)}>
                  ✏️ Sửa
                </Button>
                <Button mode="contained" color="red" onPress={() => handleDelete(item.id)}>
                  🗑️ Xóa
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      {/* Modal hiển thị ảnh lớn */}
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.modalClose}>
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.largeImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Modal Thêm/Sửa người dùng */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingUser ? "Sửa Người Dùng" : "Thêm Người Dùng"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Tên người dùng"
              value={userName}
              onChangeText={setUserName}
            />
            <TextInput
              style={styles.input}
              placeholder="Ảnh đại diện (URL)"
              value={userAvatar}
              onChangeText={setUserAvatar}
            />
            <TextInput
              style={styles.input}
              placeholder="Ngày sinh (YYYY-MM-DD)"
              value={userDod}
              onChangeText={setUserDod}
            />

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              Lưu
            </Button>

            <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              Hủy
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userCard: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dob: {
    fontSize: 16,
    color: "gray",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  largeImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "#007bff",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: "#007bff",
    width: "100%",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    width: "100%",
    padding: 12,
    borderRadius: 5,
    borderColor: "#007bff",
    borderWidth: 1,
  },
});

export default Home;
