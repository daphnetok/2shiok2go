import { ref, onMounted } from 'vue';
import { db } from '/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { auth } from '/firebase/auth';
import { onAuthStateChanged } from '/firebase/auth';

export function useReviewPage() {
  // Form reactive data
  const selectedOrder = ref('');
  const rating = ref(0);
  const foodQuality = ref(0);
  const service = ref(0);
  const value = ref(0);
  const reviewText = ref('');
  const uploadedPhotos = ref([]);
  const isSubmitting = ref(false);
  
  // Data
  const recentOrders = ref([]);
  const recentReviews = ref([]);
  const selectedPhoto = ref(null);
  
  // Rating methods
  const setRating = (stars) => {
    rating.value = stars;
  };
  
  const setFoodQuality = (stars) => {
    foodQuality.value = stars;
  };
  
  const setService = (stars) => {
    service.value = stars;
  };
  
  const setValue = (stars) => {
    value.value = stars;
  };
  
  // Photo handling
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedPhotos.value.push({
            file: file,
            url: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };
  
  const removePhoto = (index) => {
    uploadedPhotos.value.splice(index, 1);
  };
  
  // Review submission
  const submitReview = async () => {
    if (!selectedOrder.value || !rating.value || !reviewText.value.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    isSubmitting.value = true;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to submit a review');
        return;
      }
      
      // Find the selected order details
      const order = recentOrders.value.find(o => o.id === selectedOrder.value);
      if (!order) {
        alert('Selected order not found');
        return;
      }
      
      // Prepare review data
      const reviewData = {
        orderId: selectedOrder.value,
        hawkerName: order.hawkerName,
        hawkerId: order.hawkerId,
        reviewerId: user.uid,
        reviewerName: user.displayName || 'Anonymous User',
        rating: rating.value,
        foodQuality: foodQuality.value,
        service: service.value,
        value: value.value,
        text: reviewText.value.trim(),
        photos: uploadedPhotos.value.map(photo => photo.url),
        date: new Date(),
        createdAt: new Date()
      };
      
      // Add review to Firestore
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Reset form
      selectedOrder.value = '';
      rating.value = 0;
      foodQuality.value = 0;
      service.value = 0;
      value.value = 0;
      reviewText.value = '';
      uploadedPhotos.value = [];
      
      // Refresh reviews
      await loadRecentReviews();
      
      alert('Review submitted successfully! Thank you for your feedback.');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Load recent orders for the current user
  const loadRecentOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      // This would typically come from your orders collection
      // For now, we'll create some mock data
      recentOrders.value = [
        {
          id: 'order1',
          hawkerName: 'Chicken Rice Stall',
          hawkerId: 'hawker1',
          date: '2024-01-15',
          items: ['Chicken Rice', 'Soup']
        },
        {
          id: 'order2',
          hawkerName: 'Laksa Stall',
          hawkerId: 'hawker2',
          date: '2024-01-14',
          items: ['Katong Laksa']
        },
        {
          id: 'order3',
          hawkerName: 'Nasi Lemak Stall',
          hawkerId: 'hawker3',
          date: '2024-01-13',
          items: ['Nasi Lemak', 'Fried Chicken']
        }
      ];
      
      // In a real implementation, you would query your orders collection:
      // const ordersQuery = query(
      //   collection(db, 'orders'),
      //   where('userId', '==', user.uid),
      //   orderBy('createdAt', 'desc'),
      //   limit(10)
      // );
      // const ordersSnapshot = await getDocs(ordersQuery);
      // recentOrders.value = ordersSnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));
      
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };
  
  // Load recent reviews
  const loadRecentReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      recentReviews.value = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('Error loading recent reviews:', error);
      // For demo purposes, add some mock reviews
      recentReviews.value = [
        {
          id: 'review1',
          hawkerName: 'Chicken Rice Stall',
          reviewerName: 'John Doe',
          rating: 5,
          foodQuality: 5,
          service: 4,
          value: 5,
          text: 'Amazing chicken rice! The meat was tender and the rice was perfectly cooked. Great value for money.',
          date: new Date('2024-01-15'),
          photos: []
        },
        {
          id: 'review2',
          hawkerName: 'Laksa Stall',
          reviewerName: 'Jane Smith',
          rating: 4,
          foodQuality: 4,
          service: 5,
          value: 4,
          text: 'Delicious laksa with rich coconut broth. The service was excellent and very friendly.',
          date: new Date('2024-01-14'),
          photos: []
        }
      ];
    }
  };
  
  // Utility functions
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const openPhotoModal = (photoUrl) => {
    selectedPhoto.value = photoUrl;
  };
  
  const closePhotoModal = () => {
    selectedPhoto.value = null;
  };
  
  // Initialize data on component mount
  onMounted(async () => {
    await loadRecentOrders();
    await loadRecentReviews();
  });
  
  return {
    // Form data
    selectedOrder,
    rating,
    foodQuality,
    service,
    value,
    reviewText,
    uploadedPhotos,
    isSubmitting,
    
    // Data
    recentOrders,
    recentReviews,
    selectedPhoto,
    
    // Methods
    setRating,
    setFoodQuality,
    setService,
    setValue,
    handlePhotoUpload,
    removePhoto,
    submitReview,
    formatDate,
    openPhotoModal,
    closePhotoModal
  };
}
