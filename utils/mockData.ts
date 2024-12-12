export const mockEvents = [
  {
    id: 1,
    title: "Community Meetup",
    date: "2024-03-15",
    time: "18:00",
    location: "Main Hall",
    image: "/placeholder.svg?height=100&width=100",
    activitypub: {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Event",
      "name": "Community Meetup",
      "startTime": "2024-03-15T18:00:00Z",
      "location": {
        "type": "Place",
        "name": "Main Hall"
      },
      "summary": "Join us for our monthly community meetup!",
      "image": {
        "type": "Image",
        "url": "/placeholder.svg?height=100&width=100"
      },
    }
  },
  {
    id: 2,
    title: "Workshop: Sustainable Living",
    date: "2024-03-18",
    time: "14:00",
    location: "Green Space",
    image: "/placeholder.svg?height=100&width=100",
    activitypub: {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Event",
      "name": "Workshop: Sustainable Living",
      "startTime": "2024-03-18T14:00:00Z",
      "location": {
        "type": "Place",
        "name": "Green Space"
      },
      "summary": "Learn practical tips for sustainable living in our community.",
      "image": {
        "type": "Image",
        "url": "/placeholder.svg?height=100&width=100"
      },
    }
  },
  {
    id: 3,
    title: "Movie Night",
    date: "2024-03-20",
    time: "20:00",
    location: "Outdoor Theater",
    image: "/placeholder.svg?height=100&width=100",
    activitypub: {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Event",
      "name": "Movie Night",
      "startTime": "2024-03-20T20:00:00Z",
      "location": {
        "type": "Place",
        "name": "Outdoor Theater"
      },
      "summary": "Join us for an outdoor screening under the stars!",
      "image": {
        "type": "Image",
        "url": "/placeholder.svg?height=100&width=100"
      },
    }
  },
  {
    id: 4,
    title: "Farmers Market",
    date: "2024-03-22",
    time: "09:00",
    location: "Town Square",
    image: "/placeholder.svg?height=100&width=100",
    activitypub: {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Event",
      "name": "Farmers Market",
      "startTime": "2024-03-22T09:00:00Z",
      "location": {
        "type": "Place",
        "name": "Town Square"
      },
      "summary": "Fresh local produce and handmade goods at our weekly farmers market.",
      "image": {
        "type": "Image",
        "url": "/placeholder.svg?height=100&width=100"
      },
    }
  },
  {
    id: 5,
    title: "Yoga in the Park",
    date: "2024-03-24",
    time: "07:00",
    location: "Central Park",
    image: "/placeholder.svg?height=100&width=100",
    activitypub: {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Event",
      "name": "Yoga in the Park",
      "startTime": "2024-03-24T07:00:00Z",
      "location": {
        "type": "Place",
        "name": "Central Park"
      },
      "summary": "Start your day with a refreshing yoga session in the park.",
      "image": {
        "type": "Image",
        "url": "/placeholder.svg?height=100&width=100"
      },
    }
  },
];

export const mockContributions = [
  { id: 1, user: "Alice Johnson", type: "Volunteer Hours", amount: "5 hours", project: "Community Garden" },
  { id: 2, user: "Bob Smith", type: "Donation", amount: "$100", project: "Youth Center" },
  { id: 3, user: "Carol White", type: "Skill Share", amount: "Web Design Workshop", project: "Digital Literacy" },
  { id: 4, user: "David Brown", type: "Resource", amount: "20 Books", project: "Public Library" },
  { id: 5, user: "Eva Green", type: "Volunteer Hours", amount: "3 hours", project: "Elder Care" },
];

