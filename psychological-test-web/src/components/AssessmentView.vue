<template>
	<div>
		<AssessmentSection />
		<CallToAction />
	</div>
</template>

<script setup>
import { useAssessmentStore } from '@/stores/assessment'
import AssessmentSection from './AssessmentSection.vue'
import CallToAction from './CallToAction.vue'

const store = useAssessmentStore()
</script>