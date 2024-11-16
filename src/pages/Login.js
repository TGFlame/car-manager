import { useState } from "react";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Divider } from "antd";
import './Login.css'

export default function Login() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    try {
      isLogin ? await login(email, password) : await signup(email, password);
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Authentication error:", error.message);
    }
  };

  return (
    <>
    <div className="container">
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2 className="login">{isLogin ? "Login" : "Sign Up"}</h2>
      <Form className="login" onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="email"
          label={<span style={{ color: '#CFC6B8' }}>Email</span>}
          rules={[{ required: true, message: "Please enter your email!" }]}
        >
          <Input
            placeholder="Email"
            value={email}
  onChange={(e) => setEmail(e.target.value)}
           />
        </Form.Item>
        <Form.Item
          name="password"
          label={<span style={{ color: '#CFC6B8' }}>Password</span>}
          rules={[{ required: true, message: "Please enter your password!" }]}
        >
           <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      <Button type="link" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "First time logging in? Click here to Sign Up" : "Switch to Login"}
      </Button>
    </div>
    </div>
    </>
  );
}
