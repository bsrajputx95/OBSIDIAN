"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";
import Link from "next/link";

export function AuthForm() {
  const { user, error, loginWithUsername, loginWithEmail, registerWithUsername, registerWithEmail, guestLogin, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Login / Register</h2>
        <Link href="/" className="text-sm underline text-muted-foreground">Back to App</Link>
      </div>
      <Card className="p-4">
        <Tabs defaultValue="login-username">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="login-username">Login (Username)</TabsTrigger>
            <TabsTrigger value="login-email">Login (Email)</TabsTrigger>
            <TabsTrigger value="register-username">Register (Username)</TabsTrigger>
            <TabsTrigger value="register-email">Register (Email)</TabsTrigger>
          </TabsList>

          <TabsContent value="login-username" className="space-y-3 pt-3">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={() => loginWithUsername(username, password)}>Login</Button>
          </TabsContent>

          <TabsContent value="login-email" className="space-y-3 pt-3">
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={() => loginWithEmail(email, password)}>Login</Button>
          </TabsContent>

          <TabsContent value="register-username" className="space-y-3 pt-3">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={() => registerWithUsername(username, password)}>Register</Button>
          </TabsContent>

          <TabsContent value="register-email" className="space-y-3 pt-3">
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={() => registerWithEmail(email, password)}>Register</Button>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Quick Access</div>
          <div className="text-sm">{user ? `Logged in as ${user.username ?? user.email}` : "Not logged in"}</div>
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </div>
        <div className="space-x-2">
          {!user && <Button variant="outline" onClick={() => guestLogin()}>Guest Login</Button>}
          {user && <Button variant="outline" onClick={() => logout()}>Logout</Button>}
        </div>
      </Card>
    </div>
  );
}