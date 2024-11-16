import { useState } from "react";
import { db, storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Upload, Typography, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function CreateCar() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleImageUpload = async (file) => {
    try {
      const imageRef = ref(storage, `cars/${currentUser.uid}/${title}/${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      setImages((prev) => [...prev, imageUrl]);
      message.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(`Failed to upload ${file.name}.`);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || images.length === 0) {
      message.error("Please fill in all fields and upload at least one image.");
      return;
    }
    if( images.length > 10)
    {
      message.error("number of images cannot exceed 10");
    }
    try {
      await addDoc(collection(db, "cars"), {
        userId: currentUser.uid,
        title,
        description,
        tags,
        images,
      });
      message.success("Car added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding car:", error);
      message.error("Failed to add car. Please try again.");
    }
  };
 
  const uploadProps = {
    beforeUpload: (file) => {
      handleImageUpload(file);
      return false; // Prevent default upload behavior
    },
    multiple: true,
    accept: "image/*",
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <Typography.Title level={2}>Add New Car</Typography.Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Title"
          required
          rules={[{ required: true, message: "Please enter a title!" }]}
        >
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          required
          rules={[{ required: true, message: "Please enter a description!" }]}
        >
          <Input.TextArea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </Form.Item>

        <Form.Item label="Tags (comma separated)">
          <Input
            placeholder="Tags (e.g., sedan, Toyota, dealer)"
            value={tags.join(", ")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((tag) => tag.trim()))
            }
          />
        </Form.Item>

        <Form.Item label="Upload Images" required>
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Upload Images</Button>
          </Upload>
          <Space direction="vertical" style={{ marginTop: 10 }}>
            {images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Uploaded ${index}`}
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
            ))}
          </Space>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Add Car
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
