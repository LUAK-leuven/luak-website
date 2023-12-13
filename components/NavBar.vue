<script setup></script>

<template>
  <div class="flex justify-center top-3 z-50 w-full fixed">
    <div class="navbar bg-base-200 w-11/12 rounded-md">
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost p-1">
          <NuxtImg src="/luak-logo.png" class="h-full" />
        </NuxtLink>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><NuxtLink to="/news">News</NuxtLink></li>
          <li><NuxtLink>Calendar</NuxtLink></li>
          <li>
            <details>
              <summary>Info</summary>
              <ul class="p-2 bg-base-200 rounded-t-none">
                <li><NuxtLink>Becoming a member</NuxtLink></li>
                <li><NuxtLink>Rules & regulations</NuxtLink></li>
                <li><NuxtLink>Gear rental</NuxtLink></li>
              </ul>
            </details>
          </li>
          <li><NuxtLink>Contact</NuxtLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>
