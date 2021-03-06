<template>
  <v-container
    fluid
    grid-list-lg>
    <new-blip v-if="userCanEdit"></new-blip>
    <new-change
      @submit="newChangeSubmit"
      @cancel="newChangeCancel"
    ></new-change>
    <v-row justify="space-around">
      <v-col cols="12" sm="5" md="4">
        <v-text-field
          v-model="searchTitle"
          label="Search.."
          @input="searchUpdated"
          clearable
          prepend-icon="search"
        >
        </v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-slider
          v-model="maxMonths"
          thumb-label
          hint="Only show recently updated blips, 0 to disable"
          label="Latest change"
          :max="12"
        ></v-slider>
      </v-col>
    </v-row>
    <v-row justify="space-between">
      <v-col cols="12" lg="6" xl="4"
        data-cy="blipsList"
        v-for="blip in filteredBlips" :key="blip.id">
        <blip
          :blip="blip"
          @addChange="newChangeOpen"
        >
        </blip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import NewBlip from './NewBlip.vue'
import NewChange from './NewChange.vue'
import BlipComponent from './Blip.vue'
import router from '@/router'
import { Blip, BlipChange, User } from '@/types/domain'

@Component({
  components: {
    NewBlip,
    NewChange,
    Blip: BlipComponent
  },
  computed: {

    blips () {
      const blips = this.$store.getters['blips/blipsWithIndex']
      return blips
    },
    filteredBlips () {
      const blips = this.blips
      return blips
        .filter(blip => new RegExp(this.searchTitle || '', 'i').exec(blip.title))
        .map(b => {
          b.changes = b.changes.sort((a, b) => a.date < b.date)
          return b
        })
        .filter(b => {
          if (!this.maxMonths) return true
          const bDate = new Date(b.changes[0].date)
          const now = new Date()
          const age = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth())
          if (age <= this.maxMonths) return true
          return false
        })
        .sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase())
    },
    ...mapGetters('blips', [
      'isLoading', 'ownerId'
    ]),
    ...mapGetters('user', [
      'user', 'userCanEdit'
    ])
  }
})
export default class List extends Vue {
  @Prop({ default: '' })
  radarId: string

  newChangeBlip: Blip
  searchTitle = ''
  maxMonths = 0
  newChangeModalVisible = false

  // computed
  blips: Blip[]
  userCanEdit: boolean
  filteredBlips: Blip[]
  isLoading: boolean
  ownerId: string
  user: User

  searchUpdated () : void {
    if (this.searchTitle) {
      router.replace({ path: `/@${this.radarId}/history`, query: { q: this.searchTitle } })
    } else {
      router.replace({ path: `/@${this.radarId}/history` })
    }
  }

  newChangeOpen (blipId : string) : void {
    this.newChangeBlip = this.blips.find(b => b.id === blipId)
    this.newChangeModalVisible = true
    this.$store.dispatch('intro/event', 'blip-history-open')
  }

  newChangeSubmit (change: BlipChange) : void {
    this.$store.dispatch('blips/addChange', { blip: this.newChangeBlip, change })
    this.newChangeModalVisible = false
    this.newChangeBlip = null
  }

  newChangeCancel () : void {
    this.newChangeBlip = null
    this.newChangeModalVisible = false
  }

  mounted () : void {
    if (!this.isLoading) {
      this.$store.dispatch('blips/getRadarLazy', this.radarId)
    }
    this.$store.dispatch('intro/event', 'list-loaded')
    if (this.userCanEdit) {
      this.$store.dispatch('intro/event', 'list-editable')
    }
    this.searchTitle = this.$route.query.q as string || '' // populate blip search with URL query parameters ?q=sauce
  }

  @Watch('isLoading')
  onDoneLoading (_oldValue: boolean, newValue: boolean) : void {
    if (newValue === true) {
      this.$store.dispatch('blips/getRadarLazy', this.radarId)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
