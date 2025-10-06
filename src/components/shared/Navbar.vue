<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
    <div class="container-fluid">
      <router-link class="navbar-brand fw-bold text-success" to="/">
        2Shiok2Go
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/buyer-listings">Buyer Listings</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/create-listing">Create Listing</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/hawker-dashboard">Hawker Dashboard</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/buyer-dashboard">Buyer Dashboard</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/login">Login</router-link></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default { name: "Navbar" };
</script>

<style scoped>
.navbar-brand {
  font-size: 1.4rem;
}
.nav-link {
  margin-left: 1rem;
}
</style>
