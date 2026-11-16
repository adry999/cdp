<script setup lang="ts">
// The inverted block that ends a page with one way to reach the studio: a heading, one sentence and
// a signal button. The button opens the contact dialog in place (or the qualifier when its flag is
// on, see useContactTrigger); its href is the no-JS path. No stage or service is preselected.
defineProps<{ title: string; body: string; button: string }>()

const contact = useContactTrigger()
</script>

<template>
  <SiteSection inverted>
    <h2 class="m-0 max-w-[24ch] heading-display">
      {{ title }}
    </h2>
    <p class="m-0 mt-5 max-w-[56ch] text-lead text-body-ink">
      {{ body }}
    </p>
    <div class="mt-7">
      <AppButton
        variant="signal"
        :href="contact.href.value"
        :aria-haspopup="contact.opensDialog.value ? 'dialog' : undefined"
        @click.capture="contact.open($event)"
      >
        {{ button }}
      </AppButton>
    </div>
  </SiteSection>
</template>
