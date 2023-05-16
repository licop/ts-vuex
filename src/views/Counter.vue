<template>
  <div id="app">
    Clicked: {{ count }} times, count is {{ evenOrOdd }}.
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from '../vuex4/index'

export default {
  setup () {
    const store = useStore()
    console.log(store.state, 18)
    
    onMounted(() => {
      // store.commit("Count/increment")
      store.dispatch("Count/increment")
    })
    return {
      count: computed(() => store.state.Count.count),
      evenOrOdd: computed(() => store.getters['Count/evenOrOdd']),
      increment: () => store.dispatch('Count/increment'),
      decrement: () => store.dispatch('Count/decrement'),
      incrementIfOdd: () => store.dispatch('Count/incrementIfOdd'),
      incrementAsync: () => store.dispatch('Count/incrementAsync')
    }
  }
}
</script>
