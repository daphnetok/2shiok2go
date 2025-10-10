<template>
  <nav class="navbar navbar-dark bg-dark shadow-sm sticky-top border-bottom border-success">
    <div class="container-fluid">
      <button
        class="btn btn-outline-success me-2"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarNav"
        aria-controls="sidebarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <router-link class="navbar-brand fw-bold text-success" to="/">
        2Shiok2Go
      </router-link>
    </div>
  </nav>

  <div
    class="offcanvas offcanvas-start"
    tabindex="-1"
    id="sidebarNav"
    aria-labelledby="sidebarNavLabel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title text-success" id="sidebarNavLabel">2Shiok2Go Menu</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <ul class="nav flex-column">
        <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/buyer-listings">Buyer Listings</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/create-listing">Create Listing</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/hawker-dashboard">Hawker Dashboard</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/buyer-dashboard">Buyer Dashboard</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/login">Login</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default { name: "Navbar" };
</script>

<style scoped>
.navbar-brand {
  font-size: 1.4rem;
}
.nav-link {
  margin-bottom: 1rem;
  color: #198754;
  font-weight: 500;
}
.nav-link.router-link-active {
  background: #e9fbe5;
  color: #145c2a;
  border-radius: 5px;
}
.offcanvas-title {
  font-size: 1.2rem;
}
</style>
