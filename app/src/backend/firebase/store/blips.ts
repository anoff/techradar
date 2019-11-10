import firebase from 'firebase/app'
import 'firebase/firestore'
import { ActionTree } from 'vuex'
import { getUUID, cleanChange, cleanBlip } from '../../../util'
import { Blip, BlipChange, Meta } from '@/types/domain'
import { RootState, BlipsState } from '@/types/vuex'

const actions = (): ActionTree<BlipsState, RootState> =>  ({
  async getRadar ({ commit, rootGetters }, id: string): Promise<void> {
    commit('setLoading', true)
    const radarSnapshot = await firebase.firestore().collection('radars').doc(id).get()
    const { categories, levels, title, isPublic = false } = radarSnapshot.data()
    commit('setMeta', { title: title || `devradar #${id}`, categories, levels })
    commit ('setIsPublic', isPublic)
    commit ('setId', id)

    // populate with blip info
    const blipSnapshot = await firebase.firestore().collection(`radars/${radarSnapshot.id}/blips`).get()
    commit('dropBlips')
    blipSnapshot.forEach(async doc => {
      // @ts-ignore type checking of docs property
      const blip = cleanBlip(doc.data())
      blip.id = doc.id // ensure that firebase._id is used
      commit('addBlip', blip)
    })
    commit('setLoading', false)
  },
  // call getRadar if the id is different from the one currently in state
  async getRadarLazy({ dispatch, rootGetters }, radarId: string): Promise<void> {
    const loadedId = rootGetters['blips/radarId']
    if (loadedId !== radarId) {
      dispatch('getRadar', radarId)
    }
  },
  async addBlip ({ commit, rootGetters }, blip: Blip): Promise<void> {
    commit('setLoading', true)
    // prepend https if nothing is there
    const user = rootGetters['user/user']
    const { title, category, level } = blip
    let { link, changes } = blip
    link = blip.link || ''
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link
    // assign IDs to changes
    changes = changes
      .map(c => {
        if (!c.id) c.id = getUUID()
        return c
      })
      .map(cleanChange)
    const newBlip = {
      title,
      category,
      link,
      level,
      changes
    }
    const setSnapshot = await firebase.firestore().collection(`radars/${user.radar}/blips`).add(newBlip)
    newBlip['id'] = setSnapshot.id
    commit('addBlip', newBlip)
    commit('setLoading', false)
  },
  async updateBlip ({ commit, rootGetters }, blip: Blip): Promise<void> {
    commit('setLoading', true)
    // create copy of the store object to remove changes array/index for firebase entry
    const user = rootGetters['user/user']
    blip.description = blip.description || ''
    blip.link = blip.link || ''
    // prepend https if nothing is there
    if (blip.link && !/^https?:\/\//i.test(blip.link)) blip.link = 'https://' + blip.link
    await firebase.firestore().collection(`radars/${user.radar}/blips`).doc(blip.id).update(cleanBlip(blip))
    commit('exchangeBlip', blip)
    commit('setLoading', false)
  },
  async deleteBlip ({ commit, rootGetters }, blip: Blip): Promise<void> {
    commit('setLoading', true)
    const user = rootGetters['user/user']
    await firebase.firestore().collection(`radars/${user.radar}/blips`).doc(blip.id).delete()
    commit('removeBlip', blip)
    commit('setLoading', false)
  },
  async setBlips({ commit, rootGetters }, blips: Blip[]): Promise<void> {
    commit('setLoading', true)
    const user = rootGetters['user/user']
    // drop entire collection of blips
    const collectionSnapshot = await firebase.firestore().collection(`radars/${user.radar}/blips`).get()
    await Promise.all(collectionSnapshot.docs.map(docSnapshot => {
      return firebase.firestore().collection(`radars/${user.radar}/blips`).doc(docSnapshot.id).delete()
    }))
    commit('dropBlips')
    // add all new blips
    await Promise.all(blips.map(b => {
      commit('addBlip', b)
      return firebase.firestore().collection(`radars/${user.radar}/blips`).add(b)
    }))
    commit('setLoading', false)
  },
  async addChange ({ commit, rootGetters }, { blip, change }: { blip: Blip; change: BlipChange }): Promise<void> {
    commit('setLoading', true)
    const user = rootGetters['user/user']
    if (!blip.changes) blip.changes = []
    const newChange = cleanChange(change)
    newChange.id = getUUID()
    blip.changes.push(newChange)
    if (blip.level) blip.level = newChange.newLevel
    await firebase.firestore().collection(`radars/${user.radar}/blips`).doc(blip.id).update(blip)
    commit('exchangeBlip', blip)
    commit('setLoading', false)
  },
  async deleteChange ({ commit, rootGetters }, { blip, change }: { blip: Blip; change: BlipChange }): Promise<void> {
    commit('setLoading', true)
    const user = rootGetters['user/user']
    blip.changes = blip.changes.filter(c => c.id !== change.id)
    await firebase.firestore().collection(`radars/${user.radar}/blips`).doc(blip.id).update(blip)
    commit('exchangeBlip', blip)
    commit('setLoading', false)
  },
  async setMeta({ commit, rootGetters }, meta: Meta): Promise<void> {
    commit('setLoading', true)
    const user = rootGetters['user/user']
    await firebase.firestore().collection(`radars`).doc(user.radar).update(meta)
    commit('setMeta', meta)
    commit('setLoading', false)
  },
  async getRadarRedirect({ commit, rootGetters }): Promise<void> {
    const user = rootGetters['user/user']
    if (!user || !user.radar) return
    const redirectSnapshot = await firebase.firestore().collection('radarRedirects').doc(user.uid)
    if (redirectSnapshot.exists) {
      console.log(redirectSnapshot)
    }
  },
  async setRadarRedirect({ commit, rootGetters }, name: string): Promise<void> {
    const user = rootGetters['user/user']
    if (!user || !user.radar) return
    const doc = {
      name
    }
    const redirectSnapshot = await firebase.firestore().collection('radarRedirects').doc(user.uid).set(doc)
  }
})

export default {
  actions
}
