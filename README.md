# sh8email-app-server

Application server of [sh8.email](https://sh8.email) which is a entirely rewritten version with Node.js

# How to run the tests?

Run `npm test`.

# API Specification

- Create a mail
  - POST /api/mails/create
  - Body required
    - A mail represented as JSON (See https://github.com/nodemailer/mailparser#mail-object)
  - Response
    - Success: JSON representation of the saved mail
    - Fail: 500 Error
- Show mails list
  - GET /api/mails?recipient=*recipient*
  - Response
    - Success: List of mails represented as JSON (See https://github.com/nodemailer/mailparser#mail-object)
    ```javascript
    [mail1, mail2, mail3, ...]
    ```
      - Respond empty array when there is no mail which is matched query
    - Fail
      - Respond 400 Bad Request if the 'recipient' GET parameter is missing
- Show a non-secret mail
  - GET /api/mails/*mailId*?recipient=*recipient*
  - Response
    - Success: A mail represented as JSON (See https://github.com/nodemailer/mailparser#mail-object)
    - Fail
      - Respond 400 Bad Request if any GET parameter is missing
      - Respond 404 Not Found if the requested mail is not present
- Show a secret mail
  - GET /api/mails/*mailId*?recipient=*recipient*
  - Header required
    - Sh8-Secret-Code: the secretCode
  - Response
    - Success: A mail represented as JSON (See https://github.com/nodemailer/mailparser#mail-object)
    - Fail
      - Respond 400 Bad Request if any GET parameter is missing
      - Respond 403 Forbidden if the secretCode is invalid
      - Respond 404 Not Found if the requested mail is not present
