const accountController = require('./AccountController.js');

module.exports.connectAccountRoutes = (app) => {
    const endPoint = 'api/auth';
    app.post(`/${endPoint}/signup`, accountController.signup)
    app.post(`/${endPoint}/login`, accountController.login)
    app.post(`/${endPoint}/logout`, accountController.logout)

    const accountEndPoint = 'api/account';
    // app.get(`/${accountEndPoint}/query`, accountController.query)
    // app.get(`/${accountEndPoint}/:id`, accountController.get)
    app.get(`/${accountEndPoint}`, accountController.getLoggedInAccount)
    app.put(`/${accountEndPoint}/:id`, accountController.update)
    app.delete(`/${accountEndPoint}/:id`, accountController.remove)
    app.get('/test-email', async (req, res) => {
        try {
          const nodemailer = require('nodemailer')
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          })
          const result = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: 'Test!',
            text: 'Nodemailer works!'
          })
          res.json({ message: 'Email sent!', result })
        } catch (err) {
          res.json({ message: 'Email failed', error: err.message })
        }
      })
}