import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import { NotificationProvider } from "@modules/common/context/notification-context"
import UndoNotification from "@modules/common/components/undo-notification"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <Nav />
        <UndoNotification />
        <main className="relative">
          {props.children}
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  )
}
