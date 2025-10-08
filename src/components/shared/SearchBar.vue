<!-- need to change pic and ensure it stays in same place even when screen size changes -->
<template>
    <div class="search-container">
    <div class="search-box">
      <font-awesome-icon icon="search" class="search-icon" />
      <input type="text" placeholder="Search for Food or Location..." class="search-input" />
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchBar"}
</script>

<style scoped>

.search-container {
  width: 100%;
  display: flex;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px;
  width: 100%;
}

.search-input {
  border: none;
  outline: none;
  padding: 8px;
  width: 100%;
  border-radius: 20px;
  font-size: 14px;
}

.search-icon {
  margin-left: 2%;  /* Adjust space between icon and input text */
  font-size: 18px; /* Adjust the size of the icon */
  color: #888;  /* Icon color */
}

</style>