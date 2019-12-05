//-------------------Packages---------------------//
const express = require("express");
const fs = require ("fs")
const app = express();
const pokemonroute = express.Router();
app.use('/pokemon', pokemonroute);
app.use(express.json());

//-----------------------------------------------//
const Pokemondata = JSON.parse(fs.readFileSync("./pokedex.json", "utf-8"));
//--------------MiddleWares---------------------//
const getpokemondata= (req,res)=>{
    const name = req.params.pid;
    console.log(name)
    const Pokemon = Pokemondata.find(el => el.name.english === name); 
    
    res.status(200)
    .json({
      status: 'success',
      image: __dirname+'\\images\\'+Pokemon.id,
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
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//-----------------------------------------------//
