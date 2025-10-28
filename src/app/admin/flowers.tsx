import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../../api/apiClient";

interface Flower {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: number;
  description?: string;
  imageUrl?: string;
}

// ... import và interface Flower giữ nguyên

const flowerCategories: Record<number, string> = {
  1: "Roses",
  2: "Tulips",
  3: "Daisies",
  4: "Lilies",
  5: "Orchids",
  6: "Sunflowers",
  7: "Carnations",
  8: "Mixed Bouquets",
};

export default function FlowerScreen() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchFlowers();
  }, []);

  async function fetchFlowers() {
    try {
      const res = await apiClient.get("/api/Flower");
      setFlowers(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load flowers");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    try {
      const res = await apiClient.post("/api/Upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      alert("Image uploaded!");
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    }
  }

  async function handleSaveFlower() {
    if (!form.name || !form.price || !form.stock || !form.category) {
      Alert.alert("Validation", "Name, price, stock and category are required");
      return;
    }

    try {
      const payload = {
  id: selectedFlower ? selectedFlower.id : 0, // bắt buộc có ID
  name: form.name,
  description: form.description,
  imageUrl: form.imageUrl,
  price: parseFloat(form.price),
  stock: parseInt(form.stock),
  category: parseInt(form.category),
};


      if (selectedFlower) {
        await apiClient.put(`/api/Flower/${selectedFlower.id}`, payload);
        Alert.alert("Success", "Flower updated!");
      } else {
        await apiClient.post("/api/Flower", payload);
        Alert.alert("Success", "Flower created!");
      }

      setForm({ name: "", price: "", stock: "", category: "", description: "", imageUrl: "" });
      setSelectedFlower(null);
      setModalVisible(false);
      fetchFlowers();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save flower");
    }
  }

async function handleDeleteFlower(id: number) {
  const confirmed = window.confirm("Are you sure you want to delete this flower?");
  
  if (!confirmed) return;
  
  try {
    await apiClient.delete(`/api/Flower/${id}`);
    alert("Flower deleted successfully!");
    setSelectedFlower(null);
    setModalVisible(false);
    fetchFlowers();
  } catch (err: any) {
    alert(err.response?.data?.title || err.message || "Failed to delete");
  }
}


  const renderFlower = ({ item }: { item: Flower }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedFlower(item);
        setForm({
          name: item.name,
          price: item.price.toString(),
          stock: item.stock.toString(),
          category: item.category?.toString() || "",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
        });
        setModalVisible(true);
      }}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text>Price: {item.price.toFixed(2)}VND</Text>
      <Text>Stock: {item.stock}</Text>
      <Text>Category: {flowerCategories[item.category as number] || "Unknown"}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27c16b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flower Management</Text>

      <TouchableOpacity style={styles.saveBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ color: "#fff" }}>+ Add Flower</Text>
      </TouchableOpacity>

      <FlatList
        data={flowers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFlower}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFlower ? "Edit Flower" : "New Flower"}</Text>

            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
              style={styles.input}
            />
            <TextInput
              placeholder="Price"
              value={form.price}
              onChangeText={(v) => handleChange("price", v)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Stock"
              value={form.stock}
              onChangeText={(v) => handleChange("stock", v)}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Category dropdown */}
            <label>Category:</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              style={{
                marginBottom: 10,
                padding: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#ccc",
              }}
            >
              <option value="">--Select Category--</option>
              {Object.entries(flowerCategories).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>

            <TextInput
              placeholder="Description"
              value={form.description}
              onChangeText={(v) => handleChange("description", v)}
              style={styles.input}
            />

            <input type="file" onChange={handlePickImage} style={{ marginBottom: 10 }} />
            {form.imageUrl && (
              <Image source={{ uri: form.imageUrl }} style={{ width: 200, height: 200, marginBottom: 10 }} />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFlower}>
              <Text style={{ color: "#fff" }}>{selectedFlower ? "Update" : "Save"}</Text>
            </TouchableOpacity>

            {selectedFlower && (
  <TouchableOpacity
  style={styles.deleteBtn}
  onPress={() => {
    if (selectedFlower?.id) handleDeleteFlower(selectedFlower.id);
  }}
>
  <Text style={{ color: "#fff" }}>Delete</Text>
</TouchableOpacity>

)}


            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setSelectedFlower(null);
                setForm({ name: "", price: "", stock: "", category: "", description: "", imageUrl: "" });
                setModalVisible(false);
              }}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ...styles giữ nguyên


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 8, elevation: 2 },
  name: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", padding: 20, justifyContent: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 10 },
  saveBtn: { backgroundColor: "#27c16b", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 8 },
  deleteBtn: { backgroundColor: "#dc3545", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 8 },
  closeBtn: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 16 },
});
