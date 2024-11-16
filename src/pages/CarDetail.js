
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Form, Input, Button, Typography, Image, Space, Upload, message, Modal } from "antd";
import { useAuth } from "../components/auth";

const { Dragger } = Upload;

export default function CarDetail() {
  const { currentUser } = useAuth();
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carRef = doc(db, "cars", carId);
        const carSnap = await getDoc(carRef);
        if (carSnap.exists()) {
          const carData = carSnap.data();
          setCar(carData);
          setImages(carData.images || []);
        } else {
          message.error("Car not found");
        }
      } catch (error) {
        message.error("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  const handleUpdate = async () => {
    try {
      const carRef = doc(db, "cars", carId);
      await updateDoc(carRef, { ...car, images });
      message.success("Car updated successfully!");
    } catch (error) {
      message.error("Failed to update car");
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const imageRef = ref(storage, `cars/${currentUser.uid}/${car.title}/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);
      setImages((prev) => [...prev, imageUrl]); 
      message.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(`Failed to upload ${file.name}.`);
    }
  };

  const handleImageDelete = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef); 
      setImages((prev) => prev.filter((url) => url !== imageUrl)); 
      message.success("Image deleted successfully.");
    } catch (error) {
      console.error("Image deletion error:", error);
      message.error("Failed to delete image.");
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: "Are you sure you want to delete this car?",
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          const carRef = doc(db, "cars", carId);
          await deleteDoc(carRef);
          message.success("Car deleted successfully!");
          navigate("/dashboard");
        } catch (error) {
          message.error("Failed to delete car");
        }
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (!car) return <p>No car found</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <Typography.Title level={2}>{car.title}</Typography.Title>
      <Form layout="vertical">
        <Form.Item label="Title">
          <Input
            value={car.title}
            onChange={(e) => setCar({ ...car, title: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea
            rows={4}
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Tags">
          <Input.TextArea
            rows={4}
            value={car.tags}
            onChange={(e) => setCar({ ...car, tags: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Images">
          <Space wrap>
            {images.map((image, index) => (
              <div key={index} style={{ position: "relative" }}>
                <Image
                  src={image}
                  alt={`Car ${index}`}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: 5 }}
                />
                <Button
                  type="danger"
                  size="small"
                  onClick={() => handleImageDelete(image)}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    zIndex: 10,
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </Space>
          <Dragger
            name="file"
            customRequest={({ file, onSuccess }) => {
              handleImageUpload(file).then(() => {
                onSuccess("ok");
              });
            }}
            multiple={true}
            showUploadList={false}
            accept="image/*"
            style={{ marginTop: 10 }}
          >
            <p>Click or drag files to this area to upload</p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpdate} style={{ marginRight: 8 }}>
            Update Car
          </Button>
          <Button type="danger" onClick={handleDelete}>
            Delete Car
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

