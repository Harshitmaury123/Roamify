const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js")

main()
  .then(() => {
    console.log("connection to DB !!");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const categoryChoices = ["mountains" ,"castle" , "camping" , "pools" ];

function randomIdx(){
  let idx= Math.floor(Math.random()*4);
  return idx;
}

const initDB =async ()=>{
    await listing.deleteMany({})
    
     initData.data=initData.data.map((obj)=>{
      return {...obj , owner : "677d6548f9704c3177865c2e", category : categoryChoices[randomIdx()]};
    })
    await listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();