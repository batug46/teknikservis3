import { useState, useEffect } from 'react';

import { Container, Table, Button, Badge, Modal } from 'react-bootstrap';

import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';



const statusColors = {

  'beklemede': 'warning',

  'onaylandı': 'info',

  'hazırlanıyor': 'primary',

  'kargoda': 'success',

  'tamamlandı': 'success',

  'iptal': 'danger'

};



const statusOptions = [

  'beklemede',

  'onaylandı',

  'hazırlanıyor',

  'kargoda',

  'tamamlandı',

  'iptal'

];



export default function OrdersManagement() {

  const router = useRouter();

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);



  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {

      router.push('/admin/login');

      return;

    }

    fetchOrders();

  }, [router]);



  const fetchOrders = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/orders', {

        headers: {

          'Authorization': `Bearer ${token}`

        }

      });

     

      if (!response.ok) throw new Error('Failed to fetch orders');

     

      const data = await response.json();

      setOrders(data);

      setLoading(false);

    } catch (err) {

      setError(err.message);

      setLoading(false);

    }

  };



  const handleStatusChange = async (orderId, newStatus) => {

    try {

      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/orders', {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`

        },

        body: JSON.stringify({ id: orderId, status: newStatus })

      });



      if (!response.ok) throw new Error('Failed to update order status');



      fetchOrders();

    } catch (err) {

      setError(err.message);

    }

  };



  const handleDelete = async (id) => {

    if (!confirm('Are you sure you want to delete this order?')) return;



    try {

      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/orders?id=${id}`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${token}`

        }

      });



      if (!response.ok) throw new Error('Failed to delete order');



      fetchOrders();

    } catch (err) {

      setError(err.message);

    }

  };



  const getStatusColor = (status) => {

    switch (status) {

      case 'beklemede':

        return 'bg-yellow-100 text-yellow-800';

      case 'onaylandı':

        return 'bg-blue-100 text-blue-800';

      case 'hazırlanıyor':

        return 'bg-purple-100 text-purple-800';

      case 'kargoda':

        return 'bg-green-100 text-green-800';

      case 'tamamlandı':

        return 'bg-green-100 text-green-800';

      case 'iptal':

        return 'bg-red-100 text-red-800';

      default:

        return 'bg-gray-100 text-gray-800';

    }

  };



  // Sipariş detayını göster

  const handleShowDetails = (order) => {

    setSelectedOrder(order);

    setShowModal(true);

  };



  if (!user || user.role !== 'admin') {

    return null;

  }



  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error: {error}</div>;



  return (

    <Container className="py-4">

      <h1 className="mb-4">Sipariş Yönetimi</h1>



      <div className="bg-white rounded-lg shadow overflow-hidden">

        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Order ID

              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Customer

              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Items

              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Total

              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Status

              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                Actions

              </th>

            </tr>

          </thead>

          <tbody className="bg-white divide-y divide-gray-200">

            {orders.map((order) => (

              <tr key={order.id}>

                <td className="px-6 py-4 whitespace-nowrap">

                  #{order.id}

                </td>

                <td className="px-6 py-4">

                  <div className="text-sm font-medium text-gray-900">{order.user.name}</div>

                  <div className="text-sm text-gray-500">{order.user.email}</div>

                </td>

                <td className="px-6 py-4">

                  <ul className="text-sm text-gray-900">

                    {order.items.map((item) => (

                      <li key={item.id}>

                        {item.product.name} x {item.quantity}

                      </li>

                    ))}

                  </ul>

                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                  ${order.total}

                </td>

                <td className="px-6 py-4 whitespace-nowrap">

                  <select

                    value={order.status}

                    onChange={(e) => handleStatusChange(order.id, e.target.value)}

                    className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`}

                  >

                    <option value="beklemede">Pending</option>

                    <option value="onaylandı">Processing</option>

                    <option value="hazırlanıyor">Shipped</option>

                    <option value="kargoda">Delivered</option>

                    <option value="tamamlandı">Completed</option>

                    <option value="iptal">Cancelled</option>

                  </select>

                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <button

                    onClick={() => handleDelete(order.id)}

                    className="text-red-600 hover:text-red-900"

                  >

                    Delete

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* Sipariş Detay Modalı */}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>

          <Modal.Title>

            Sipariş Detayı - {selectedOrder?.id?.slice(-6).toUpperCase()}

          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          {selectedOrder && (

            <>

              <h5>Müşteri Bilgileri</h5>

              <p>

                <strong>Ad Soyad:</strong> {selectedOrder?.user?.adSoyad}<br />

                <strong>Telefon:</strong> {selectedOrder?.phone}<br />

                <strong>Adres:</strong> {selectedOrder?.address}

              </p>



              <h5 className="mt-4">Sipariş Detayı</h5>

              <Table responsive striped bordered>

                <thead>

                  <tr>

                    <th>Ürün</th>

                    <th>Birim Fiyat</th>

                    <th>Adet</th>

                    <th>Toplam</th>

                  </tr>

                </thead>

                <tbody>

                  {selectedOrder?.items?.map(item => (

                    <tr key={item?.id}>

                      <td>{item?.product?.name}</td>

                      <td>{item?.price?.toFixed(2)} TL</td>

                      <td>{item?.quantity}</td>

                      <td>{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)} TL</td>

                    </tr>

                  ))}

                  <tr>

                    <td colSpan="3" className="text-end"><strong>Toplam Tutar:</strong></td>

                    <td><strong>{selectedOrder?.totalAmount?.toFixed(2)} TL</strong></td>

                  </tr>

                </tbody>

              </Table>



              <h5 className="mt-4">Sipariş Durumu</h5>

              <div className="d-flex align-items-center">

                <Badge bg={statusColors[selectedOrder?.status] || 'secondary'} className="me-3">

                  {selectedOrder?.status}

                </Badge>

                <select

                  className="form-select w-auto"

                  value={selectedOrder?.status}

                  onChange={(e) => {

                    handleStatusChange(selectedOrder?.id, e.target.value);

                    setShowModal(false);

                  }}

                >

                  {statusOptions.map(status => (

                    <option key={status} value={status}>

                      {status}

                    </option>

                  ))}

                </select>

              </div>

            </>

          )}

        </Modal.Body>

      </Modal>

    </Container>

  );

}