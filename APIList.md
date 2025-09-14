# DevTinder APIs

## authRouter
- post /signup
- post /login
- post /logout

## profileRouter
- get /profile/view
- patch /profile/edit
- patch /profile/password

## connectionRequestRouter
- post /request/send/:status/:userId
   post /request/send/interested/:userId
   post /request/send/ignored/:userId

- post /request/review/:status/:requestId
   post /request/review/accepted/:requestId
   post /request/review/rejected/:requestid

## userRouter
- get /user/connections
- get /user/requests
- get /user/feed - gets you the profiles of other users


statuses: ignore, interested, accepted, rejected