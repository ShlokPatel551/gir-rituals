import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerOrders.css";

const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah",    initials: "PS", tier: "Premium Member",  city: "Navrangpura, Ahmd"  },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta",   initials: "RM", tier: "Standard Member", city: "Satellite, Ahmd"    },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", initials: "AK", tier: "Premium Member",  city: "Vastrapur, Ahmd"    },
  GR00057: { clientId: "GR00057", name: "Meena Patel",   initials: "MP", tier: "Paused Member",   city: "Bopal, Ahmd"        },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi",  initials: "SJ", tier: "Premium Member",  city: "Paldi, Ahmd"        },
  GR00098: { clientId: "GR00098", name: "Kavita Rao",    initials: "KR", tier: "Standard Member", city: "Maninagar, Ahmd"    },
  GR00143: { clientId: "GR00143", name: "Deepak Nair",   initials: "DN", tier: "New Member",      city: "Rajkot"             },
  GR00178: { clientId: "GR00178", name: "Sunita Verma",  initials: "SV", tier: "Premium Member",  city: "Ahmedabad"          },
  GR00234: { clientId: "GR00234", name: "Arjun Desai",   initials: "AD", tier: "New Member",      city: "Surat"              },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma",  initials: "PS", tier: "Paused Member",   city: "Gandhinagar"        },
};

const ALL_ORDERS = [
  { id: "#GR-9921", date: "Oct 24, 2023", items: "A2 Desi Cow Milk x 2, Vedic Ghee 500g",    amount: "₹1,450.00", status: "scheduled"        },
  { id: "#GR-9844", date: "Oct 20, 2023", items: "Organic Paneer 250g x 4",                   amount: "₹840.00",   status: "delivered"        },
  { id: "#GR-9712", date: "Oct 18, 2023", items: "Full Cream Curd 1kg x 1",                   amount: "₹210.00",   status: "out_for_delivery" },
  { id: "#GR-9650", date: "Oct 15, 2023", items: "Vedic Ghee 1L x 2, Honey 500g",             amount: "₹4,200.00", status: "delivered"        },
  { id: "#GR-9580", date: "Oct 08, 2023", items: "A2 Desi Cow Milk x 3",                      amount: "₹960.00",   status: "delivered"        },
  { id: "#GR-9421", date: "Sep 28, 2023", items: "Premium Curd 500g x 2, Ghee 250g",          amount: "₹680.00",   status: "delivered"        },
  { id: "#GR-9312", date: "Sep 20, 2023", items: "A2 Desi Cow Milk x 2",                      amount: "₹640.00",   status: "delivered"        },
  { id: "#GR-9201", date: "Sep 12, 2023", items: "Bilona Ghee 250g x 2, Buttermilk 1L",       amount: "₹1,120.00", status: "delivered"        },
];

const STATUS_META = {
  scheduled:        { icon: "event_note",     bg: "#ffdcc4", color: "#2f1400", dotColor: "#8a3a00", label: "Scheduled"         },
  delivered:        { icon: "package_2",      bg: "#c1ecd4", color: "#274e3d", dotColor: "#1b4332", label: "Delivered"         },
  out_for_delivery: { icon: "local_shipping", bg: "#ffdcbd", color: "#2c1600", dotColor: "#7d562d", label: "Out for Delivery"  },
};

const PAGE_SIZE = 4;

