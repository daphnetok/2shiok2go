// to create, cancel, update orders
import { db } from './firebase'
import { collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'

const ordersRef = collection(db, 'orders')

// Create (reserve order)
export async function createOrder(orderData) {
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    status: 'reserved',
    createdAt: new Date()
  })
  return { id: docRef.id, ...orderData }
}


// Cancel order
export async function cancelOrder(orderId) {
  const orderDoc = doc(db, 'orders', orderId)
  await updateDoc(orderDoc, { status: 'cancelled' })
}


// Update order (e.g., accept, complete)
export async function updateOrder(orderId, updates) {
  const orderDoc = doc(db, 'orders', orderId)
  await updateDoc(orderDoc, updates)
}


// Get orders by hawker or buyer
export async function getOrdersByUser(userId, role) {
  const q = query(ordersRef, where(role === 'hawker' ? 'hawkerID' : 'buyerID', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
