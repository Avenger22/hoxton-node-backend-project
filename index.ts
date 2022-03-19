// #region 'Importing and configuration of Prisma'
import express from 'express'
import cors from 'cors'
import {  Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

const app = express()
app.use(cors())
app.use(express.json())
// #endregion


// #region 'Helper functions'
function createToken (id: number) {
  // @ts-ignore
  return jwt.sign({ id: id }, process.env.MY_SECRET, { expiresIn: '5h' })
}

async function getUserFromToken (token: string) {
  
  // @ts-ignore
  const decodedData = jwt.verify(token, process.env.MY_SECRET)
  
  // @ts-ignore
  const user = await prisma.user.findUnique({ where: { id: decodedData.id }, 
    
    include: {
      logins: true,
      avatar: true,
      photos: true,
      comments: true, 
      photosLiked: { include: { photo: true } }, 
      commentsLiked: { include: { comment: true } },
      //@ts-ignore
      followedBy: { include: { follower: true } },
      following: { include: { following: true } },
    }

  })
  
    return user

}
// #endregion


// #region 'Auth End Points'
app.post('/login', async (req, res) => {

  const { email, password } = req.body

  try {

    const user = await prisma.user.findUnique({ where: { email: email }, 
      
      include: {
        logins: true,
        avatar: true,
        photos: true,
        comments: true, 
        photosLiked: { include: { photo: true } }, 
        commentsLiked: { include: { comment: true } },
        //@ts-ignore
        followedBy: { include: { follower: true } },
        following: { include: { following: true } },
      } })
    
    // @ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password)

    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) })
    } 
    
    else {
      throw Error('ERROR')
    }

  } 
  
  catch (err) {
    res.status(400).send({ error: 'User/password invalid.' })
  }

})

app.get('/validate', async (req, res) => {

  const token = req.headers.authorization || ''

  try {
    // @ts-ignore
    const user = await getUserFromToken(token)
    res.send(user)
  } 
  
  catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message })
  }

})
// #endregion


// #region "REST API end points"

