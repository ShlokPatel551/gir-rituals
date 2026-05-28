import { useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
const CATEGORIES = ["All", "Milk & Dairy", "Ghee & Oils"];
function categoryOf(id) {
  if (id === "milk") return "Milk & Dairy";
  if (id === "ghee") return "Ghee & Oils";
  return "All";
}
function Products() {
  const { favourites, toggleFavourite, addToCart } = useApp();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [category, setCategory] = useState("All");
  const handleAddToCart = (id, name) => {
    addToCart(id);
    showToast(`${name} added to cart!`);
  };
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || categoryOf(p.id) === category;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });
  return <div>
      <h1 className="page-title">Products</h1>

      {
    /* Search + Sort row */
  }
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
        <input
    type="text"
    placeholder="🔍  Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      flex: 1,
      minWidth: 160,
      padding: "0.7rem 1rem",
      border: "1px solid var(--border)",
      borderRadius: "var(--md-radius-full)",
      background: "var(--md-surface-container-lowest)",
      fontSize: "0.9rem",
      fontFamily: "inherit"
    }}
  />
        <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    style={{
      padding: "0.7rem 1rem",
      border: "1px solid var(--border)",
      borderRadius: "var(--md-radius-full)",
      background: "var(--md-surface-container-lowest)",
      fontSize: "0.875rem",
      fontFamily: "inherit"
    }}
  >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {
    /* Category filter */
  }
      <div className="tabs" style={{ marginBottom: "1rem" }}>
        {CATEGORIES.map((c) => <button
    key={c}
    type="button"
    className={`tab ${category === c ? "active" : ""}`}
    onClick={() => setCategory(c)}
  >
            {c}
          </button>)}
      </div>

      {filtered.length === 0 && <div className="empty-state card">
          <div className="emoji">🔍</div>
          <p>No products found{search ? ` for "${search}"` : ""}.</p>
        </div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map((p) => <div
    key={p.id}
    className="card"
    style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
  >
            <span style={{ fontSize: "2.5rem" }}>{p.image}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <strong>{p.name}</strong>
                <button
    type="button"
    onClick={() => toggleFavourite(p.id)}
    style={{ background: "none", fontSize: "1.25rem" }}
    aria-label={favourites.includes(p.id) ? "Remove from favourites" : "Add to favourites"}
  >
                  {favourites.includes(p.id) ? "\u2764\uFE0F" : "\u{1F90D}"}
                </button>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.25rem 0" }}>
                {p.benefits[0]}
              </p>
              <p style={{ fontWeight: 600, color: "var(--green-700)" }}>₹{p.price}/{p.unit}</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <Link
    to={`/products/${p.id}`}
    className="btn btn-ghost"
    style={{ flex: 1, fontSize: "0.85rem" }}
  >
                  View Details
                </Link>
                <button
    type="button"
    className="btn btn-primary"
    style={{ flex: 1, fontSize: "0.85rem" }}
    onClick={() => handleAddToCart(p.id, p.name)}
  >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}
export {
  Products
};
