<template>
  <div id="nav">
    <router-link to="/count">计数器</router-link> |
    <router-link to="/cart">购物车</router-link> |
    <router-link to="/about">关于</router-link>
  </div>
  <router-view />
</template>
<style>
#nav {
  padding: 30px;
}
#nav a {
  font-weight: bolder;
  color: #2c3e50;
}
#nav .router-link-exact-active {
  color: #42b983;
}
</style>
