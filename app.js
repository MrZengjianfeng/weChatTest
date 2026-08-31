import { getToken } from './utils/auth'
import { userStore } from './stores/user'

App({
  onLaunch() {
    userStore.setLoggedIn(!!getToken())
  },
})
