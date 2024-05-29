<template>
  <div class="responsive-iframe-container">
    <iframe
      src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FBrussels&showTabs=0&showTitle=0&showPrint=0&showCalendars=0&src=bmhsNGlmbXJpczlvZXB0OGloYTB2ZTI2anNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23EF6C00"
      style="border-width: 0"
      frameborder="0"
      scrolling="no"
    />
  </div>
</template>
<style>
/* Responsive iFrame */

.responsive-iframe-container {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  min-height: 30rem;
  overflow: hidden;
}

.responsive-iframe-container iframe,
.vresponsive-iframe-container object,
.vresponsive-iframe-container embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
