# CloudWeb - Projects
Projects
- Website
- IBE
- E-Payment
- E-Concierge
- Survey
- HGR
- HR
- LOYALTY

```
Check for readme.md updates and make sure your .env is always up to date whenever you have a problem.
```

## Create .env file For Dev. Environment
```
NODE_ENV=development
PROJECT_ENV=development
LOG_ENABLED=true
USE_LOG_FILE=false
OREST_PATH='/orest'
STATIC_URL=https://dev.hotech.dev
OREST_URL=https://dev.hotech.dev/orest
CHAT_URL=http://213.227.132.7:30555/olivechat/guest
REDIS_URL='dev.hotech.systems'
REDIS_PORT=6379
MAIL_SENDER_MAIL=amonrasales@mailing.amonracrm.com
RECAPTCHA_SITE_KEY=6LdAIuQUAAAAALwHWylCHPHbKh2AOn9ISiUIl9rs
RECAPTCHA_SECRET_KEY=6LdAIuQUAAAAAImX8vxYAxf3o9MZhMWEjvAQ4bdS
GOOGLE_MAP_API_KEY=AIzaSyCaU49TyCMquTLSYekygqEgvoY2_D2Mtks
```

## How to run?  | `For Development Environment`
`npm install`

`npm run dev`


## How to build? | `For Product Environment`
Firstly, npm packages must be installed.

`npm run install`

And the build command is executed.

`npm run build`

Before the start command, environment variables must be set for the prod environment.
```
NODE_ENV=production PROJECT_ENV=production OREST_PATH='/orest' OREST_USER_EMAIL=bot@hotech.systems OREST_USER_PASS=hotechbot REDIS_URL=hotech-redis REDIS_PORT=6379 MAIL_SENDER_MAIL=amonrasales@mailing.amonracrm.com RECAPTCHA_SITE_KEY=6LciIeQUAAAAAEIPLi05WE4F0I6vYqxGUGp6Suo RECAPTCHA_SECRET_KEY=6LciIeQUAAAAAAvRyfqZGmt5ITD4rDzRrXiyBBzl GOOGLE_MAP_API_KEY=AIzaSyCaU49TyCMquTLSYekygqEgvoY2_D2Mtks
```

If only GuestWeb will be used.
```
ONLY_GUESTWEB='true'
```

If there is no SSL support in the domain, added this env. 
```
SSL_ENABLED='false'
```

Finally, it is sufficient to run this command.

`
npm run start
`

## Documents
- [WebCMS - Master Doc.](https://docs.google.com/document/d/18MbJqjU5uQB63wkk1R2fCzUvq24dCpWelu0ZWa1qRUo/edit?usp=sharing)
- [Other - Linked Documents](https://docs.google.com/document/d/18MbJqjU5uQB63wkk1R2fCzUvq24dCpWelu0ZWa1qRUo/edit#heading=h.waq246edb1uw)

## For Hotel Installation
- [WebCMS - Hotel Configuration](https://docs.google.com/document/d/1sT4MSNG5WF9I4W8z0RWwA_2Nkd4BgBZLf00MQV2sE1E/edit?usp=sharing)

## Links
For to open the project of the relevant hotel. As subdomain, you need to add shortcode on agency card.

```
E.g: Website: http://demo.localhost:3000/
E.g: IBE: http://demo.localhost:3000/ibe
```

1. Property Register
    - [Profile Page](http://cloud.localhost:3000/embed/register?companyID=115145498&authToken=86b6ab8b-a471-4277-a2cf-08110a627478)
    - [Only Basics](http://cloud.localhost:3000/embed/register?isOnlyBasics=1)
    - [Contact Register](http://cloud.localhost:3000/embed/register?preRegister=1)
1. IBE
   - [Page](http://demo.localhost:3000/booking)    
1. Loyalty Guest Web
    - [Login](http://demo.localhost:3000/guest/login)
    - Edit Teamplate
        - [webcms.settıngs](http://demo.localhost:3000/admin/edit-template?token=xxx-xxx-xxx-xxx)
        - [Width query](http://demo.localhost:3000/admin/edit-template?token=xxx-xxx-xxx-xxx&companyID=999984&query=code:GUESTAPP.FAQ)
1. User Portal
    - [Login](http://cloud.localhost:3000/hup)
1. Page Builder
    - [Builder](http://cloud.localhost:3000/page-builder)


- [Clear Redis Cache All](http://demo.localhost:3000/login?clearall=true)
- [Clear Redis Cache](http://demo.localhost:3000/login?clear=true)
 
 ## Dev Branch
https://webcms.hotech.dev

## Tips

 - set NODE_OPTIONS=--max_old_space_size=8172
