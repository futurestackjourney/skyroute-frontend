import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthToggleButton = () => {
  const [isLogin, setIsLogin] = useState(true); // true = show Login, false = show Register
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLogin) {
      navigate("/login");
    } else {
      navigate("/register");
    }
    setIsLogin(!isLogin); // toggle button text
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-3 font-semibold text-[16px] rounded-full bg-black/10 hover:bg-black/20 transition-colors duration-300"
    >
      {isLogin ? "Login" : "Sign Up"}
    </button>
  );
};

export default AuthToggleButton;