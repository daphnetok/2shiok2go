//state of listings for buyers
import { defineStore } from 'pinia'
import { createOrder, cancelOrder, updateOrder, getOrdersByUser } from '@/services/orderService'

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),

  actions: {
    async reserveOrder(orderData) {
      this.loading = true
      try {
        const order = await createOrder(orderData)
        this.orders.push(order)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchOrders(userId, role) {
      this.loading = true
      try {
        this.orders = await getOrdersByUser(userId, role)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async cancel(orderId) {
      await cancelOrder(orderId)
      this.orders = this.orders.filter(o => o.id !== orderId)
    },

    async update(orderId, updates) {
      await updateOrder(orderId, updates)
      const idx = this.orders.findIndex(o => o.id === orderId)
      if (idx !== -1) this.orders[idx] = { ...this.orders[idx], ...updates }
    }
  }
})
