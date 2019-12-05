//-------------------Packages---------------------//
const express = require("express");
const fs = require ("fs")
const app = express();
const pokemonroute = express.Router();
app.use('/pokemon', pokemonroute);
app.use(express.json());
// console.log("Charmander" == "charmander")
// console.log("Charmander" === "charmander")

//-----------------------------------------------//

const Pokemondata = JSON.parse(fs.readFileSync("./pokedex.json", "utf-8"));
//--------------MiddleWares---------------------//
const getpokemondata= (req,res)=>{
    const name = req.params.pid;
    console.log(name)
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)

    const Pokemon = Pokemondata.find(el => el.name.english === nameCapitalized); 
    if(!Pokemon)
    return res.status(404).json({status:'failed',message:'Data not found'});
    res.status(200)
    .json({
      status: 'success',
      //image: __dirname+'\\images\\'+Pokemon.id,
      data: {
        Pokemon
      }
    });
}

//----------------------------------------------//
pokemonroute
.route('/:pid')
.get(getpokemondata);
//-------------------Server---------------------//
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//-----------------------------------------------//
