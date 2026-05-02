import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import PushNotificationListener from "@/components/PushNotificationListener";
import LoginPage from "@/app/login/page";
import JoinPage from "@/app/join/page";
import DashboardPage from "@/app/page";
import AdminPage from "@/app/admin/page";
import SettingsPage from "@/app/settings/page";
import HistoryPage from "@/app/history/page";
import ChatPage from "@/app/chat/page";
import ShoppingPage from "@/app/shopping/page";
import PersonalPage from "@/app/personal/page";
import FeedbackPage from "@/app/feedback/page";
import NotFound from "@/pages/not-found";
import "@/app/globals.css";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/join" component={JoinPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/shopping" component={ShoppingPage} />
        <Route path="/personal" component={PersonalPage} />
        <Route path="/feedback" component={FeedbackPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
      <PushNotificationListener />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
