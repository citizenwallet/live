import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { APActor } from 'activitypub-types';

// Données fictives pour les membres
const members = [
  { id: 1, name: "Alice Martin", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 2, name: "Bob Johnson", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 3, name: "Charlie Brown", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 4, name: "Diana Smith", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 5, name: "Ethan Davis", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 6, name: "Fiona Wilson", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 7, name: "George Taylor", avatar: "/placeholder.svg?height=100&width=100" },
  { id: 8, name: "Hannah Clark", avatar: "/placeholder.svg?height=100&width=100" },
  // Ajoutez autant de membres que nécessaire
]

export default function Avatars(items: APActor[], props: any) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{props.title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.length && items.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-2">
              {/*<AvatarImage icons={member.icon} alt={member.name} />*/}
              <AvatarFallback>{member.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-center">{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
