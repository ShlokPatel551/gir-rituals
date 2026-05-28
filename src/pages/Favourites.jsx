import { Link } from "react-router-dom";
import { products } from "../data/mockData";
import { useApp } from "../context/AppContext";
function Favourites() {
  const { favourites, toggleFavourite } = useApp();
  const items = products.filter((p) => favourites.includes(p.id));
  if (items.length === 0) {
    return <div>
        <h1 className="page-title">Favourites</h1>
        <div className="empty-state card">
          <div className="emoji">❤️</div>
          <p>No favourites yet</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>Browse Products</Link>
        </div>
      </div>;
  }
  return <div>
      <h1 className="page-title">Favourites</h1>
      <div className="product-grid">
        {items.map((p) => <div key={p.id} className="product-mini card">
            <button type="button" onClick={() => toggleFavourite(p.id)} style={{ position: "absolute", top: 8, right: 8, background: "none" }}>❤️</button>
            <Link to={`/products/${p.id}`}>
              <span className="product-emoji">{p.image}</span>
              <strong>{p.name}</strong>
              <span>₹{p.price}/{p.unit}</span>
            </Link>
          </div>)}
      </div>
    </div>;
}
export {
  Favourites
};
