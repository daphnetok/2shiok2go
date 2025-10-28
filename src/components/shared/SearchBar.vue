<!-- need to change pic and ensure it stays in same place even when screen size changes -->
<template>
    <div class="search-container">
      <div class="search-box">
        <i class="fa-solid fa-search search-icon"></i>
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
  display: flex;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px;
  width: 100%;
}

.search-box:hover {
  box-shadow: 0px 0px 10px 4px rgba(0, 128, 0, 0.6); /* Green box-shadow */
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
  color: #509180;  /* Icon color */
}


</style>