function AdminCustomerOrders() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [apiCustomer,  setApiCustomer]  = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    api.adminCustomer(id).then(c => {
      setApiCustomer({
        clientId: c.clientId,
        name:     `${c.firstName} ${c.lastName}`,
        initials: `${c.firstName[0] || "?"}${c.lastName[0] || "?"}`.toUpperCase(),
        tier:     "Premium Member",
        city:     c.deliveryAddress?.city || "Ahmedabad",
      });
    }).catch(() => {});
  }, [id]);

  const customer = apiCustomer || (id ? MOCK_MAP[id] : undefined);

  if (!customer) {
    return (
      <div className="co-not-found">
        <span className="material-symbols-outlined co-not-found-icon">person_off</span>
        <p className="co-not-found-title">Customer not found</p>
        <Link to="/admin/customers" className="co-back-link">← Back to Customers</Link>
      </div>
    );
  }

  const filtered   = statusFilter === "all" ? ALL_ORDERS : ALL_ORDERS.filter(o => o.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(e) {
    setStatusFilter(e.target.value);
    setPage(1);
  }

  return (
    <div className="co-page">

      {/* ── Breadcrumb + header ── */}
      <div className="co-header">
        <div>
          <div className="co-breadcrumb">
            <Link to="/admin/customers" className="co-crumb-link">Customers</Link>
            <span className="material-symbols-outlined co-crumb-sep">chevron_right</span>
            <span className="co-crumb-cur">{customer.name}</span>
          </div>
          <h2 className="co-name">{customer.name}</h2>
          <div className="co-badges">
            <span className="co-tier-badge">{customer.tier}</span>
            <span className="co-location">
              <span className="material-symbols-outlined">location_on</span>
              {customer.city}
            </span>
          </div>
        </div>
        <div className="co-header-actions">
          <button type="button" className="co-btn-outline" onClick={() => navigate(`/admin/customers/${id}`)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Detail
          </button>
          <button type="button" className="co-btn-solid">
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Place New Order
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="co-filter-bar">
        <h3 className="co-section-title">All Orders</h3>
        <div className="co-filter-actions">
          <div className="co-select-wrap">
            <span className="material-symbols-outlined co-select-icon">filter_list</span>
            <select className="co-select" value={statusFilter} onChange={handleStatusChange}>
              <option value="all">Status: All</option>
              <option value="delivered">Delivered</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <span className="material-symbols-outlined co-select-arrow">expand_more</span>
          </div>
          <button type="button" className="co-export-btn">
            <span className="material-symbols-outlined">file_download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Order cards ── */}
      <div className="co-orders-list">
        {paginated.map(order => {
          const meta = STATUS_META[order.status];
          return (
            <div key={order.id} className="co-order-card">
              <div className="co-order-left">
                <div className="co-order-icon-box">
                  <span className="material-symbols-outlined">{meta.icon}</span>
                </div>
                <div className="co-order-fields">
                  <div className="co-order-field">
                    <p className="co-field-label">Order ID</p>
                    <p className="co-field-id">{order.id}</p>
                  </div>
                  <div className="co-order-field">
                    <p className="co-field-label">Order Date</p>
                    <p className="co-field-value">{order.date}</p>
                  </div>
                  <div className="co-order-field co-field-items">
                    <p className="co-field-label">Items Summary</p>
                    <p className="co-field-value co-items-text">{order.items}</p>
                  </div>
                  <div className="co-order-field">
                    <p className="co-field-label">Total Amount</p>
                    <p className="co-field-amount">{order.amount}</p>
                  </div>
                </div>
              </div>
              <div className="co-order-right">
                <span className="co-status-badge" style={{ background: meta.bg, color: meta.color }}>
                  <span className="co-status-dot" style={{ background: meta.dotColor }} />
                  {meta.label}
                </span>
                <button type="button" className="co-view-btn">
                  View Details
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      <div className="co-pagination">
        <p className="co-pagination-info">
          Showing <strong>{(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, filtered.length)}</strong>{" "}
          of <strong>{filtered.length}</strong> orders
        </p>
        <div className="co-pagination-controls">
          <button
            type="button"
            className="co-page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              className={`co-page-btn${page === n ? " co-page-btn-active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="co-page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Stats bento grid ── */}
      <div className="co-stats-grid">
        <div className="co-stat-card">
          <span className="material-symbols-outlined co-stat-bg-icon">payments</span>
          <h4 className="co-stat-label">Lifetime Value</h4>
          <p className="co-stat-amount">₹42,850.00</p>
          <div className="co-stat-trend co-trend-up">
            <span className="material-symbols-outlined">trending_up</span>
            +12% from last month
          </div>
        </div>
        <div className="co-stat-card">
          <span className="material-symbols-outlined co-stat-bg-icon">shopping_basket</span>
          <h4 className="co-stat-label">Total Orders</h4>
          <p className="co-stat-amount">28 Orders</p>
          <div className="co-stat-trend co-trend-neutral">
            <span className="material-symbols-outlined">schedule</span>
            Average 2.4 orders / month
          </div>
        </div>
        <div className="co-stat-card">
          <span className="material-symbols-outlined co-stat-bg-icon">star</span>
          <h4 className="co-stat-label">Favorite Product</h4>
          <p className="co-stat-amount">A2 Desi Cow Milk</p>
          <div className="co-stat-trend co-trend-neutral">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Ordered 18 times
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminCustomerOrders };
