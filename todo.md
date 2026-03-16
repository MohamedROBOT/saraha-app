*auth
 -verify account
 -forget password

*user 
 -get profile  ✔
 -update profile
 -delete profile [soft-delete]

*messages
 -send message [anonymous, public]
 -get all messages
 -get specific message
 -get messages to related profile

*tokens (session 6 on my pc) ✔
 -refresh tokens ✔

*middlewares
 -authentications  [login-successfully] >> with valid token
 -authorization > access APIs >>Check user - admin
 -validation (Joi - Zod) *layer*
 -file upload [upload-pictures (profile)] [multer] (handle rollback)
