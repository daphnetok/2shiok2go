// logic for accept/cancel orders

// Dummy data for demonstration
export const ordersData = {
  today: [
    {
      id: 'ORD001',
      time: '09:15 AM',
      item: 'Chicken Rice',
      qty: 1,
      customer: 'Alice',
      status: 'Preparing',
      comments: 'Less chilli',
      completed: false,
    },
    {
      id: 'ORD002',
      time: '09:45 AM',
      item: 'Laksa',
      qty: 2,
      customer: 'Bob',
      status: 'Preparing',
      comments: '',
      completed: false,
    },
    {
      id: 'ORD003',
      time: '10:05 AM',
      item: 'Fried Noodles',
      qty: 1,
      customer: 'Eve',
      status: 'Ready for Collection',
      comments: 'No bean sprouts',
      completed: true,
    },
  ],
  history: [
    {
      id: 'ORD900',
      date: '2025-10-25',
      time: '11:20 AM',
      item: 'Mee Rebus',
      qty: 1,
      customer: 'Tom',
      status: 'Collected',
      comments: '',
    },
    {
      id: 'ORD901',
      date: '2025-10-26',
      time: '10:15 AM',
      item: 'Nasi Lemak',
      qty: 2,
      customer: 'Jerry',
      status: 'Collected',
      comments: 'Extra egg',
    },
  ],
};
