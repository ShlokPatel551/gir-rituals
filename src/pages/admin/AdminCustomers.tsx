import { getAllCustomers } from '../../lib/customerStore';

export function AdminCustomers() {
  const customers = getAllCustomers();

  return (
    <div>
      <h1 className="admin-page-title">Customers</h1>
      <p className="admin-page-sub">All OTP-verified registrations</p>

      {customers.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem' }}>
          <p>No customers yet. Register via the customer app to see entries here.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.clientId}>
                  <td><code>{c.clientId}</code></td>
                  <td>{c.firstName} {c.lastName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.deliveryAddress.city}</td>
                  <td>{new Date(c.verifiedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
