# DC-Backend API
Demo-Commerce-Backend (dc-backend) node api

### NOTE
1. The app won't start unless you provide all required env. variables as indicated in the app.ini file. All referenced 
variables i.e. those in to form ${VAR_NAME} need to be passed via an upper file or through env variables. 

Check [Configu Docs](https://github.com/mernxl/configu) for more Information.

2. Make sure to do a primary build of application first before hitting `start` command. You only need to run `build` before 
`start` when the `build/index.js` file is missing, i.e. after cloning repository or deleting build/index.js.

## Start coding 
### First time only (no build/index.js)
```shell
yarn install
yarn run build

yarn run start
```

### Every other timer (build/index.js present)
```shell
yarn run start
```

🚀 Happy Coding from mernxl 🚀
