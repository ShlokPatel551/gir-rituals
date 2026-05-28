export interface AdminNotif {
  id:    string;
  icon:  string;
  color: string;
  bg:    string;
  title: string;
  desc:  string;
  time:  string;
  link:  string;
  read:  boolean;
}

export const ADMIN_NOTIFS: AdminNotif[] = [
  { id: 'an1', icon: 'settings_backup_restore', color: '#ba1a1a', bg: '#ffdad6', title: 'New refund request', desc: 'Ananya Varma requested a refund for ₹450.',       time: '5 min ago',  link: '/admin/refunds',    read: false },
  { id: 'an2', icon: 'local_shipping',          color: '#7d562d', bg: '#ffdcbd', title: 'Delivery missed',    desc: "Rahul Mehta's delivery failed — Satellite zone.", time: '22 min ago', link: '/admin/deliveries', read: false },
  { id: 'an3', icon: 'inventory_2',             color: '#5f2f00', bg: '#ffdcc4', title: 'Low stock alert',    desc: 'A2 Ghee (500ml) has only 12 units left.',         time: '1 hr ago',   link: '/admin/products',   read: false },
  { id: 'an4', icon: 'person_add',              color: '#274e3d', bg: '#c1ecd4', title: 'New subscription',   desc: 'Pooja Sharma subscribed to Gir Milk (1L/day).',    time: '2 hrs ago',  link: '/admin/customers',  read: true  },
  { id: 'an5', icon: 'payments',                color: '#274e3d', bg: '#c1ecd4', title: 'Payment received',   desc: 'Suresh Joshi paid ₹2,100 for May 2026.',           time: '3 hrs ago',  link: '/admin/billing',    read: true  },
];
