import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ModeToggle } from "./mode-toggle";
// import { CreateProjectForm } from "./create-project-form";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({
    email: '',
    name: '',
    picture:''
  });
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Projects",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/projects",
    },
    {
      title: "Your Work",
      icon: <ListTodo className="h-5 w-5" />,
      href: "/my-work",
    },
    { title: "Team", 
      icon: <Users className="h-5 w-5" />, 
      href: "/team" },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/me");
        const {user} = await response.json();

        console.log("User data:", user);
        setUser({email: user.email, name: user.name, picture: user.picture});
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div
      className={`flex h-screen flex-col border-r bg-background transition-all duration-300 ${
        collapsed ? "w-16" : "w-80"
      }`}
    >
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-neutral-800 p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M22 12.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.5" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <circle cx="18" cy="18" r="3" />
                <path d="m21 21-1.5-1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold">Sphere</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={collapsed ? "ml-0" : "ml-auto"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Link
              key={index+1}
              to={item.href}
              className={`flex h-10 items-center rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground ${
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : ""
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-4 px-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className={collapsed ? "w-10 px-0" : "w-full"}>
                <Plus className="h-4 w-4" />
                {!collapsed && <span className="ml-2">New Project</span>}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              {/* <CreateProjectForm /> */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-auto border-t p-2">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.picture} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <Avatar className="h-8 w-8 mx-auto">
              <AvatarImage src={user.picture} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          )}
          {!collapsed && <ModeToggle />}
        </div>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <ModeToggle />
          </div>
        )}
      </div>
    </div>
  );
}
