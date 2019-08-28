import colors from 'vuetify/es5/util/colors'

const config = { // needs to be ES6 module so it can be imported by webpack
  backend: {
    type: 'firebase',
    key: 'AIzaSyC3FxfpYywy5ZYpiWuf9nw8_vlbxibpQH8',
    project: 'techradar-f5834',
    categories: ['Tools', 'Techniques', 'Platforms', 'Frameworks'], // quadrant 1-4
    levels: ['Novice', 'Intermediate', 'Advanced', 'Veteran'], // should be 0 - 3 for tech radar, 4 for in use, 5 for no longer in use
    // personal proficiency level https://hr.nih.gov/working-nih/competencies/competencies-proficiency-scale
    title: 'Andreas\' technical skills' // title showing in the application titlebar
  },
  editPermissions: user => user.roles.admin || user.roles.editor,
  routes: [ // configure name, permissions & viewports
    // do NOT change the view property as this links to the vue component and is used for lookups across the app
    { view: 'List', icon: 'list', title: 'Blips', path: '/list/:search?', validator: user => true, location: ['toolbar'] },
    { view: 'Radar', icon: 'track_changes', title: 'Radar', path: '/', validator: user => true, location: ['toolbar'] },
    { view: 'Logout', icon: 'exit_to_app', title: 'Logout', path: '/logout', validator: user => user.uid, location: ['toolbar-menu'] },
    { view: 'Users', icon: 'people', title: 'Users', path: '/users', validator: user => user.uid && user.roles.admin, location: ['toolbar-menu'] },
    { view: 'Login', icon: 'meeting_room', title: 'Login', path: '/login', validator: user => !user.uid, location: ['toolbar-menu'] },
    { view: 'Settings', icon: 'settings', title: 'Settings', path: '/settings', validator: user => user.uid && user.roles.admin, location: ['toolbar'] }
  ],
  navEntries: [
    { icon: 'info', title: 'About Me', url: '//anoff.io', validator: user => true }
  ],
  theme: {
    primary: '#cc0033',
    secondary: colors.blue.darken1,
    accent: '#cc0033',
    error: colors.red.base,
    warning: colors.yellow.base,
    info: colors.blue.base,
    success: colors.green.base
  },
  darkMode: true,
  blips: {
    titleCutOff: 20 // cut off title after N characters (display only)
  }
}

// precalculate some properties for later
config.routes = config.routes
  .map(i => {
    // path property without a potential query param
    Object.assign(i, { rootPath: i.path.split(':')[0] })
    return i
  })

export default config
