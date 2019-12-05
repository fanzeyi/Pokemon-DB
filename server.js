//-------------------Packages---------------------//
const express = require("express");
const fs = require("fs");
const app = express();
const pokemonroute = express.Router();
app.use("/pokemon", pokemonroute);
app.use(express.json());
//-----------------------------------------------//
function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
function findid(id){
  if (id < 10) return "00" + id;
  else if (id < 100) return "0" + id;
  else return id;
}
//-----------------------------------------------//
const Pokemondata = JSON.parse(fs.readFileSync("./pokedex.json", "utf-8"));
//--------------MiddleWares---------------------//
const getpokemondata = (req, res) => {
  const name = req.params.pid;
  
  
  console.log(name);
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  var Pokemon = Pokemondata.find(el => el.name.english === nameCapitalized);
  
  if (!Pokemon)
    return res
      .status(404)
      .json({ status: "failed", message: "Data not found" });

  var id = findid(Pokemon.id);
  console.log(id);
  Pokemon={...Pokemon,image: "http://www.serebii.net/pokemongo/pokemon/" + id+".png",}
  res.status(200).json({
    status: "success",
    data: {
      Pokemon
    }
  });
};
const pokemonrandomizer =(req,res)=>{
  var pokemon =[] ;
  for (let i=0; i<6; i+=1) {
    var temppokemon = Pokemondata[Math.floor(Math.random() * 809)]
    var id = findid(temppokemon.id);
    temppokemon = {...temppokemon,image :"http://www.serebii.net/pokemongo/pokemon/" +id+".png",}
    pokemon.push(temppokemon);
   }
   return pokemon;
}
const home=(req,res)=>{
 const pokemon = pokemonrandomizer();
  res.status(200)
  .json({
    status: "success",
    data: {
      pokemon
    }
  });
}
//----------------------------------------------//
pokemonroute.route("/random").get(home);
pokemonroute.route("/:pid").get(getpokemondata);


//-------------------Server---------------------//
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//-----------------------------------------------//
