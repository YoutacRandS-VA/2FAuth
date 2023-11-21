import { createRouter, createWebHistory } from 'vue-router'
import middlewarePipeline from "@/router/middlewarePipeline";
import { useUserStore } from '@/stores/user'
import { useTwofaccounts } from '@/stores/twofaccounts'
import { useAppSettingsStore } from '@/stores/appSettings'
import { useNotifyStore } from '@/stores/notify'

import authGuard    from './middlewares/authGuard'
import starter      from './middlewares/starter'
import noEmptyError from './middlewares/noEmptyError'
import noRegistration from './middlewares/noRegistration'
import setReturnTo  from './middlewares/setReturnTo'

const router = createRouter({
	history: createWebHistory('/'),
	routes: [
		{ path: '/start', name: 'start', component: () => import('../views/Start.vue'), meta: { middlewares: [authGuard, setReturnTo] } },
        { path: '/capture', name: 'capture', component: () => import('../views/twofaccounts/Capture.vue'), meta: { middlewares: [authGuard, setReturnTo] } },

        { path: '/accounts', name: 'accounts', component: () => import('../views/twofaccounts/Accounts.vue'), meta: { middlewares: [authGuard, starter, setReturnTo] }, alias: '/' },
        { path: '/account/create', name: 'createAccount', component: () => import('../views/twofaccounts/CreateUpdate.vue'), meta: { middlewares: [authGuard, setReturnTo] } },
        { path: '/account/import', name: 'importAccounts', component: () => import('../views/twofaccounts/Import.vue'), meta: { middlewares: [authGuard, setReturnTo] } },
        { path: '/account/:twofaccountId/edit', name: 'editAccount', component: () => import('../views/twofaccounts/CreateUpdate.vue'), meta: { middlewares: [authGuard, setReturnTo] }, props: true },
        { path: '/account/:twofaccountId/qrcode', name: 'showQRcode', component: () => import('../views/twofaccounts/QRcode.vue'), meta: { middlewares: [authGuard, setReturnTo] } },

        { path: '/groups', name: 'groups', component: () => import('../views/groups/Groups.vue'), meta: { middlewares: [authGuard, setReturnTo] }, props: true },
        { path: '/group/create', name: 'createGroup', component: () => import('../views/groups/CreateUpdate.vue'), meta: { middlewares: [authGuard, setReturnTo] } },
        { path: '/group/:groupId/edit', name: 'editGroup', component: () => import('../views/groups/CreateUpdate.vue'), meta: { middlewares: [authGuard, setReturnTo] }, props: true },

        { path: '/settings/options', name: 'settings.options', component: () => import('../views/settings/Options.vue'), meta: { middlewares: [authGuard], showAbout: true } },
        { path: '/settings/account', name: 'settings.account', component: () => import('../views/settings/Account.vue'), meta: { middlewares: [authGuard], showAbout: true } },
        { path: '/settings/oauth', name: 'settings.oauth.tokens', component: () => import('../views/settings/OAuth.vue'), meta: { middlewares: [authGuard], showAbout: true, props: true } },
        { path: '/settings/webauthn/:credentialId/edit', name: 'settings.webauthn.editCredential', component: () => import('../views/settings/Credentials/Edit.vue'), meta: { middlewares: [authGuard], showAbout: true }, props: true },
        { path: '/settings/webauthn', name: 'settings.webauthn.devices', component: () => import('../views/settings/WebAuthn.vue'), meta: { middlewares: [authGuard], showAbout: true } },

        { path: '/login', name: 'login', component: () => import('../views/auth/Login.vue'), meta: { middlewares: [setReturnTo], disabledWithAuthProxy: true, showAbout: true } },
        { path: '/register', name: 'register', component: () => import('../views/auth/Register.vue'), meta: { middlewares: [noRegistration, setReturnTo], disabledWithAuthProxy: true, showAbout: true } },
        { path: '/password/request', name: 'password.request', component: () => import('../views/auth/RequestReset.vue'), meta: { middlewares: [setReturnTo], disabledWithAuthProxy: true, showAbout: true } },
        { path: '/user/password/reset', name: 'password.reset', component: () => import('../views/auth/password/Reset.vue'), meta: { middlewares: [setReturnTo], disabledWithAuthProxy: true, showAbout: true } },
        { path: '/webauthn/lost', name: 'webauthn.lost', component: () => import('../views/auth/RequestReset.vue'), meta: { middlewares: [setReturnTo], disabledWithAuthProxy: true, showAbout: true } },
        { path: '/webauthn/recover', name: 'webauthn.recover', component: () => import('../views/auth/webauthn/Recover.vue'), meta: { middlewares: [setReturnTo], disabledWithAuthProxy: true, showAbout: true } },

        { path: '/about', name: 'about', component: () => import('../views/About.vue'), meta: { showAbout: true } },
        { path: '/error', name: 'genericError', component: () => import('../views/Error.vue'), meta: { middlewares: [noEmptyError] } },
        { path: '/404', name: '404', component: () => import('../views/Error.vue'), props: true },
        { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('../views/Error.vue'), props: true },
	]
})

router.beforeEach((to, from, next) => {
    const middlewares = to.meta.middlewares
    const user = useUserStore()
    const twofaccounts = useTwofaccounts()
    const appSettings = useAppSettingsStore()
    const notify = useNotifyStore()
    const stores = { user: user, twofaccounts: twofaccounts, appSettings: appSettings, notify: notify }
    const nextMiddleware = {}
    const context = { to, from, next, nextMiddleware, stores }

    if (!middlewares) {
        return next();
    }

    middlewares[0]({
        ...context,
        nextMiddleware: middlewarePipeline(context, middlewares, 1),
    });
})

router.afterEach((to, from) => {
    to.meta.title = trans('titles.' + to.name)
    document.title = to.meta.title
})

export default router
