import { Routes, Route } from 'react-router-dom';

import Menu from "./pages/Menu";
import Header from "./pages/Header";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Participants from "./pages/Participants";
import Products from "./pages/Products";
import Footer from "./pages/Footer";

const Main = () => {
  return (
		<div>
			<Header />
			<Menu />
				<div className="body">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route exact path="/register" element={<Register />} />
						<Route exact path="/participants" element={<Participants />} />
						<Route exact path="/products" element={<Products />} />
					</Routes>
				</div>
			<Footer />
		</div>
  );
}


export default Main;