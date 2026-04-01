<template>
  <article class="page <%= name.kebab %>-page">
    <header>
      <h1>{{ $t('<%= name.lower %>.header') }}</h1>
    </header>
    <section class="page-content">
      <slot></slot>
    </section>
  </article>
</template>

<script setup>
import { onMounted } from 'vue';

defineOptions({
  name: '<%= name.capital %>Page'
});

onMounted(() => {
  console.log('<%= name.capital %>Page mounted.');
});
</script>

<style scoped>
.<%= name.kebab %>-page {
  padding: 16px;
  color: var(--text-primary);
}

.page-content {
  margin-top: 16px;
}
</style>
