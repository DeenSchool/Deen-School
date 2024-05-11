const concurrent=require('concurrently')

concurrent([
    {command:'npm start --prefix backend',name:'BACKEND'},
    {command:'npm run dev --prefix frontend',name:'FRONTEND'},
]);