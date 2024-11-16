
import { useState, useEffect } from "react";
import { db, storage } from "../config/firebase";
import { useAuth } from "../components/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, getDownloadURL, list } from "firebase/storage"; // Import `list` from Firebase Storage
import { Link } from "react-router-dom";
import {  Input, Button, Typography, Card, Row,  } from "antd";
import '../pages/Login.css'
const { Title } = Typography;

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchCars();
    }
  }, [currentUser]);

  const fetchCars = async () => {
    try {
      const q = query(
        collection(db, "cars"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      const carData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const car = { id: doc.id, ...doc.data() };

          try {
            const folderRef = ref(storage, `cars/${currentUser.uid}/${car.title}/`);
            const folderSnapshot = await list(folderRef, { maxResults: 1 }); // Fetch only the first image
            if (folderSnapshot.items.length > 0) {
              const imageRef = folderSnapshot.items[0];
              const imageUrl = await getDownloadURL(imageRef);
              car.imageUrl = imageUrl;
            } else {
              car.imageUrl = null; // No images found
            }
          } catch (error) {
            console.log(`Error fetching image for ${car.title}:`, error);
            car.imageUrl = null; // Default to null if no image found
          }

          return car;
        })
      );

      setCars(carData);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredCars = cars.filter(
    (car) =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // const columns = [
  //   {
  //     title: "Image",
  //     key: "image",
  //     render: (_, record) =>
  //       record.imageUrl ? (
  //         <Image
  //           width={100}
  //           height={100}
  //           src={record.imageUrl}
  //           alt={record.title}
  //           style={{ objectFit: "cover", borderRadius: 5 }}
  //         />
  //       ) : (
  //         <div>No Image</div>
  //       ),
  //   },
  //   { title: "Title", dataIndex: "title", key: "title" },
  //   { title: "Description", dataIndex: "description", key: "description" },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     render: (_, record) => (
  //       <Link to={`/cars/${record.id}`}>
  //         <Button type="link">View Details</Button>
  //       </Link>
  //     ),
  //   },
  // ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>My Cars</Title>
      <Input.Search
        placeholder="Search cars..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 20, maxWidth: 300 }}
      />
      <Link to="/create">
        <Button type="primary" style={{ marginBottom: 20 }}>
          Add New Car
        </Button>
      </Link>
      
      <Row gutter={[16, 16]}>
        {filteredCars.map((car) => (
          <Link to={`/cars/${car.id}`} style={{ textDecoration: "none" }}>
          <Card
            hoverable
            className="space"
            cover={
              car.imageUrl ? (
                <img
                  alt={car.title}
                  src={car.imageUrl}
                  style={{ height: 400, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f0f0",
                    color: "#aaa",
                  }}
                >
                  No Image
                </div>
              )
            }
          >
            <Card.Meta
              title={car.title}
              description={car.description}
              style={{ marginBottom: 16 }}
            />
          </Card>
        </Link>
        ))}
      </Row>

      
    </div>
  );
}
