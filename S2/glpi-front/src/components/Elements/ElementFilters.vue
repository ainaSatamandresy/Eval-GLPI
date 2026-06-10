<!-- <template>
    <div class="filters">
        <input 
            v-model="searchText" 
            placeholder="Rechercher par nom, numero de serie ..." 
            type="search"
            class="filter-input filter-input--wide"
        >
        <select v-model="filterType" class="filter-select">
            <option value="">Tous les types</option>
            <option v-for="type in assets_type" :key="type.key" :value="type.key">{{ t.label }}</option>
        </select>
        <button v-if="hasActiveFilter" class="btn-clear" @click="$emit('clear')"> x Effacer les filtres </button>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    defineProps({searchText: String, filterType: String,assets_type: Array})
    const emit = defineEmits(['update:searchText', 'update:filterType','clear'])

    import {useVmodel} from 'vueuse/core'
    const hasActiveFilter = computed(()=>props.searchText || props.filterType)
</script> -->