import {
  AuthStoreContext,
  ChatUiStoreContext,
  NotificationStoreContext,
} from './storeContext.js'

const StoreProvider = ({
  authStore,
  chatUiStore,
  notificationStore,
  children,
}) => (
  <AuthStoreContext.Provider value={authStore}>
    <ChatUiStoreContext.Provider value={chatUiStore}>
      <NotificationStoreContext.Provider value={notificationStore}>
        {children}
      </NotificationStoreContext.Provider>
    </ChatUiStoreContext.Provider>
  </AuthStoreContext.Provider>
)

export default StoreProvider
