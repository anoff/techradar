import colors from 'vuetify/es5/util/colors'

const config = { // needs to be ES6 module so it can be imported by webpack
  backend: {
    type: process.env.VUE_APP_BACKEND_TYPE || 'testVolatile',
    project: process.env.VUE_APP_BACKEND_PROJECT,
    authDomain: 'auth.firebase.devradar.io',
    key: process.env.VUE_APP_BACKEND_KEY
  },
  routes: [ // configure name, permissions & view ports
    { name: 'home', icon: 'home', title: 'Home', path: '/', validator: () => true, location: ['toolbar'], props: null },
    { name: 'logout', icon: 'exit_to_app', title: 'Logout', path: '/logout', validator: user => user.uid, location: ['toolbar-menu'] },
    { name: 'users', icon: 'people', title: 'Users', path: '/users', validator: user => user.uid && user.roles.admin, location: ['toolbar-menu'] },
    { name: 'error', icon: '', title: 'unlisted', path: '/wtf/:errorCode', validator: () => true, location: [] },
    { name: 'radar', icon: 'track_changes', title: 'Me', path: '/@:radarId/:mode?', validator: () => true, location: ['toolbar'] } // due to the wildcard URL this should be the last entry
  ],
  navEntries: [
    { name: 'login', icon: 'meeting_room', title: 'Login', action: app => (app.loginModalVisible = true), validator: user => !user.uid, location: ['toolbar'] },
    { name: 'help', icon: 'help', title: 'Help', url: '//docs.devradar.io/about', validator: () => true, location: ['toolbar-menu'] }
  ],
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#0DBD0D',
        secondary: '#ff7700',
        accent: '#0ddd0d',
        error: colors.red.base,
        warning: colors.yellow.base,
        info: colors.blue.base,
        success: colors.green.base
      }
    }
  },
  blips: {
    titleCutOff: 20 // cut off title after N characters (display only)
  },
  googleAnalytics: {
    enabled: false,
    id: 'UA-XYZ'
  },
  footer: [
    {
      text: 'by Andreas Offenhaeuser',
      link: '//anoff.io'
    },
    {
      text: 'Blog',
      link: '//blog.anoff.io'
    },
    {
      text: 'Legal',
      link: '//anoff.github.io/legal'
    }
  ],
  radarDefault: {
    categories: ['Tools', 'Techniques', 'Platforms', 'Frameworks'],
    levels: ['Novice', 'Intermediate', 'Advanced', 'Veteran'],
    isPublic: true
  },
  isUnderTest: (!!(window as any).Cypress)
}

// precalculate some properties for later
config.routes = config.routes
  .map(i => {
    (i as any).rootPath = i.path.split(':')[0] // path property without a potential query param
    return i
  })

export default config
