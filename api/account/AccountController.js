const accountService = require('./AccountService.js');
const utilitisService = require('../../services/utilitis.js');
const config = require('../../config/index.js')
const nodemailer = require('nodemailer')

module.exports = {
    signup,
    login,
    logout,
    getLoggedInAccount,
    update,
    remove
    // get,
    // query,
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body
    await accountService.signup(name, email, password)
    const { account, token } = await accountService.login(email, password)
    utilitisService.setAuthCookie(res, token)

    if (config.n8n.webhookUrl && config.n8n.webhookUrl.startsWith('http')) {
      // n8n for local development
      fetch(config.n8n.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      }).catch(err => console.error('n8n webhook failed:', err))
    } else {
      // Nodemailer for production
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      })
      transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Welcome!',
        text: `Hi ${name}, thanks for signing up!`
      }).then(() => console.log('Email sent!')).catch(err => console.error('Email failed:', err.message))
    }

    res.status(201).json({ message: 'Account created and logged in', account });
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ message: error.message || 'Failed to create account' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const { account, token } = await accountService.login(email, password)
    utilitisService.setAuthCookie(res, token)
    res.status(200).json({ message: 'Account logged in', account });
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({ message: error.message || 'Failed to log in' });
  }
}

function logout(req, res) {
    try {
      utilitisService.clearAuthCookie(res);
      res.status(200).json({ message: 'Account logged out' });
    } catch (error) {
      const status = error.status || 500
      res.status(status).json({ message: error.message || 'Failed to log out' });
    }
}

async function getLoggedInAccount(req, res) {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }
        const account = await accountService.getLoggedInAccount(token)
        if (!account) {
            return res.status(404).json({ message: 'account not found' })
        }
        return res.json({ message: 'account logged in', account })
    } catch (error) {
        const status = error.status || 500
        return res.status(status).json({ message: error.message || 'account not found' })
    }
}

async function update(req, res) {
  try {
    const { id } = req.params
    const { name, email } = req.body
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    const updatedAccount = await accountService.update(id, updateData);
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Account not found' })
    }
    return res.json({ message: 'Account updated successfully', updatedAccount })
  } catch (error) {
      const status = error.status || 500
      return res.status(status).json({ message: error.message || 'Server error while updating account' })
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params
    const deletedAccount = await accountService.remove(id);
    if (!deletedAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    return res.json({ message: 'Account deleted successfully', deletedAccount })
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error while deleting account' })
  }
}
// //////
// async function get(req, res) {
//   try{
//       const { id } = req.params
//       const account = await accountService.get(id)
//       if (!account) {
//           return res.status(404).json({ message: 'Account doesnt found' })
//       }
//       return res.json({ account })
//   } catch (error) {
//       const status = error.status || 500
//       return res.status(status).json({ message: error.message || 'Account not found' })
//   }
// }

// async function query(req, res) {
//   try{
//     const accounts = await accountService.query()
//     if (!accounts) {
//         return res.status(404).json({ message: 'Did not found any account' })
//     }
//     return res.json({ accounts })
//   } catch (error) {
//       const status = error.status || 500
//       return res.status(status).json({ message: error.message || 'Accounts not found' })
//   }
// }