# Batch Mailer

This is a simple SPA to send batch mails stored as JSON, using
[SmtpJS](www.smtpjs.com).
Mails must be stored in this format:

```
{
  "mails": [
    { "recipients": [ string ],
      "subject": string,
      "message": string,
    },
    ...
  ]
}
```

SMTP Servers are typically configured to disallow relaying to other mail
servers without authentication.
Due to this, the batch mailer requires token based authorization from SmtpJS.

# Meta Information

The software is authored by Alexander Matz and published under MIT License.
It uses the following third party libraries:

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/)
- [SmtpJS](https://www.smtpjs.com/) as the underlying relay service
