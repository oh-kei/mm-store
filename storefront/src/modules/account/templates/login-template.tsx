"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplateContent = () => {
  const searchParams = useSearchParams()
  const initialView = searchParams.get("mode") === "register" ? "register" : "sign-in"
  const [currentView, setCurrentView] = useState(initialView)

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

const LoginTemplate = () => {
  return (
    <Suspense fallback={<div className="w-full min-h-[50vh] flex items-center justify-center">Loading...</div>}>
      <LoginTemplateContent />
    </Suspense>
  )
}

export default LoginTemplate