// #region 'users endpoints'
app.get('/users', async (req, res) => {

  try {

    const users = await prisma.user.findMany({
      include: { 
        photos: true, logins: true, 
        comments:true, 
        avatar: true, 
        commentsLiked: { include: {comment: true} },
        photosLiked:  { include: { photo: true} },
        followedBy: { include: { follower: true } },
        following:  { include: { following: true } }
      }
    })

   
    // const numberOfCommentsCreated = 0 
    // const numberOfCommentsLiked = 0
    // const numberOfPhotosLikes = 0
    // const numberOfFollowers = 0 
    // const numberOfFollowing = 0

    res.send(users)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<pre>${error.message}</pre>`)
  }

})

app.get('/users/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    const user = await prisma.user.findFirst({
      where: { id: idParam },
      include: { 
        photos: true, logins: true, 
        comments:true, 
        avatar: true, 
        commentsLiked: { include: {comment: true} },
        photosLiked:  { include: { photo: true} },
        followedBy: { include: { follower: true } },
        following:  { include: { following: true } }
      }
    })

    let countPhotosCreated = 0
    let countCommentsCreated = 0
    let countCommentsLiked = 0
    let countPhotosLiked = 0
    let countFollowers = 0
    let countFollowing = 0
    let countLogins = 0

    //@ts-ignore
    for (const photo of user.photos) {
      countPhotosCreated++
    }

    //@ts-ignore
    for (const comment of user.comments) {
      countCommentsCreated++
    }

    //@ts-ignore
    for (const commentLiked of user.commentsLiked) {
      countCommentsLiked++
    }

    //@ts-ignore
    for (const photoLiked of user.photosLiked) {
      countPhotosLiked++
    }

    //@ts-ignore
    for (const following of user.following) {
      countFollowing++
    }

    //@ts-ignore
    for (const follower of user.followedBy) {
      countFollowers++
    }

    //@ts-ignore
    for (const logins of user.logins) {
      countLogins++
    }

    const updatedUserWithCounts = await prisma.user.update({

      where: { id: idParam },

      data: {
        //@ts-ignore
        countPhotosCreated: countPhotosCreated,
        countCommentsCreated: countCommentsCreated,
        countCommentsLiked: countCommentsLiked,
        countPhotosLiked: countPhotosLiked,
        countFollowers: countFollowers,
        countFollowing: countFollowing,
        countLogins: countLogins
      },

      include: { 
        photos: true, logins: true, 
        comments:true, 
        avatar: true, 
        commentsLiked: { include: {comment: true} },
        photosLiked:  { include: { photo: true} },
        followedBy: { include: { follower: true } },
        following:  { include: { following: true } }
      }

    })

    if (user) {
      res.send(updatedUserWithCounts)
    } 
    
    else {
      res.status(404).send({ error: 'User not found.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/users', async (req, res) => {
    
  const { 
    firstName, 
    lastName, 
    userName, 
    gender,
    birthday,
    phoneNumber,
    email,
    password,
    createdAt,
    updatedAt
   } = req.body
  
  try {

    // generate a hash also salts the password with 8 symbols from their password
    const hashedPassword = bcrypt.hashSync(password, 15)

    const newUser = {
      firstName: firstName, 
      lastName: lastName,
      userName: userName,
      gender: gender,
      birthday: birthday,
      phoneNumber: phoneNumber,
      email: email,
      password: hashedPassword,
      createdAt: createdAt,
      updatedAt: updatedAt
    }

    const userCheck = await prisma.user.findFirst({ where: { email: newUser.email } })
    
    if (userCheck) {
      res.status(404).send({ error: 'User has an already registered email try different email.' })
    }

    else {

      try {

        const createdUser = await prisma.user.create({data: newUser})
        
        const getFullUser = await prisma.user.findFirst({ 
          where: {id: createdUser.id}, 
          include: { 
          photos: true, logins: true, 
          comments:true, 
          avatar: true, 
          commentsLiked: { include: {comment: true} },
          photosLiked:  { include: { photo: true} },
          followedBy: { include: { follower: true } },
          following:  { include: { following: true } }
        } 
      })

        res.send({ getFullUser, token: createToken(createdUser.id) } )
      
      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/users/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id

  try {

    // check that they are signed in
    const user = await getUserFromToken(token)

    //@ts-ignore
    const belongsToUser = await prisma.user.findFirst({where: {id: Number(idParam)}})
    
    //@ts-ignore
    const result = belongsToUser.id === user.id
    
    if (user && result) {

      await prisma.user.delete({ 
        where: { id: Number(idParam) }
      })

      const users = await prisma.user.findMany({
        include: { 
        photos: true, logins: true, 
        comments:true, 
        avatar: true, 
        commentsLiked: { include: {comment: true} },
        photosLiked:  { include: { photo: true} },
        followedBy: { include: { follower: true } },
        following:  { include: { following: true } }
      } 
    })


      res.send(users)

    }

    else {
      res.status(404).send({ error: 'user not found or you cant delete this user.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/users/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id;
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)

    if (user) {

      const { 
        firstName, 
        lastName, 
        userName, 
        gender,
        birthday,
        phoneNumber,
        email,
        password,
        createdAt,
        updatedAt
      } = req.body

      const hashedPassword = bcrypt.hashSync(password, 15)

      const userData = {
        firstName: firstName, 
        lastName: lastName,
        userName: userName,
        gender: gender,
        birthday: birthday,
        phoneNumber: phoneNumber,
        email: email,
        password: hashedPassword,
        createdAt: createdAt,
        updatedAt: updatedAt
      }

      try {

        const user = await prisma.user.update({

          where: {
            id: Number(idParam),
          },

          data: userData

        })

        const userFull = await prisma.user.findFirst({
          where: {id: user.id},
          include: { 
          photos: true, logins: true, 
          comments:true, 
          avatar: true, 
          commentsLiked: { include: {comment: true} },
          photosLiked:  { include: { photo: true} },
          followedBy: { include: { follower: true } },
          following:  { include: { following: true } }
        } 
      })

        res.send(userFull)

      } 
  
      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error("Boom")
    }

  }

  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region 'photos endpoints'
app.get('/photos', async (req, res) => {

  try {

    const photos = await prisma.photo.findMany({ 
      include: 
        { userWhoCreatedIt: true, 
          comments: true, 
          usersWhoLikedIt: { include: { user:true } } 
        } 
      })
    
      res.send(photos)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/photos/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    const photo = await prisma.photo.findFirst({
      where: { id: idParam },
      include: 
        { userWhoCreatedIt: true, 
          comments: true, 
          usersWhoLikedIt: { include: { user:true } } 
        } 
      })

    if (photo) {
      res.send(photo)
    } 
    
    else {
      res.status(404).send({ error: 'photo not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/photos', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    caption, 
    height, 
    width, 
    createdAt, 
    updatedAt, 
    src, 
    userId 
  } = req.body
  
  const newPhoto = {
    caption: caption,
    height: height,
    width:  width,
    createdAt: createdAt,
    updatedAt: updatedAt,
    src:  src,
    userId: userId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const photoCheck = await prisma.photo.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdPhoto = await prisma.photo.create({data: newPhoto})
        
        const createdPhotoFull = await prisma.photo.findFirst({
          where: { id: createdPhoto.id },
          include: { 
          userWhoCreatedIt: true, 
          comments: true, 
          usersWhoLikedIt: { include: { user:true } } 
          }  

        })

        res.send(createdPhotoFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'User is not logged in no auth.' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/photos/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id

  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const photoMatch = await prisma.photo.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const photoUserCheck = photoMatch.userId === user.id

    if (user && photoUserCheck) {

      const photoDeleted = await prisma.photo.delete({ 
        where: { id: Number(idParam) }
      })

      const photos = await prisma.photo.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(photos)

    }

    else {
      res.status(404).send({ error: 'photo not found, or the photo doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/photos/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  
  const idParam = Number(req.params.id)
  
  const { 
    caption, 
    height, 
    width, 
    createdAt, 
    updatedAt, 
    src, 
    userId 
  } = req.body

  const updatedPhoto = {
    caption: caption,
    height: height,
    width:  width,
    createdAt: createdAt,
    updatedAt: updatedAt,
    src:  src,
    userId: userId
  }

  try {

    const user = await getUserFromToken(token)
    
    const photoMatch = await prisma.photo.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = photoMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const photo = await prisma.photo.update({

          where: {
            id: user.id
          },

          data: updatedPhoto

        })

        const photoFull = await prisma.photo.findFirst({ 
          where: { id: photo.id },
          include: { 
          userWhoCreatedIt: true, 
          comments: true, 
          usersWhoLikedIt: { include: { user:true } } 
          } 

        })

        res.send(photoFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  } 
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "comments endpoints"
app.get('/comments', async (req, res) => {

  try {

    const comments = await prisma.comment.findMany({ 
      include: 
        { photo: true, 
          userWhoCreatedIt: true, 
          usersWhoLikedIt: { include: { user:true } } 
        } 
      })

    res.send(comments)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/comments/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {


    const comment = await prisma.comment.findFirst({
      where: { id: idParam },
      include: 
        { photo: true, 
          userWhoCreatedIt: true, 
          usersWhoLikedIt: { include: { user:true } } 
        } 
      })
  

    if (comment) {
      res.send(comment)
    } 
    
    else {
      res.status(404).send({ error: 'comment not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/comments', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    content, 
    createdAt, 
    updatedAt, 
    userId, 
    photoId
  } = req.body
  
  const newComment = {
    content: content,
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    photoId: photoId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const commentCheck = await prisma.comment.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdComment = await prisma.comment.create({data: newComment})
        
        const createdCommentFull = await prisma.comment.findFirst({
          where: { id: createdComment.id },
          include: { 
          photo: true, 
          userWhoCreatedIt: true, 
          usersWhoLikedIt: { include: { user:true } } 
          } 
        })

        res.send(createdCommentFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized for this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/comments/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const commentMatch = await prisma.comment.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const commentUserCheck = commentMatch.userId === user.id

    if (user && commentUserCheck) {

      const commentDeleted = await prisma.comment.delete({ 
        where: { id: Number(idParam) }
      })

      const comments = await prisma.comment.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(comments)

    }

    else {
      res.status(404).send({ error: 'comment not found, or the comment doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/comments/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    content, 
    createdAt, 
    updatedAt, 
    userId, 
    photoId
  } = req.body
  
  const updatedComment = {
    content: content,
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    photoId: photoId
  }

  try {

    const user = await getUserFromToken(token)
    
    const commentMatch = await prisma.comment.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = commentMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const commentUpdated = await prisma.comment.update({

          where: {
            id: user.id,
          },

          data: updatedComment

        })

        const commentUpdatedFull = await prisma.comment.findFirst({ 
          where: { id: commentUpdated.id },
          include: { 
          photo: true, 
          userWhoCreatedIt: true, 
          usersWhoLikedIt: { include: { user:true } } 
          } 
        })

        res.send(commentUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "logins endpoints"
app.get('/logins', async (req, res) => {

  try {

    const logins = await prisma.login.findMany({ 
      include: 
        { user: true } 
      })

    res.send(logins)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/logins/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {


    const login = await prisma.login.findFirst({
      where: { id: idParam },
      include: 
        { user: true } 
      })
  
    if (login) {
      res.send(login)
    } 
    
    else {
      res.status(404).send({ error: 'login not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/logins', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    status, 
    createdAt, 
    userId, 
  } = req.body
  
  const newLogin = {
    status: status,
    createdAt: createdAt,
    userId: userId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const loginCheck = await prisma.login.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdLogin = await prisma.login.create({data: newLogin})
        
        const createdLoginFull = await prisma.login.findFirst({
          where: { id: createdLogin.id },
          include: { user: true }
        })

        res.send(createdLoginFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized for this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/logins/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const loginMatch = await prisma.login.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const loginUserCheck = loginMatch.userId === user.id

    if (user && loginUserCheck) {

      const loginDeleted = await prisma.login.delete({ 
        where: { id: Number(idParam) }
      })

      const logins = await prisma.login.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(logins)

    }

    else {
      res.status(404).send({ error: 'login not found, or the login doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/logins/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    status, 
    createdAt,
    userId
  } = req.body
  
  const updatedLogin = {
    status: status,
    createdAt: createdAt,
    userId: userId  
  }

  try {

    const user = await getUserFromToken(token)
    
    const loginMatch = await prisma.login.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = loginMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const loginUpdated = await prisma.login.update({

          where: {
            id: user.id,
          },

          data: updatedLogin

        })

        const loginUpdatedFull = await prisma.login.findFirst({
          where: { id: loginUpdated.id },
          include: { user: true }
        })

        res.send(loginUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "avatars endpoints"
app.get('/avatars', async (req, res) => {

  try {

    const avatars = await prisma.avatar.findMany({ 
      include: 
        { user: true } 
      })

    res.send(avatars)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/avatars/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {


    const avatar = await prisma.avatar.findFirst({
      where: { id: idParam },
      include: 
        { user: true } 
      })
  

    if (avatar) {
      res.send(avatar)
    } 
    
    else {
      res.status(404).send({ error: 'avatar not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/avatars', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    height, 
    width, 
    src, 
    createdAt, 
    updatedAt,
    userId
  } = req.body
  
  const newAvatar = {
    height: height,
    width: width,
    src: src,
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const avatarCheck = await prisma.avatar.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdAvatar = await prisma.avatar.create({data: newAvatar})
        
        const createdAvatarFull = await prisma.avatar.findFirst({
          where: { id: createdAvatar.id },
          include: { user: true } 
          })

        res.send(createdAvatarFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized for this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/avatars/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const commentMatch = await prisma.comment.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const commentUserCheck = commentMatch.userId === user.id

    if (user && commentUserCheck) {

      const commentDeleted = await prisma.comment.delete({ 
        where: { id: Number(idParam) }
      })

      const comments = await prisma.comment.findMany( { where: { userId: user.id }, include: { userWhoCreatedIt: true, usersWhoLikedIt: { include: { user: true} }, photo: true } })

      // res.send(orderDeleted)
      res.send(comments)

    }

    else {
      res.status(404).send({ error: 'comment not found, or the comment doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/avatars/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    height, 
    width, 
    src, 
    createdAt, 
    updatedAt,
    userId
  } = req.body
  
  const updatedAvatar = {
    height: height,
    width: width,
    src: src,
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId
  }

  try {

    const user = await getUserFromToken(token)
    
    const avatarMatch = await prisma.avatar.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = avatarMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const avatarUpdated = await prisma.avatar.update({

          where: {
            id: user.id,
          },

          data: updatedAvatar

        })

        const avatarUpdatedFull = await prisma.avatar.findFirst({
          where: { id: avatarUpdated.id },
          include: { user: true } 
          })

        res.send(avatarUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "commentLikes endpoints"
app.get('/commentLikes', async (req, res) => {

  try {

    const commentLikes = await prisma.commentLike.findMany({ 
      include: 
        { user: true, comment: true } 
      })

    res.send(commentLikes)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/commentLikes/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {


    const commentLike = await prisma.commentLike.findFirst({ 
      where: { id: idParam },
      include: 
        { user: true, comment: true } 
      })
  

    if (commentLike) {
      res.send(commentLike)
    } 
    
    else {
      res.status(404).send({ error: 'commentLike not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/commentLikes', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    createdAt, 
    updatedAt, 
    userId, 
    commentId  
  } = req.body
  
  const newCommentLike = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    commentId: commentId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const commentLikeCheck = await prisma.commentLike.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdCommentLike = await prisma.commentLike.create({data: newCommentLike})
        
        const createdCommentLikeFull = await prisma.commentLike.findFirst({
          where: { id: createdCommentLike.id },
          include: {
            user: true, comment: true
          }
        })

        res.send(createdCommentLikeFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized for this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/commentLikes/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const commentLikeMatch = await prisma.commentLike.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const commentLikeUserCheck = commentLikeMatch.userId === user.id

    if (user && commentLikeUserCheck) {

      const commentLikeDeleted = await prisma.commentLike.delete({ 
        where: { id: Number(idParam) }
      })

      const commentLikes = await prisma.commentLike.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(commentLikes)

    }

    else {
      res.status(404).send({ error: 'commentLike not found, or the commentLike doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/commentLikes/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    createdAt, 
    updatedAt, 
    userId, 
    commentId  
  } = req.body
  
  const updatedCommentLike = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    commentId: commentId
  }

  try {

    const user = await getUserFromToken(token)
    
    const commentLikeMatch = await prisma.commentLike.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = commentLikeMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const commentLikeUpdated = await prisma.commentLike.update({

          where: {
            id: user.id,
          },

          data: updatedCommentLike

        })

        const commentLikeUpdatedFull = await prisma.commentLike.findFirst({
          where: { id: commentLikeUpdated.id },
          include: {
            user: true, comment: true
          }
        })

        res.send(commentLikeUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "photoLikes endpoints"
app.get('/photoLikes', async (req, res) => {

  try {

    const photoLikes = await prisma.photoLike.findMany({ 
      include: 
        { user: true, photo: true } 
      })

    res.send(photoLikes)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/photoLikes/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {


    const photoLike = await prisma.photoLike.findFirst({ 
      where: { id: idParam },
      include: 
        { user: true, photo: true } 
      })
  

    if (photoLike) {
      res.send(photoLike)
    } 
    
    else {
      res.status(404).send({ error: 'photoLike not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/photoLikes', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    createdAt, 
    updatedAt, 
    userId, 
    photoId  
  } = req.body
  
  const newPhotoLike = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    photoId: photoId
  }

  try {

    const user = await getUserFromToken(token)

    //@ts-ignore
    // const photoLikeCheck = await prisma.photoLike.findFirst({ where: { userId: user.id }} )
    
    if (user) {

      try {

        const createdPhotoLike = await prisma.photoLike.create({data: newPhotoLike})
        
        const createdPhotoLikeFull = await prisma.photoLike.findFirst({
          where: { id: createdPhotoLike.id },
          include: {
            user: true, photo: true
          }
        })

        res.send(createdPhotoLikeFull)
        
      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized to do this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/photoLikes/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const photoLikeMatch = await prisma.photoLike.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const photoLikeUserCheck = photoLikeMatch.userId === user.id

    if (user && photoLikeUserCheck) {

      const photoLikeDeleted = await prisma.photoLike.delete({ 
        where: { id: Number(idParam) }
      })

      const photoLikes = await prisma.photoLike.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(photoLikes)

    }

    else {
      res.status(404).send({ error: 'photoLike not found, or the photoLike doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/photoLikes/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    createdAt, 
    updatedAt, 
    userId, 
    photoId  
  } = req.body
  
  const updatedPhotoLike = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    userId: userId,
    photoId: photoId
  }

  try {

    const user = await getUserFromToken(token)
    
    const photoLikeMatch = await prisma.photoLike.findFirst( { where: {id: idParam} } )
    
    //@ts-ignore
    const belongsToUser = photoLikeMatch.userId === user.id
    
    if (user && belongsToUser) {

      try {

        const photoLikeUpdated = await prisma.photoLike.update({

          where: {
            id: user.id,
          },

          data: updatedPhotoLike

        })

        const photoLikeUpdatedFull = await prisma.photoLike.findFirst({
          where: { id: photoLikeUpdated.id },
          include: {
            user: true, photo: true
          }
        })

        res.send(photoLikeUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #region "followers endpoints"
app.get('/followers', async (req, res) => {

  try {

    //@ts-ignore
    const followers = await prisma.follows.findMany({ 
      include: 
        { follower: true, following: true } 
      })

    res.send(followers)

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.get('/followers/:id', async (req, res) => {

  const idParam = Number(req.params.id)

  try {

    //@ts-ignore
    const follower = await prisma.follows.findFirst({ 
      where: { id: idParam },
      include: 
        { follower: true, following: true } 
      })
  

    if (follower) {
      res.send(follower)
    } 
    
    else {
      res.status(404).send({ error: 'followers not found.' })
    }

  }

  catch(error){
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.post('/followers', async (req, res) => {
    
  const token = req.headers.authorization || ''
  
  const { 
    createdAt, 
    updatedAt, 
    followerId, 
    followingId  
  } = req.body
  
  const newFollower = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    followerId: followerId,
    followingId: followingId
  }

  try {

    const user = await getUserFromToken(token)
    
    if (user) {

      try {

        //@ts-ignore
        const createdFollower = await prisma.follows.create({data: newFollower})
        
        //@ts-ignore
        const createdFollowerFull = await prisma.follows.findFirst({ 
        where: { id: createdFollower.id },
        include: 
          { follower: true, following: true } 
        })
        
        res.send(createdFollowerFull)

      }

      catch(error) {
        //@ts-ignore
        res.status(400).send(`<prev>${error.message}</prev>`)
      }

    }

    else {
      res.status(404).send({ error: 'user is not authorized to do this' })
    }


  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.delete('/followers/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = req.params.id
  
  try {

    // check that they are signed in
    const user = await getUserFromToken(token)
    const followerMatch = await prisma.follows.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const followerUserCheck = followerMatch.userId === user.id

    if (user && followerUserCheck) {

      const photoLikeDeleted = await prisma.photoLike.delete({ 
        where: { id: Number(idParam) }
      })

      const photoLikes = await prisma.photoLike.findMany( { where: { userId: user.id } } )

      // res.send(orderDeleted)
      res.send(photoLikes)

    }

    else {
      res.status(404).send({ error: 'photoLike not found, or the photoLike doesnt belong to that user to be deleted.' })
    }

  }

  catch(error) {
    //@ts-ignore
    res.status(400).send(`<prev>${error.message}</prev>`)
  }

})

app.patch('/followers/:id', async (req, res) => {

  const token = req.headers.authorization || ''
  const idParam = Number(req.params.id);
  
  const { 
    createdAt, 
    updatedAt, 
    followerId, 
    followingId  
  } = req.body
  
  const updatedFollower = {
    createdAt: createdAt,
    updatedAt: updatedAt,
    followerId: followerId,
    followingId: followingId
  }

  try {

    const user = await getUserFromToken(token)

    const followerMatch = await prisma.follows.findUnique( { where: {id: Number(idParam)} } )

    //@ts-ignore
    const followerUserCheck = followerMatch.userId === user.id
            
    if (user && followerUserCheck) {

      try {

        //@ts-ignore
        const followerUpdated = await prisma.follows.update({

          where: {
            id: user.id,
          },

          data: updatedFollower

        })

        //@ts-ignore
        const followerUpdatedFull = await prisma.follows.findFirst({ 
          where: { id: followerUpdated.id },
          include: 
            { follower: true, following: true } 
          })
          
        res.send(followerUpdatedFull)

      }

      catch(error) {
        res.status(404).send({message: error})
      }

    }

    else {
      throw Error('Error!')
    }

  }  
  
  catch(error) {
    res.status(404).send({message: error})
  }

})
// #endregion

// #endregion


app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})