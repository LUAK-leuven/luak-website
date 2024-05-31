<script setup lang="ts"></script>

<template>
  <button class="btn btn-primary" onclick="buy_membership_modal.showModal()">
    Buy a membership
  </button>
  <dialog id="buy_membership_modal" class="modal modal-bottom md:modal-middle">
    <div class="modal-box bg-base-100 text-black">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <h2>Buy a membership for 2024</h2>
      <UserBuyMembershipForm />
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
        <button class="btn btn-primary">buy</button>
      </div>
    </div>
  </dialog>
</template>
