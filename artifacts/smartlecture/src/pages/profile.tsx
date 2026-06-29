import { useGetProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Profile() {
  const { data: profile } = useGetProfile();

  const user = profile || {
    name: "Alex Student",
    email: "alex@university.edu",
    bio: "Computer Science major. Love learning about AI and algorithms.",
    avatar: "",
    level: 5,
    xp: 2450
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 pt-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-chart-2 text-white font-bold text-sm px-3 py-1 rounded-full shadow-sm border-2 border-background">
            Lvl {user.level}
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-1">{user.name}</h1>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          <p className="text-sm bg-muted p-4 rounded-xl border border-border">{user.bio || "No bio added yet."}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="font-bold text-xl mb-6">Edit Profile</h2>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user.name} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" defaultValue={user.bio ?? ""} className="bg-background min-h-[100px]" />
          </div>
          <Button type="button" size="lg" className="w-full md:w-auto">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
