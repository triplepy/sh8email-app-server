# sh8email-app-server

Application server of [sh8.email](https://sh8.email) which is a entirely rewritten version with Node.js

# How Run the Tests?

Run `npm test`.

# API Specification

- Create a mail
  - POST /api/mails/create
  - Body required
    - A [mail](#mail-model-specification) represented as JSON
  - Response
    - Success: JSON representation of the saved [mail](#mail-model-specification)
    - Fail: 500 Error
- Show mails list
  - GET /api/recipient/*:recipient*/mails
  - Response
    - Success: List of [mail](#mail-model-specification)s represented as JSON
      ```javascript
      [mail1, mail2, mail3, ...]
      ```
      - There is `isSecret` boolean field
      - Respond empty array when there is no mail which is matched query
    - Fail
      - Respond 404 Not Found if the 'recipient' params is missing
- Show a non-secret mail
  - GET /api/recipient/*:recipient*/mails/*:id*
  - Response
    - Success: A [mail](#mail-model-specification) represented as JSON
    - Fail
      - Respond 404 Not Found if the 'recipient' params is missing or the requested mail is not present
- Show a secret mail
  - GET /api/recipient/*:recipient*/mails/*:id*
  - Header required
    - Sh8-Secret-Code: the secretCode
  - Response
    - Success: A [mail](#mail-model-specification) represented as JSON
    - Fail
      - Respond 404 Not Found if the 'recipient' params is missing or the requested mail is not present
      - Respond 403 Forbidden if the secretCode is invalid

## Mail Model Specification

We use mail model which is based on [mail model of nodemailer/mailparser](https://nodemailer.com/extras/mailparser/#mail-object).
But there is a difference representing `address` object likes `from`, `to`, `cc` and `bcc`.
We removed `html`, `text` property of `address` object and spreaded `value` property. Therefore the `address` object is shown as below example.

```javascript
// Representation of `to` property in address object
[
  {
    address: 'andris+123@kreata.ee',
    name: 'Andris Reinman'
  },
  {
    address: 'andris.reinman@gmail.com',
    name: ''
  }
]
```

Also, there are some additional properties.
- isSecret: Boolean. `true` if the mail is a secret mail, otherwise `false`.
