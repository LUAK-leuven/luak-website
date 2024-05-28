<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
<span v-if="user">Hi {{ user.user_metadata.firstName }}</span>
<span v-else> Not Logged in yet</span>
</template>
