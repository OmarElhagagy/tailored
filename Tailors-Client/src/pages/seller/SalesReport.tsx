import React, { useState } from 'react';
import { Card, Button, Form, Table, Row, Col, Dropdown } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesReport: React.FC = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Mock data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 1500, 1300, 1700, 2000, 2400],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Orders',
        data: [15, 19, 17, 21, 24, 28],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Performance',
      },
    },
  };
  
  const mockSalesData = [
    { id: '1', date: '2023-06-01', customer: 'John Doe', items: 3, total: 350 },
    { id: '2', date: '2023-06-05', customer: 'Jane Smith', items: 2, total: 270 },
    { id: '3', date: '2023-06-10', customer: 'Robert Johnson', items: 1, total: 180 },
    { id: '4', date: '2023-06-15', customer: 'Emily Davis', items: 4, total: 520 },
    { id: '5', date: '2023-06-20', customer: 'Michael Brown', items: 2, total: 310 }
  ];
  
  // Summary stats
  const totalSales = mockSalesData.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = mockSalesData.length;
  const avgOrderValue = totalSales / totalOrders;
  
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };
  
  const handleExport = () => {
    alert('Exporting sales report...');
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Report</h2>
        <Button variant="success" onClick={handleExport}>
          Export Report
        </Button>
      </div>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <h6 className="text-muted">Total Sales</h6>
              <h3 className="mb-0">${totalSales.toFixed(2)}</h3>
              <p className="text-success mt-2">+15% from previous period</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <h6 className="text-muted">Orders</h6>
              <h3 className="mb-0">{totalOrders}</h3>
              <p className="text-success mt-2">+8% from previous period</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <h6 className="text-muted">Average Order Value</h6>
              <h3 className="mb-0">${avgOrderValue.toFixed(2)}</h3>
              <p className="text-success mt-2">+5% from previous period</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Sales Performance</h5>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-date-range">
              {dateRange === 'thisMonth' ? 'This Month' : 
               dateRange === 'lastMonth' ? 'Last Month' : 
               dateRange === 'lastThreeMonths' ? 'Last 3 Months' : 
               dateRange === 'thisYear' ? 'This Year' : 'Custom'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleDateRangeChange('thisMonth')}>
                This Month
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('lastMonth')}>
                Last Month
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('lastThreeMonths')}>
                Last 3 Months
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('thisYear')}>
                This Year
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('custom')}>
                Custom Range
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          {dateRange === 'custom' && (
            <Row className="mb-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={customRange.startDate}
                    onChange={(e) => setCustomRange({...customRange, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={customRange.endDate}
                    onChange={(e) => setCustomRange({...customRange, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="primary" className="w-100">Apply</Button>
              </Col>
            </Row>
          )}
          <div style={{ height: '300px' }}>
            <Bar options={options} data={salesData} />
          </div>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Sales</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {mockSalesData.map(sale => (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td>{sale.date}</td>
                  <td>{sale.customer}</td>
                  <td>{sale.items}</td>
                  <td>${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalesReport; 