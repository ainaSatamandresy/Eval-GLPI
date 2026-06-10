import {ref ,computed} from 'vue'
import { glpiApi } from '../services/glpiApi.js'

// Icons removed to keep select options clean (UI-only change)
const assets_types = [
    {key:'Computer',label:'Ordinateurs'},
    {key:'Monitor',label:'Moniteurs'},
    {key:'NetworkEquipment',label:'Réseau'},
    {key:'Printer',label:'Imprimantes'},
    {key:'Phone',label:'Téléphones'},
    {key:'Software',label:'Logiciels'},   
]

export function useElements(){
    const allItems = ref([])
    const loading = ref(false)
    const error = ref(null)

    const searchText = ref('')
    const filterType = ref('')
    const filterLocation = ref('')
    const filterState = ref('')

    async function loadAll() {
        loading.value = true
        error.value = null 
        allItems.value = []

        const results = await Promise.allSettled(
            assets_types.map(async({key,label,icon})=>{
                const items = await glpiApi.getItems(key,{
                    range: '0-499',
                    sort: 'name',
                    order: 'ASC'
                }) 
                return items.map((item)=>({...item,_type: key,_typeLabel: label,_icon:icon}))
            })
        )

        allItems.value = results
        .filter((r)=>r.status ==='fulfilled')
        .flatMap((r)=>r.value)

        loading.value = false
    }

    const filteredItems = computed(()=>{
        let list = allItems.value

        if(filterType.value){
            list = list.filter((i)=>i._type === filterType.value)
        }

        if(searchText.value.trim()){
            const q = searchText.value.toLowerCase()
            list = list.filter((i)=>
                (i.name ?? '').toLowerCase().includes(q) ||
                (i.serial ?? '').toLowerCase().includes(q) ||
                (i.comment ?? '').toLowerCase().includes(q) 
            )
        }

        if (filterLocation.value){
            list = list.filter((i)=>
                String (i.locations_id) === filterLocation.value ||
                (i.location_name ??'').toLowerCase().includes(filterLocation.value.toLowerCase())
            )
        }

        return list;
    })

    function clearFilters(){
        searchText.value = ''
        filterType.value = ''
        filterLocation.value = ''
        filterState.value = ''
    }

    return {
        allItems,filteredItems,loading,error,
        searchText,filterType,filterLocation,filterState,
        loadAll,clearFilters,assets_types
    }
}