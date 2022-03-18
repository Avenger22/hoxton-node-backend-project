import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const users = [
  {
    id: 1,
    firstName: 'Jurgen',
    lastName:  'Hasmeta',
    userName:  'avenger22',
    birthday:  '22/12/1997',
    phoneNumber: '06933344123',
    email: 'jurgenhasmeta@email.com',
    password: bcrypt.hashSync("jurgen123", 8),
    createdAt: 'eoje',
    updatedAt: 'eo'
  },
  {
    id: 1,
    firstName: 'Egon',
    lastName:  'Loli',
    userName:  'egon12',
    birthday:  '20/11/1996',
    phoneNumber: '06723344123',
    email: 'egonloli@email.com',
    password: bcrypt.hashSync("egon123", 8),
    createdAt: 'eoje',
    updatedAt: 'eo'
  }
]

const logins = [
  {
    id: 1,
    status: "succes",
    createdAt: "ojejo",
    updatedAt: "je",
    userId: 1
  },
  {
    id: 2,
    status: "success",
    createdAt: "ojejo",
    updatedAt: "je",
    userId: 1
  },
  {
    id: 1,
    status: "success",
    createdAt: "ojejo",
    updatedAt: "je",
    userId: 2
  }
]

const avatars = [
  {
    id: 1,
    height: 250,
    width: 55,
    src: "item1.jpg",
    createdAt: "jo",
    updatedAt: "90",
    userId: 1
  },
  {
    id: 2,
    height: 250,
    width: 55,
    src: "item2.jpg",
    createdAt: "jo",
    updatedAt: "90",
    userId: 2
  }
]

const photos = [
  {
    id: 1,
    caption: "vacation in bahamas",
    height: 500,
    width: 555,
    createdAt: "jo",
    updatedAt: "90",
    src: "item1.jpg",
    userId: 1
  },
  {
    id: 2,
    caption: "vacation in durres",
    height: 500,
    width: 555,
    createdAt: "jo",
    updatedAt: "90",
    src: "item1.jpg",
    userId: 2
  },
  {
    id: 3,
    caption: "vacation in kosova",
    height: 500,
    width: 555,
    createdAt: "jo",
    updatedAt: "90",
    src: "item1.jpg",
    userId: 1
  }
]

const comments = [
  {
    id: 1,
    content: "hi i am jurgen",
    createdAt: "jo",
    updatedAt: "393",
    userId: 1,
    photoId: 2
  },
  {
    id: 2,
    content: "hi i am egon",
    createdAt: "jo",
    updatedAt: "393",
    userId: 2,
    photoId: 1
  }
]

const commentLikes = [
  {
    id: 1,
    createdAt: "jo",
    updatedAt: "393",
    userId: 1,
    commentId: 2
  },
  {
    id: 2,
    createdAt: "jo",
    updatedAt: "393",
    userId: 2,
    commentId: 1
  }
]

const photoLikes = [
  {
    id: 1,
    createdAt: "jo",
    updatedAt: "393",
    userId: 1,
    photoId: 2
  },
  {
    id: 2,
    createdAt: "jo",
    updatedAt: "393",
    userId: 2,
    photoId: 1
  }
]

async function createStuff () {

  await prisma.commentlike.deleteMany()
  await prisma.postlike.deleteMany()
  await prisma.login.deleteMany()
  await prisma.avatar.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.photo.deleteMany()
  await prisma.user.deleteMany()

  for (const user of users) {
    await prisma.user.create({ data: user })
  }

  for (const photo of photos) {
    await prisma.photo.create({ data: photo })
  }

  for (const comment of comments) {
    await prisma.comment.create({ data: comment })
  }

  for (const avatar of avatars) {
    await prisma.avatar.create({ data: avatar })
  }

  for (const login of logins) {
    await prisma.login.create({ data: login })
  }

  for (const photoLike of photoLikes) {
    await prisma.photoLike.create({ data: photoLike })
  }

  for (const commentLike of commentLikes) {
    await prisma.commentLike.create({ data: commentLike })
  }

}

createStuff()