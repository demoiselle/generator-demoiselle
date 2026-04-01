<template>
  <div class="<%= name.kebab %>-component">
    <h2>{{ $t('<%= name.lower %>.title') }}</h2>
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

defineOptions({
  name: '<%= name.capital %>Component'
});

onMounted(() => {
  console.log('<%= name.capital %>Component mounted.');
});
</script>

<style scoped>
.<%= name.kebab %>-component {
  padding: 16px;
  color: var(--text-primary);
}
</style>
